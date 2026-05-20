import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabase'
import { isCatastrophicShrink } from '@/utils/syncGuards'
import { buildUpsertsAndRemovals } from '@/utils/syncDiff'
import type { SupabaseClient } from '@supabase/supabase-js'

// O álbum tem 994 figurinhas. Qualquer payload acima disso é absurdo.
const MAX_PAYLOAD = 1100

type IncomingEntry = { sticker_id: string; quantity: number }

/**
 * Upsert do perfil — popula user_profiles a cada interação. Falha sem
 * quebrar o sync (tabela pode nao existir antes da migration v3), mas
 * loga em console pra dar visibilidade quando algo da errado.
 *
 * IMPORTANTE: precisa ser awaitado pelo handler. Em serverless (Vercel),
 * promises soltas via `void touchProfile(...)` podem ser cortadas quando
 * o response e enviado — usuarios apareciam com 571 figurinhas e
 * `(sem nome) (sem email)` no admin porque o upsert nunca completou.
 */
async function touchProfile(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null; name?: string | null; image?: string | null }
): Promise<void> {
  try {
    const { error } = await supabase.from('user_profiles').upsert(
      {
        user_id: user.id,
        email: user.email ?? null,
        name: user.name ?? null,
        image_url: user.image ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    if (error && typeof console !== 'undefined') {
      console.warn('[touchProfile] upsert falhou:', error.message)
    }
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.warn('[touchProfile] excecao:', err)
    }
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdmin()
  // touchProfile em paralelo com o read — Promise.all garante que ambos
  // completam antes do response (serverless poderia cortar promise solta).
  const [, stickersRes] = await Promise.all([
    touchProfile(supabase, {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    }),
    supabase
      .from('sticker_entries')
      .select('sticker_id, quantity, collected_at')
      .eq('user_id', session.user.id)
      .is('removed_at', null),
  ])

  if (stickersRes.error) {
    return Response.json({ error: stickersRes.error.message }, { status: 500 })
  }

  return Response.json({ stickers: stickersRes.data ?? [] })
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

  // Toca o perfil em paralelo com o read. Awaitamos no Promise.all abaixo
  // pra garantir que o upsert completa antes do response — em serverless
  // promise solta via `void` pode ser cortada e o user aparece sem nome/email
  // no admin mesmo tendo sincronizado com sucesso.
  const profilePromise = touchProfile(supabase, {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  })

  // 1. Lê o estado atual ATIVO (removed_at IS NULL) para diff e sanity guard.
  // Trazemos collected_at junto porque o upsert PRECISA fornecer essa coluna
  // em TODA row do batch — Postgrest unifica colunas, e omitir em rows de
  // update fazia ele setar NULL, violando o NOT NULL e quebrando o PUT inteiro
  // com 500. Era o bug real de "f5 mostra divergencia infinita".
  const { data: currentRows, error: readError } = await supabase
    .from('sticker_entries')
    .select('sticker_id, quantity, collected_at')
    .eq('user_id', userId)
    .is('removed_at', null)

  if (readError) {
    return Response.json({ error: readError.message }, { status: 500 })
  }

  const current = new Map<string, number>(
    (currentRows ?? []).map((r) => [r.sticker_id as string, r.quantity as number])
  )
  const currentCollectedAt = new Map<string, string>(
    (currentRows ?? []).map((r) => [
      r.sticker_id as string,
      r.collected_at as string,
    ])
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

  // 3. Computa diff via util pura (testada em syncDiff.test.ts)
  const { upserts, removals } = buildUpsertsAndRemovals({
    current,
    currentCollectedAt,
    incoming,
    userId,
    now,
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

  // Garante que o touchProfile completou antes do response — sem isso o
  // serverless pode cortar a promise e o admin mostra users sem nome/email
  await profilePromise

  return Response.json({
    ok: true,
    upserted: upserts.length,
    removed: removals.length,
    total: incoming.size,
  })
}
