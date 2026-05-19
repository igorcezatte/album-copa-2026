import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fetchAllRows, isAdminSession, isMissingTableError } from '@/lib/admin'
import { createSupabaseAdmin } from '@/lib/supabase'
import type { AdminStats } from '@/types/admin'

const ALBUM_TOTAL = 994

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!isAdminSession(session)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createSupabaseAdmin()
  const now = new Date()
  const day = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // sticker_entries é fonte de verdade pra "quem tem dados". user_profiles
  // entra só como complemento de atividade (last_seen_at é atualizado em
  // GETs/PUTs e pode ser mais recente que o updated_at da última sticker).
  //
  // fetchAllRows pagina via .range() — Supabase REST corta em 1000 rows por
  // resposta. Sem isso, totais ficavam travados em 1000 figurinhas exatas.
  const [activeStickersRes, profilesRes] = await Promise.all([
    fetchAllRows<{ user_id: string; quantity: number; updated_at: string }>(
      () =>
        supabase
          .from('sticker_entries')
          .select('user_id, quantity, updated_at')
          .is('removed_at', null)
    ),
    fetchAllRows<{ user_id: string; last_seen_at: string }>(() =>
      supabase.from('user_profiles').select('user_id, last_seen_at')
    ),
  ])

  if (activeStickersRes.error) {
    return Response.json(
      { error: String((activeStickersRes.error as { message?: string }).message ?? activeStickersRes.error) },
      { status: 500 }
    )
  }

  if (profilesRes.error && !isMissingTableError(profilesRes.error)) {
    return Response.json(
      { error: String((profilesRes.error as { message?: string }).message ?? profilesRes.error) },
      { status: 500 }
    )
  }

  // Agrega stickers por usuário pra calcular: total coletadas, completos, média
  const byUser = new Map<string, number>()
  const lastSeenByUser = new Map<string, string>()
  let totalStickersCollected = 0
  for (const row of activeStickersRes.data ?? []) {
    const userId = row.user_id as string
    byUser.set(userId, (byUser.get(userId) ?? 0) + 1)
    totalStickersCollected += 1
    const updatedAt = row.updated_at as string | undefined
    if (updatedAt) {
      const existing = lastSeenByUser.get(userId)
      if (!existing || updatedAt > existing) {
        lastSeenByUser.set(userId, updatedAt)
      }
    }
  }

  // user_profiles.last_seen_at sobrescreve quando mais recente — captura
  // sessões em que o user logou mas não modificou figurinhas
  for (const row of profilesRes.data ?? []) {
    const userId = row.user_id as string
    const lastSeen = row.last_seen_at as string | undefined
    if (!lastSeen) continue
    const existing = lastSeenByUser.get(userId)
    if (!existing || lastSeen > existing) {
      lastSeenByUser.set(userId, lastSeen)
    }
  }

  const totalUsers = byUser.size
  const activeUsersLast7d = Array.from(lastSeenByUser.values()).filter(
    (t) => t >= week
  ).length
  const activeUsersLast24h = Array.from(lastSeenByUser.values()).filter(
    (t) => t >= day
  ).length

  const usersCompleted = Array.from(byUser.values()).filter(
    (n) => n >= ALBUM_TOTAL
  ).length

  // Média entre usuários que aparecem na tabela de stickers (não os que
  // existem só como perfil sem nada coletado)
  const usersWithStickers = byUser.size
  const avgStickersPerActiveUser =
    usersWithStickers > 0
      ? Math.round((totalStickersCollected / usersWithStickers) * 10) / 10
      : 0

  const stats: AdminStats = {
    totalUsers,
    activeUsersLast7d,
    activeUsersLast24h,
    totalStickersCollected,
    avgStickersPerActiveUser,
    usersCompleted,
  }

  return Response.json(stats)
}
