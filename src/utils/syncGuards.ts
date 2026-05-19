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

// Cliente abre modal de conflito quando local e remoto divergem o suficiente
// pra que aplicar o remoto silenciosamente possa destruir dados que o usuário
// se importa. A função é ASSIMÉTRICA por design:
//
// - SHRINK (remote < local) é muito mais perigoso: o sync replace vai apagar
//   stickers que existem só localmente. Dispara modal pra qualquer perda
//   visível (>= 2 stickers OU >= 5% do local), desde que o usuário já tenha
//   pelo menos SHRINK_MIN_LOCAL stickers (evita interromper quem tá começando).
//
// - GROW (remote > local) é geralmente benigno (sync com outro device que tem
//   mais). Mantém o threshold original mais permissivo.
//
// Lados vazios entram pelo threshold absoluto.
export const SIGNIFICANT_DIVERGENCE_ABS = 10
export const SIGNIFICANT_DIVERGENCE_RATIO = 0.2

export const SHRINK_MIN_LOCAL = 5
export const SHRINK_MIN_LOSS = 2
export const SHRINK_RATIO_THRESHOLD = 0.05

export function isSignificantDivergence(
  localSize: number,
  remoteSize: number
): boolean {
  if (localSize === remoteSize) return false

  if (localSize === 0 || remoteSize === 0) {
    return Math.max(localSize, remoteSize) >= SIGNIFICANT_DIVERGENCE_ABS
  }

  // Shrink: mais sensível (qualquer perda detectável conta)
  if (remoteSize < localSize) {
    if (localSize < SHRINK_MIN_LOCAL) return false
    const loss = localSize - remoteSize
    return (
      loss >= SHRINK_MIN_LOSS ||
      loss / localSize >= SHRINK_RATIO_THRESHOLD
    )
  }

  // Grow: mantém threshold original (sync com device que tem mais)
  const diff = remoteSize - localSize
  const ratio = diff / remoteSize
  return (
    diff >= SIGNIFICANT_DIVERGENCE_ABS &&
    ratio >= SIGNIFICANT_DIVERGENCE_RATIO
  )
}
