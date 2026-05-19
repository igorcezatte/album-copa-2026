/**
 * Linha do tempo da coleção: versões automáticas e (futuramente) manuais.
 *
 * Cada versão é um snapshot completo do estado de figurinhas com uma razão
 * humanizável. A lista vive em localStorage com retenção em ring (últimas N).
 *
 * Dedup por hash do estado: se uma tentativa de salvar produz o mesmo hash
 * da versão mais recente, ignora — evita poluir a lista com saves idênticos.
 */

export const VERSIONS_KEY = 'copa26-versions-v1'
export const VERSIONS_LIMIT = 20

export type VersionReason =
  // Auto: dispara uma vez por dia ao abrir o app
  | 'auto-daily'
  // Pré-destrutivos (vindos do useSyncStore / config / backup section)
  | 'sync-replace'
  | 'sync-conflict-keep-cloud'
  | 'reset-album'
  | 'restore-backup'

export interface Version {
  /** ID estável: timestamp ms + sufixo random pra evitar colisão em rajadas */
  id: string
  /** ISO timestamp pra display */
  savedAt: string
  reason: VersionReason
  /** Estado completo das figurinhas naquele momento */
  stickers: Record<string, { quantity: number }>
  /** Quantidade de stickers — calculado pra evitar tocar `stickers` só pra contar */
  size: number
  /** Hash determinístico do estado pra dedup */
  hash: string
}

function generateId(now: number): string {
  return `${now}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Hash determinístico das figurinhas. Não criptográfico — só pra dedup.
 * Soma posicional FNV-1a-like. Ordena chaves pra estabilidade.
 */
export function hashStickers(
  stickers: Record<string, { quantity: number }>
): string {
  const keys = Object.keys(stickers).sort()
  let h = 0x811c9dc5
  for (const k of keys) {
    const q = stickers[k].quantity
    const s = `${k}:${q};`
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i)
      h = (h * 0x01000193) >>> 0
    }
  }
  return h.toString(16)
}

function readAll(): Version[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(VERSIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Valida cada entry pra resistir a payloads corrompidos
    return parsed.filter(
      (v): v is Version =>
        v &&
        typeof v === 'object' &&
        typeof v.id === 'string' &&
        typeof v.savedAt === 'string' &&
        typeof v.reason === 'string' &&
        typeof v.hash === 'string' &&
        typeof v.size === 'number' &&
        v.stickers &&
        typeof v.stickers === 'object'
    )
  } catch {
    return []
  }
}

function writeAll(list: Version[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(list))
  } catch {
    // Quota cheia ou storage indisponível — falha silenciosa
  }
}

/**
 * Adiciona uma nova versão à lista. Retorna a versão criada ou null se foi
 * deduplicada (hash idêntico à mais recente) ou o estado está vazio.
 *
 * Decimação: mantém só as últimas VERSIONS_LIMIT versões.
 */
export function addVersion(
  stickers: Record<string, { quantity: number }>,
  reason: VersionReason
): Version | null {
  const size = Object.keys(stickers).length
  if (size === 0) return null

  const hash = hashStickers(stickers)
  const all = readAll()

  // Dedup: se o estado é idêntico ao último save, ignora
  if (all.length > 0 && all[0].hash === hash) {
    return null
  }

  const now = Date.now()
  const version: Version = {
    id: generateId(now),
    savedAt: new Date(now).toISOString(),
    reason,
    stickers,
    size,
    hash,
  }

  // Insere no topo (DESC) e aplica limite
  const next = [version, ...all].slice(0, VERSIONS_LIMIT)
  writeAll(next)
  return version
}

/**
 * Lista todas as versões salvas, mais recente primeiro.
 */
export function listVersions(): Version[] {
  return readAll()
}

/**
 * Pega uma versão específica pelo id.
 */
export function getVersion(id: string): Version | null {
  return readAll().find((v) => v.id === id) ?? null
}

/**
 * Remove uma versão da lista (opcional — pra limpeza manual no futuro).
 */
export function removeVersion(id: string): void {
  writeAll(readAll().filter((v) => v.id !== id))
}

/**
 * Apaga todas as versões. Chamado pelo reset.
 */
export function clearVersions(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(VERSIONS_KEY)
  } catch {
    // ignora
  }
}

// ─── Display helpers ──────────────────────────────────────────────

export function reasonLabel(reason: VersionReason): string {
  switch (reason) {
    case 'auto-daily':
      return '☕ Início do dia'
    case 'sync-replace':
      return '⚠️ Antes de sincronizar com a nuvem'
    case 'sync-conflict-keep-cloud':
      return '⚠️ Antes de aceitar versão da nuvem'
    case 'reset-album':
      return '⚠️ Antes de zerar o álbum'
    case 'restore-backup':
      return '⚠️ Antes de restaurar backup'
  }
}

/**
 * Compara duas versões e retorna o diff (ganhos e perdas) em IDs de sticker.
 * Usado pelo preview de restauração: "se restaurar, +5 figurinhas, -2".
 */
export function diffStickers(
  from: Record<string, { quantity: number }>,
  to: Record<string, { quantity: number }>
): {
  added: Array<{ id: string; quantity: number }>
  removed: Array<{ id: string; quantity: number }>
  changed: Array<{ id: string; before: number; after: number }>
} {
  const added: Array<{ id: string; quantity: number }> = []
  const removed: Array<{ id: string; quantity: number }> = []
  const changed: Array<{ id: string; before: number; after: number }> = []

  const toKeys = new Set(Object.keys(to))
  const fromKeys = new Set(Object.keys(from))

  for (const id of Array.from(toKeys)) {
    if (!fromKeys.has(id)) {
      added.push({ id, quantity: to[id].quantity })
    } else if (from[id].quantity !== to[id].quantity) {
      changed.push({
        id,
        before: from[id].quantity,
        after: to[id].quantity,
      })
    }
  }
  for (const id of Array.from(fromKeys)) {
    if (!toKeys.has(id)) {
      removed.push({ id, quantity: from[id].quantity })
    }
  }

  return { added, removed, changed }
}
