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

// ─── Decisão do primeiro sync (4 casos) ──────────────────────────
//
// Função pura que classifica o cenário do sync inicial dado o estado
// observável (local size, remote size, flag synced-{userId}, último userId).
// Extraída do useSyncStore pra ficar testável sem mockar fetch/storage.

export interface InitialSyncInput {
  /** ID da conta que está logando agora */
  userId: string
  localSize: number
  remoteSize: number
  /** Há flag copa26-synced-v1-{userId} no localStorage? */
  syncedBefore: boolean
  /** copa26-last-user-id, último user que completou um sync neste browser */
  lastUserId: string | null
}

export type InitialSyncCase =
  /** A: primeiro sync, local vazio — pull silencioso */
  | { kind: 'pull-silent' }
  /** B: primeiro sync desta conta, local com dados, sem outra conta antes */
  | { kind: 'welcome-modal' }
  /** C sem conflito: mesma conta voltando, divergência aceitável */
  | { kind: 'same-user-pull' }
  /** C com conflito: mesma conta voltando, divergência significativa */
  | { kind: 'same-user-conflict' }
  /** D: outra conta passou neste browser antes — modal de mismatch */
  | { kind: 'mismatch-modal' }

export function classifyInitialSync(input: InitialSyncInput): InitialSyncCase {
  const { userId, localSize, remoteSize, syncedBefore, lastUserId } = input

  // Caso C: mesma conta já sincronizou aqui
  if (syncedBefore) {
    if (isSignificantDivergence(localSize, remoteSize)) {
      return { kind: 'same-user-conflict' }
    }
    return { kind: 'same-user-pull' }
  }

  // Caso A: primeira vez, sem dados locais
  if (localSize === 0) {
    return { kind: 'pull-silent' }
  }

  // Caso D: outra conta já passou aqui e local tem dados dela
  if (lastUserId && lastUserId !== userId) {
    return { kind: 'mismatch-modal' }
  }

  // Caso B: anônimo logando pela primeira vez nesta máquina
  return { kind: 'welcome-modal' }
}
