import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('sticker_entries')
    .select('sticker_id, quantity')
    .eq('user_id', session.user.id)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ stickers: data ?? [] })
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const entries: Array<{ sticker_id: string; quantity: number }> = body.stickers ?? []

  if (!Array.isArray(entries)) {
    return Response.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()
  const userId = session.user.id

  // Full replace: apaga tudo do usuário e insere o estado atual.
  // Upsert simples não funciona para remoções — stickers descoleados
  // ficavam no Supabase e voltavam ao recarregar a página.
  const { error: deleteError } = await supabase
    .from('sticker_entries')
    .delete()
    .eq('user_id', userId)

  if (deleteError) return Response.json({ error: deleteError.message }, { status: 500 })

  if (entries.length === 0) {
    return Response.json({ ok: true, synced: 0 })
  }

  const rows = entries.map((e) => ({
    user_id: userId,
    sticker_id: e.sticker_id,
    quantity: e.quantity,
    updated_at: new Date().toISOString(),
  }))

  const { error: insertError } = await supabase
    .from('sticker_entries')
    .insert(rows)

  if (insertError) return Response.json({ error: insertError.message }, { status: 500 })

  return Response.json({ ok: true, synced: rows.length })
}
