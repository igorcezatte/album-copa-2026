import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminSession, isMissingTableError } from '@/lib/admin'
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
      .select('sticker_id, quantity, collected_at, updated_at')
      .eq('user_id', userId)
      .is('removed_at', null)
      .order('collected_at', { ascending: true }),
  ])

  if (stickersRes.error) {
    return Response.json({ error: stickersRes.error.message }, { status: 500 })
  }

  const stickers = stickersRes.data ?? []
  const totalCopies = stickers.reduce(
    (sum, s) => sum + (s.quantity as number),
    0
  )

  // Erro real (não "tabela não existe") → 500
  if (profileRes.error && !isMissingTableError(profileRes.error)) {
    return Response.json({ error: profileRes.error.message }, { status: 500 })
  }

  // Profile encontrado → usa metadata real
  const profile = profileRes.data
  if (profile) {
    const detail: AdminUserDetail = {
      userId: profile.user_id as string,
      email: (profile.email as string | null) ?? null,
      name: (profile.name as string | null) ?? null,
      imageUrl: (profile.image_url as string | null) ?? null,
      firstSeenAt: profile.first_seen_at as string,
      lastSeenAt: profile.last_seen_at as string,
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

  // Sem profile (tabela ausente ou usuário sem perfil) → deriva de stickers
  if (stickers.length === 0) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  const firstSeen = stickers.reduce(
    (min, s) =>
      (s.collected_at as string) < min ? (s.collected_at as string) : min,
    stickers[0].collected_at as string
  )
  const lastSeen = stickers.reduce(
    (max, s) => {
      const u = (s.updated_at as string | undefined) ?? ''
      return u > max ? u : max
    },
    ''
  )
  const fallbackDetail: AdminUserDetail = {
    userId,
    email: null,
    name: null,
    imageUrl: null,
    firstSeenAt: firstSeen,
    lastSeenAt: lastSeen || firstSeen,
    stickerCount: stickers.length,
    totalCopies,
    stickers: stickers.map((s) => ({
      sticker_id: s.sticker_id as string,
      quantity: s.quantity as number,
      collected_at: s.collected_at as string,
    })),
  }
  return Response.json(fallbackDetail)
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
