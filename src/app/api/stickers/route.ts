import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabase'
import { isCatastrophicShrink } from '@/utils/syncGuards'

// O álbum tem 994 figurinhas. Qualquer payload acima disso é absurdo.
const MAX_PAYLOAD = 1100

type IncomingEntry = { sticker_id: string; quantity: number }

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('sticker_entries')
    .select('sticker_id, quantity, collected_at')
    .eq('user_id', session.user.id)
    .is('removed_at', null)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ stickers: data ?? [] })
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || !Array.isArray(body.stickers)) {
    return Response.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const entries: IncomingEntry[] = body.stickers
  const force = body.force === true

  if (entries.length > MAX_PAYLOAD) {
    return Response.json({ error: 'Payload too large' }, { status: 400 })
  }

  // Valida cada entry
  for (const e of entries) {
    if (
      typeof e?.sticker_id !== 'string' ||
      !Number.isInteger(e?.quantity) ||
      e.quantity < 1
    ) {
      return Response.json({ error: 'Invalid entry' }, { status: 400 })
    }
  }

  const supabase = createSupabaseAdmin()
  const userId = session.user.id
  const now = new Date().toISOString()

  // 1. Lê o estado atual ATIVO (removed_at IS NULL) para diff e sanity guard
  const { data: currentRows, error: readError } = await supabase
    .from('sticker_entries')
    .select('sticker_id, quantity')
    .eq('user_id', userId)
    .is('removed_at', null)

  if (readError) {
    return Response.json({ error: readError.message }, { status: 500 })
  }

  const current = new Map<string, number>(
    (currentRows ?? []).map((r) => [r.sticker_id as string, r.quantity as number])
  )
  const incoming = new Map<string, number>(
    entries.map((e) => [e.sticker_id, e.quantity])
  )

  // 2. Sanity guard contra shrinkage catastrófico
  if (!force && isCatastrophicShrink(current.size, incoming.size)) {
    return Response.json(
      {
        error: 'catastrophic_shrink_detected',
        currentSize: current.size,
        incomingSize: incoming.size,
        hint: 'Pass force:true to override (used only by explicit user actions like reset).',
      },
      { status: 409 }
    )
  }

  // 3. Computa diff: upserts (novos/mudados) e removals (ausentes do payload)
  const upserts: Array<{
    user_id: string
    sticker_id: string
    quantity: number
    updated_at: string
    removed_at: null
    collected_at?: string
  }> = []

  incoming.forEach((quantity, sticker_id) => {
    const currentQty = current.get(sticker_id)
    if (currentQty === quantity) return // sem mudança
    upserts.push({
      user_id: userId,
      sticker_id,
      quantity,
      updated_at: now,
      removed_at: null, // re-coletar reativa figurinha soft-deletada
      // collected_at só é setado em INSERT (omitido aqui — DEFAULT NOW())
      ...(currentQty === undefined ? { collected_at: now } : {}),
    })
  })

  const removals: string[] = []
  current.forEach((_, sticker_id) => {
    if (!incoming.has(sticker_id)) removals.push(sticker_id)
  })

  // 4. Aplica upserts
  if (upserts.length > 0) {
    const { error: upsertError } = await supabase
      .from('sticker_entries')
      .upsert(upserts, { onConflict: 'user_id,sticker_id' })

    if (upsertError) {
      return Response.json({ error: upsertError.message }, { status: 500 })
    }
  }

  // 5. Aplica soft-delete (preserva collected_at e quantity originais)
  if (removals.length > 0) {
    const { error: removeError } = await supabase
      .from('sticker_entries')
      .update({ removed_at: now, updated_at: now })
      .eq('user_id', userId)
      .in('sticker_id', removals)

    if (removeError) {
      return Response.json({ error: removeError.message }, { status: 500 })
    }
  }

  return Response.json({
    ok: true,
    upserted: upserts.length,
    removed: removals.length,
    total: incoming.size,
  })
}
