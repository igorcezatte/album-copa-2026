/**
 * Calcula upserts e removals do PUT /api/stickers a partir do estado atual
 * no banco e do payload recebido. Funcao pura, extraida do route handler
 * pra ficar testavel sem mockar Supabase.
 *
 * Invariante critico: TODA row de upsert tem collected_at preenchido. O
 * Postgrest unifica colunas do batch e omitir essa coluna em algumas rows
 * faz ele gerar SQL com NULL, violando NOT NULL — o batch inteiro falha
 * com 500 e nenhuma row eh salva. Foi o bug catastrofico de "PUT nunca
 * salva quando ha mix de novo+update".
 */

export interface UpsertRow {
  user_id: string
  sticker_id: string
  quantity: number
  updated_at: string
  removed_at: null
  collected_at: string
}

export interface SyncDiffInput {
  /** Estado atual ativo no banco: sticker_id -> quantity */
  current: Map<string, number>
  /** Estado atual ativo no banco: sticker_id -> collected_at (ISO) */
  currentCollectedAt: Map<string, string>
  /** Payload recebido do cliente: sticker_id -> quantity */
  incoming: Map<string, number>
  userId: string
  /** Timestamp ISO usado pra updated_at e pra collected_at de novos */
  now: string
}

export interface SyncDiffResult {
  upserts: UpsertRow[]
  /** sticker_ids presentes em current mas ausentes em incoming */
  removals: string[]
}

export function buildUpsertsAndRemovals(input: SyncDiffInput): SyncDiffResult {
  const { current, currentCollectedAt, incoming, userId, now } = input

  const upserts: UpsertRow[] = []
  incoming.forEach((quantity, sticker_id) => {
    const currentQty = current.get(sticker_id)
    if (currentQty === quantity) return // sem mudança, skip
    upserts.push({
      user_id: userId,
      sticker_id,
      quantity,
      updated_at: now,
      removed_at: null,
      // Preserva original em updates; usa `now` em inserts (novo ou re-coleta
      // de soft-deletado, onde currentCollectedAt nao tem entry pra esse id)
      collected_at: currentCollectedAt.get(sticker_id) ?? now,
    })
  })

  const removals: string[] = []
  current.forEach((_, sticker_id) => {
    if (!incoming.has(sticker_id)) removals.push(sticker_id)
  })

  return { upserts, removals }
}
