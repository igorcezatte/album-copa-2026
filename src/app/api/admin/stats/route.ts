import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminSession, isMissingTableError } from '@/lib/admin'
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

  // Múltiplas queries em paralelo
  const [
    profilesRes,
    activeWeekRes,
    activeDayRes,
    activeStickersRes,
  ] = await Promise.all([
    supabase.from('user_profiles').select('user_id', { count: 'exact', head: true }),
    supabase
      .from('user_profiles')
      .select('user_id', { count: 'exact', head: true })
      .gte('last_seen_at', week),
    supabase
      .from('user_profiles')
      .select('user_id', { count: 'exact', head: true })
      .gte('last_seen_at', day),
    // Pega user_id + updated_at de cada sticker ativo pra computar totals,
    // completos e — quando user_profiles ainda não existe — derivar
    // contagem de users distintos e atividade aproximada por updated_at.
    supabase
      .from('sticker_entries')
      .select('user_id, quantity, updated_at')
      .is('removed_at', null),
  ])

  if (activeStickersRes.error) {
    return Response.json({ error: activeStickersRes.error.message }, { status: 500 })
  }

  // Fallback: se user_profiles ainda não existe (migration v3 nao rodada),
  // derivamos contagem de usuários e "atividade" de sticker_entries.
  const profilesMissing =
    isMissingTableError(profilesRes.error) ||
    isMissingTableError(activeWeekRes.error) ||
    isMissingTableError(activeDayRes.error)

  // Agrega stickers por usuário pra calcular: total coletadas, completos, média
  const byUser = new Map<string, number>()
  const lastUpdateByUser = new Map<string, string>()
  let totalStickersCollected = 0
  for (const row of activeStickersRes.data ?? []) {
    const userId = row.user_id as string
    byUser.set(userId, (byUser.get(userId) ?? 0) + 1)
    totalStickersCollected += 1
    const updatedAt = row.updated_at as string | undefined
    if (updatedAt) {
      const existing = lastUpdateByUser.get(userId)
      if (!existing || updatedAt > existing) {
        lastUpdateByUser.set(userId, updatedAt)
      }
    }
  }

  const totalUsers = profilesMissing
    ? byUser.size
    : profilesRes.count ?? 0
  const activeUsersLast7d = profilesMissing
    ? Array.from(lastUpdateByUser.values()).filter((t) => t >= week).length
    : activeWeekRes.count ?? 0
  const activeUsersLast24h = profilesMissing
    ? Array.from(lastUpdateByUser.values()).filter((t) => t >= day).length
    : activeDayRes.count ?? 0

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
