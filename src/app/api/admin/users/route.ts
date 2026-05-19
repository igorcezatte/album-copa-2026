import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminSession, isMissingTableError } from '@/lib/admin'
import { createSupabaseAdmin } from '@/lib/supabase'
import type { AdminUserSummary, AdminUsersList } from '@/types/admin'

const PAGE_SIZE_DEFAULT = 20
const PAGE_SIZE_MAX = 100

/**
 * Fallback quando user_profiles ainda não existe: lista users derivados de
 * sticker_entries (sem email/nome). Permite que o admin tenha algo útil
 * antes de rodar a migration v3.
 */
async function listFromStickersOnly(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  page: number,
  pageSize: number
): Promise<Response> {
  const { data, error } = await supabase
    .from('sticker_entries')
    .select('user_id, updated_at, collected_at')
    .is('removed_at', null)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  // Agrega por user_id
  const map = new Map<
    string,
    { count: number; firstSeen: string; lastSeen: string }
  >()
  for (const row of data ?? []) {
    const uid = row.user_id as string
    const updated = (row.updated_at as string | undefined) ?? ''
    const collected = (row.collected_at as string | undefined) ?? ''
    const existing = map.get(uid)
    if (!existing) {
      map.set(uid, {
        count: 1,
        firstSeen: collected || updated,
        lastSeen: updated || collected,
      })
    } else {
      existing.count += 1
      if (collected && collected < existing.firstSeen) {
        existing.firstSeen = collected
      }
      if (updated && updated > existing.lastSeen) {
        existing.lastSeen = updated
      }
    }
  }

  const sorted = Array.from(map.entries()).sort((a, b) =>
    b[1].lastSeen.localeCompare(a[1].lastSeen)
  )
  const total = sorted.length
  const from = (page - 1) * pageSize
  const slice = sorted.slice(from, from + pageSize)

  const users: AdminUserSummary[] = slice.map(([userId, agg]) => ({
    userId,
    email: null,
    name: null,
    imageUrl: null,
    firstSeenAt: agg.firstSeen,
    lastSeenAt: agg.lastSeen,
    stickerCount: agg.count,
  }))

  const result: AdminUsersList = { users, total, page, pageSize }
  return Response.json(result)
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!isAdminSession(session)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(request.url)
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1)
  const pageSize = Math.min(
    PAGE_SIZE_MAX,
    Math.max(1, Number(url.searchParams.get('pageSize') ?? PAGE_SIZE_DEFAULT) || PAGE_SIZE_DEFAULT)
  )
  const search = (url.searchParams.get('search') ?? '').trim()

  const supabase = createSupabaseAdmin()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('user_profiles')
    .select('user_id, email, name, image_url, first_seen_at, last_seen_at', {
      count: 'exact',
    })
    .order('last_seen_at', { ascending: false })
    .range(from, to)

  if (search) {
    // Busca por email OU nome (case-insensitive)
    query = query.or(
      `email.ilike.%${search}%,name.ilike.%${search}%`
    )
  }

  const { data, error, count } = await query
  if (error) {
    if (isMissingTableError(error)) {
      // user_profiles ainda não existe — fallback degradado
      return listFromStickersOnly(supabase, page, pageSize)
    }
    return Response.json({ error: error.message }, { status: 500 })
  }

  const userIds = (data ?? []).map((row) => row.user_id as string)

  // Conta stickers ativos por user_id em uma query separada
  // (Postgres não tem JOIN com aggregate via REST simples)
  const stickerCounts = new Map<string, number>()
  if (userIds.length > 0) {
    const { data: stickerRows, error: stickerErr } = await supabase
      .from('sticker_entries')
      .select('user_id')
      .in('user_id', userIds)
      .is('removed_at', null)

    if (stickerErr) {
      return Response.json({ error: stickerErr.message }, { status: 500 })
    }
    for (const row of stickerRows ?? []) {
      const uid = row.user_id as string
      stickerCounts.set(uid, (stickerCounts.get(uid) ?? 0) + 1)
    }
  }

  const users: AdminUserSummary[] = (data ?? []).map((row) => ({
    userId: row.user_id as string,
    email: (row.email as string | null) ?? null,
    name: (row.name as string | null) ?? null,
    imageUrl: (row.image_url as string | null) ?? null,
    firstSeenAt: row.first_seen_at as string,
    lastSeenAt: row.last_seen_at as string,
    stickerCount: stickerCounts.get(row.user_id as string) ?? 0,
  }))

  const result: AdminUsersList = {
    users,
    total: count ?? 0,
    page,
    pageSize,
  }
  return Response.json(result)
}
