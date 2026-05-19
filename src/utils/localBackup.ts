/**
 * Helpers de "última conta sincronizada" + shim de snapshot pré-destrutivo.
 *
 * O snapshot agora delega pro modulo `versions.ts` (linha do tempo). Mantemos
 * `saveSnapshot` como API estável pra os call sites existentes (useSyncStore,
 * /config reset, BackupSection restore) — internamente vira `addVersion`.
 */

import { addVersion, type VersionReason } from './versions'

export const LAST_USER_ID_KEY = 'copa26-last-user-id'

export type SnapshotReason = VersionReason

/**
 * Cria uma versão na linha do tempo antes de operação destrutiva.
 * Mantém a assinatura antiga pra evitar refactor cascata nos call sites.
 */
export function saveSnapshot(
  stickers: Record<string, { quantity: number }>,
  reason: SnapshotReason
): void {
  addVersion(stickers, reason)
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
