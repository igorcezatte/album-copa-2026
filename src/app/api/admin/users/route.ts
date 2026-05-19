import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminSession } from '@/lib/admin'
import { createSupabaseAdmin } from '@/lib/supabase'
import type { AdminUserSummary, AdminUsersList } from '@/types/admin'

const PAGE_SIZE_DEFAULT = 20
const PAGE_SIZE_MAX = 100

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
