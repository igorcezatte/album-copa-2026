import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminSession, isMissingTableError } from '@/lib/admin'
import { createSupabaseAdmin } from '@/lib/supabase'
import type { AdminUserSummary, AdminUsersList } from '@/types/admin'

const PAGE_SIZE_DEFAULT = 20
const PAGE_SIZE_MAX = 100

/**
 * Lista usuários do admin. Fonte de verdade: sticker_entries — qualquer
 * user_id que tenha figurinhas ativas é um "usuário" da aplicação.
 *
 * user_profiles é apenas enriquecimento (email/nome/foto). Usuários que
 * logaram antes da migration v3 (ou que nunca voltaram pra disparar o
 * touchProfile) aparecem normalmente, só que sem metadata legível.
 *
 * Search por email/nome só consegue casar quem tem perfil — esperado, já
 * que não há o que pesquisar em usuário sem metadata.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!isAdminSession(session)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(request.url)
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1)
  const pageSize = Math.min(
    PAGE_SIZE_MAX,
    Math.max(
      1,
      Number(url.searchParams.get('pageSize') ?? PAGE_SIZE_DEFAULT) ||
        PAGE_SIZE_DEFAULT
    )
  )
  const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()

  const supabase = createSupabaseAdmin()

  // 1. Agrega user_ids a partir de sticker_entries
  const { data: stickerRows, error: stickerErr } = await supabase
    .from('sticker_entries')
    .select('user_id, updated_at, collected_at')
    .is('removed_at', null)

  if (stickerErr) {
    return Response.json({ error: stickerErr.message }, { status: 500 })
  }

  type Agg = { count: number; firstSeen: string; lastSeen: string }
  const aggregates = new Map<string, Agg>()
  for (const row of stickerRows ?? []) {
    const uid = row.user_id as string
    const updated = (row.updated_at as string | undefined) ?? ''
    const collected = (row.collected_at as string | undefined) ?? ''
    const existing = aggregates.get(uid)
    if (!existing) {
      aggregates.set(uid, {
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

  // 2. Enriquece com user_profiles (best effort — tabela pode não existir)
  type Profile = {
    email: string | null
    name: string | null
    image_url: string | null
    first_seen_at: string
    last_seen_at: string
  }
  const profiles = new Map<string, Profile>()
  const userIds = Array.from(aggregates.keys())

  if (userIds.length > 0) {
    const { data: profileRows, error: profileErr } = await supabase
      .from('user_profiles')
      .select('user_id, email, name, image_url, first_seen_at, last_seen_at')
      .in('user_id', userIds)

    if (profileErr && !isMissingTableError(profileErr)) {
      return Response.json({ error: profileErr.message }, { status: 500 })
    }

    for (const row of profileRows ?? []) {
      profiles.set(row.user_id as string, {
        email: (row.email as string | null) ?? null,
        name: (row.name as string | null) ?? null,
        image_url: (row.image_url as string | null) ?? null,
        first_seen_at: row.first_seen_at as string,
        last_seen_at: row.last_seen_at as string,
      })
    }
  }

  // 3. Monta summaries, aplica search, ordena, paginha
  const allSummaries: AdminUserSummary[] = []
  aggregates.forEach((agg, uid) => {
    const p = profiles.get(uid)

    if (search) {
      const email = p?.email?.toLowerCase() ?? ''
      const name = p?.name?.toLowerCase() ?? ''
      if (!email.includes(search) && !name.includes(search)) return
    }

    allSummaries.push({
      userId: uid,
      email: p?.email ?? null,
      name: p?.name ?? null,
      imageUrl: p?.image_url ?? null,
      firstSeenAt: p?.first_seen_at ?? agg.firstSeen,
      lastSeenAt: p?.last_seen_at ?? agg.lastSeen,
      stickerCount: agg.count,
    })
  })

  allSummaries.sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))
  const total = allSummaries.length
  const from = (page - 1) * pageSize
  const users = allSummaries.slice(from, from + pageSize)

  const result: AdminUsersList = { users, total, page, pageSize }
  return Response.json(result)
}
