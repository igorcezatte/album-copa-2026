'use client'

import { create } from 'zustand'

/**
 * Momento-conquista — estado efêmero que dirige o <TeamCompleteOverlay>.
 *
 * Desacopla "detectar que um time/seção foi completado" (no hook
 * useTeamCelebration) de "renderizar o momento de estádio" (overlay montado
 * uma única vez no layout). Não persiste: é um flash, não parte da coleção.
 */
export interface CelebrationPayload {
  code: string
  name: string
  /** Cor de destaque (cor do time ou da seção) — inunda a tela. */
  color: string
  collected: number
  total: number
  /** Times têm bandeira; seções especiais (FWC/CC) não. */
  flagCode?: string
  /** Texto do badge da seção especial (ex.: 'FWC', 'CC'). */
  badgeText?: string
  isSpecial: boolean
}

interface CelebrationStore {
  active: CelebrationPayload | null
  trigger: (payload: CelebrationPayload) => void
  dismiss: () => void
}

export const useCelebrationStore = create<CelebrationStore>((set) => ({
  active: null,
  trigger: (payload) => set({ active: payload }),
  dismiss: () => set({ active: null }),
}))
