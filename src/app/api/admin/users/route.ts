import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fetchAllRows, isAdminSession, isMissingTableError } from '@/lib/admin'
import { createSupabaseAdmin } from '@/lib/supabase'
import type { AdminUserSummary, AdminUsersList } from '@/types/admin'

const PAGE_SIZE_DEFAULT = 20
const PAGE_SIZE_MAX = 100

/**
 * Lista usuários do admin. O universo de usuários é a UNIÃO de duas fontes:
 *  - sticker_entries: qualquer user_id com figurinhas ativas.
 *  - user_profiles: qualquer um que logou, mesmo sem ter coletado nada.
 *
 * Isso garante que um usuário recém-cadastrado (0 figurinhas) ainda apareça,
 * com stickerCount = 0. user_profiles continua sendo o enriquecimento de
 * metadata (email/nome/foto). Usuários que logaram antes da migration v3
 * aparecem só via sticker_entries, sem metadata legível.
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
  // fetchAllRows pagina via .range() — Supabase REST corta em 1000 rows por
  // resposta, e sem isso usuarios e contagens ficavam travados em 1000.
  const { data: stickerRows, error: stickerErr } = await fetchAllRows<{
    user_id: string
    updated_at: string
    collected_at: string
  }>(() =>
    supabase
      .from('sticker_entries')
      .select('user_id, updated_at, collected_at')
      .is('removed_at', null)
  )

  if (stickerErr) {
    return Response.json(
      { error: String((stickerErr as { message?: string }).message ?? stickerErr) },
      { status: 500 }
    )
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

  // 2. Carrega TODOS os perfis (best effort — tabela pode não existir).
  // Buscamos todos, não só os que têm figurinhas: um usuário que logou mas
  // ainda não coletou nada existe apenas aqui e precisa aparecer com 0.
  // fetchAllRows pagina via .range() pra não truncar em 1000.
  type Profile = {
    email: string | null
    name: string | null
    image_url: string | null
    first_seen_at: string
    last_seen_at: string
  }
  const profiles = new Map<string, Profile>()

  const { data: profileRows, error: profileErr } = await fetchAllRows<{
    user_id: string
    email: string | null
    name: string | null
    image_url: string | null
    first_seen_at: string
    last_seen_at: string
  }>(() =>
    supabase
      .from('user_profiles')
      .select('user_id, email, name, image_url, first_seen_at, last_seen_at')
  )

  if (profileErr && !isMissingTableError(profileErr)) {
    return Response.json(
      { error: String((profileErr as { message?: string }).message ?? profileErr) },
      { status: 500 }
    )
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

  // 3. Monta summaries sobre a UNIÃO de (quem tem figurinha) e (quem tem
  // perfil). Aplica search, ordena, paginha.
  const allUserIds = new Set<string>([
    ...Array.from(aggregates.keys()),
    ...Array.from(profiles.keys()),
  ])
  const allSummaries: AdminUserSummary[] = []
  allUserIds.forEach((uid) => {
    const agg = aggregates.get(uid)
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
      firstSeenAt: p?.first_seen_at ?? agg?.firstSeen ?? '',
      lastSeenAt: p?.last_seen_at ?? agg?.lastSeen ?? '',
      stickerCount: agg?.count ?? 0,
    })
  })

  allSummaries.sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))
  const total = allSummaries.length
  const from = (page - 1) * pageSize
  const users = allSummaries.slice(from, from + pageSize)

  const result: AdminUsersList = { users, total, page, pageSize }
  return Response.json(result)
}
