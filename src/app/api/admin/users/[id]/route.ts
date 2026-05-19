import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminSession } from '@/lib/admin'
import { createSupabaseAdmin } from '@/lib/supabase'
import type { AdminUserDetail } from '@/types/admin'

interface RouteContext {
  params: { id: string }
}

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!isAdminSession(session)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const userId = params.id
  const supabase = createSupabaseAdmin()

  const [profileRes, stickersRes] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('user_id, email, name, image_url, first_seen_at, last_seen_at')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('sticker_entries')
      .select('sticker_id, quantity, collected_at')
      .eq('user_id', userId)
      .is('removed_at', null)
      .order('collected_at', { ascending: true }),
  ])

  if (profileRes.error) {
    return Response.json({ error: profileRes.error.message }, { status: 500 })
  }
  if (stickersRes.error) {
    return Response.json({ error: stickersRes.error.message }, { status: 500 })
  }

  if (!profileRes.data) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  const stickers = stickersRes.data ?? []
  const totalCopies = stickers.reduce(
    (sum, s) => sum + (s.quantity as number),
    0
  )

  const detail: AdminUserDetail = {
    userId: profileRes.data.user_id as string,
    email: (profileRes.data.email as string | null) ?? null,
    name: (profileRes.data.name as string | null) ?? null,
    imageUrl: (profileRes.data.image_url as string | null) ?? null,
    firstSeenAt: profileRes.data.first_seen_at as string,
    lastSeenAt: profileRes.data.last_seen_at as string,
    stickerCount: stickers.length,
    totalCopies,
    stickers: stickers.map((s) => ({
      sticker_id: s.sticker_id as string,
      quantity: s.quantity as number,
      collected_at: s.collected_at as string,
    })),
  }

  return Response.json(detail)
}

/**
 * Soft-delete de TODAS as stickers ativas do usuário. Mantém histórico (não
 * apaga linhas). Pra recovery de contas contaminadas ou pedidos do user.
 *
 * Aceita ?confirm=user_id no query string como camada extra de proteção
 * contra erros — espera o id como confirmação.
 */
export async function DELETE(request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!isAdminSession(session)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const userId = params.id
  const url = new URL(request.url)
  const confirm = url.searchParams.get('confirm')
  if (confirm !== userId) {
    return Response.json(
      { error: 'Missing confirmation: ?confirm=<user_id>' },
      { status: 400 }
    )
  }

  const supabase = createSupabaseAdmin()
  const now = new Date().toISOString()

  const { error, count } = await supabase
    .from('sticker_entries')
    .update({ removed_at: now, updated_at: now }, { count: 'exact' })
    .eq('user_id', userId)
    .is('removed_at', null)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true, removed: count ?? 0 })
}
