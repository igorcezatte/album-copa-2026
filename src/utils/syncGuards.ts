/**
 * Heurísticas de proteção do sync.
 *
 * Funções puras isoladas para serem fáceis de testar e compartilhadas
 * entre o servidor (API route) e o cliente (useSyncStore).
 */

// Servidor recusa PUT se o estado atual tem ≥ 20 figurinhas E o payload
// recebido tem menos da metade. Bypass apenas com force:true (uso explícito
// pelo botão de reset em /config).
export const SHRINK_MIN_CURRENT = 20
export const SHRINK_RATIO = 0.5

export function isCatastrophicShrink(
  currentSize: number,
  incomingSize: number
): boolean {
  return (
    currentSize >= SHRINK_MIN_CURRENT &&
    incomingSize < currentSize * SHRINK_RATIO
  )
}

// Cliente abre modal de conflito se local e remoto diferem em ≥ 10 figurinhas
// E essa diferença é ≥ 20% do maior lado. Casos com um lado vazio só contam
// como divergência se o outro lado tem volume relevante.
export const SIGNIFICANT_DIVERGENCE_ABS = 10
export const SIGNIFICANT_DIVERGENCE_RATIO = 0.2

export function isSignificantDivergence(
  localSize: number,
  remoteSize: number
): boolean {
  if (localSize === 0 && remoteSize === 0) return false
  if (localSize === 0 || remoteSize === 0) {
    return Math.max(localSize, remoteSize) >= SIGNIFICANT_DIVERGENCE_ABS
  }
  const diff = Math.abs(localSize - remoteSize)
  const ratio = diff / Math.max(localSize, remoteSize)
  return (
    diff >= SIGNIFICANT_DIVERGENCE_ABS &&
    ratio >= SIGNIFICANT_DIVERGENCE_RATIO
  )
}
