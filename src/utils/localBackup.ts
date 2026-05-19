/**
 * Snapshot de segurança do estado local — escreve uma cópia antes de qualquer
 * operação que possa apagar dados (sync replace, reset, restauração de backup).
 *
 * Permite recuperação manual em /config caso o estado tenha sido perdido por
 * sync agressivo, conflito mal resolvido ou outro caminho destrutivo.
 *
 * Não substitui o backup explícito do usuário (BackupSection) — é uma rede de
 * segurança automática mantida em paralelo.
 */

export const SNAPSHOT_KEY = 'copa26-prev-snapshot'
export const LAST_USER_ID_KEY = 'copa26-last-user-id'

export type SnapshotReason =
  | 'sync-replace'
  | 'sync-conflict-keep-cloud'
  | 'reset-album'
  | 'restore-backup'

export interface Snapshot {
  stickers: Record<string, { quantity: number }>
  savedAt: string
  reason: SnapshotReason
  /** Número de stickers no snapshot — útil pra UI sem deserializar tudo */
  size: number
}

/**
 * Salva snapshot do estado local antes de uma operação destrutiva.
 * Falha silenciosa: localStorage cheio ou indisponível não deve quebrar o sync.
 */
export function saveSnapshot(
  stickers: Record<string, { quantity: number }>,
  reason: SnapshotReason
): void {
  if (typeof window === 'undefined') return
  // Se o estado atual já está vazio, não vale salvar (não tem o que recuperar)
  const size = Object.keys(stickers).length
  if (size === 0) return
  try {
    const snap: Snapshot = {
      stickers,
      savedAt: new Date().toISOString(),
      reason,
      size,
    }
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snap))
  } catch {
    // ignora: quota cheia ou modo privado restritivo
  }
}

/**
 * Lê o snapshot mais recente. Retorna null se não existe ou está corrompido.
 */
export function readSnapshot(): Snapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Snapshot
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.stickers ||
      typeof parsed.savedAt !== 'string'
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

/**
 * Remove o snapshot. Chamado quando o usuário aceita a perda (ex: confirma
 * "manter atual" no diálogo de recuperação) ou quando explicitamente limpa.
 */
export function clearSnapshot(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(SNAPSHOT_KEY)
  } catch {
    // ignora
  }
}

// ─── Tracking de qual conta sincronizou por último neste browser ──
//
// Usado pra detectar quando uma conta DIFERENTE entra com dados locais
// que pertencem a outra. Sem isso, o "primeiro sync" da nova conta
// mergeava os dados da conta antiga e os enviava pra nuvem da nova,
// contaminando ambas as coleções.

export function getLastUserId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(LAST_USER_ID_KEY)
  } catch {
    return null
  }
}

export function setLastUserId(userId: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LAST_USER_ID_KEY, userId)
  } catch {
    // ignora
  }
}

export function clearLastUserId(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(LAST_USER_ID_KEY)
  } catch {
    // ignora
  }
}
