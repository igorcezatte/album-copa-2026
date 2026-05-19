import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminSession } from '@/lib/admin'
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
    // Pega user_id de cada sticker ativo pra computar totals e completos.
    // É uma full scan da tabela; aceitável até a tabela ficar enorme.
    supabase
      .from('sticker_entries')
      .select('user_id, quantity')
      .is('removed_at', null),
  ])

  if (activeStickersRes.error) {
    return Response.json({ error: activeStickersRes.error.message }, { status: 500 })
  }

  const totalUsers = profilesRes.count ?? 0
  const activeUsersLast7d = activeWeekRes.count ?? 0
  const activeUsersLast24h = activeDayRes.count ?? 0

  // Agrega stickers por usuário pra calcular: total coletadas, completos, média
  const byUser = new Map<string, number>()
  let totalStickersCollected = 0
  for (const row of activeStickersRes.data ?? []) {
    const userId = row.user_id as string
    byUser.set(userId, (byUser.get(userId) ?? 0) + 1)
    totalStickersCollected += 1
  }
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
