'use client'

import { useEffect, useRef } from 'react'
import { useAlbumStore } from '@/store/albumStore'
import { shouldTriggerConfetti } from '@/utils/confetti'
import { useCelebrationStore } from '@/store/celebrationStore'
import { useShallow } from 'zustand/react/shallow'

export interface CelebrationMeta {
  code: string
  name: string
  color: string
  flagCode?: string
  badgeText?: string
  isSpecial: boolean
}

/**
 * Detecta a transição "acabou de completar" (prev < total → next ≥ total) de um
 * time ou seção e dispara o momento-conquista (overlay de estádio). Não renderiza
 * nada: o <TeamCompleteOverlay> montado no layout é o dono de todo o efeito.
 */
export function useTeamCelebration(meta: CelebrationMeta) {
  const teamProgress = useAlbumStore(useShallow((s) => s.getTeamProgress(meta.code)))
  const sectionProgress = useAlbumStore(useShallow((s) => s.getSectionProgress(meta.code)))
  const trigger = useCelebrationStore((s) => s.trigger)

  const progress = meta.isSpecial ? sectionProgress : teamProgress
  const prevCollectedRef = useRef(progress.collected)

  useEffect(() => {
    const prev = prevCollectedRef.current
    if (shouldTriggerConfetti(prev, progress.collected, progress.total)) {
      trigger({
        code: meta.code,
        name: meta.name,
        color: meta.color,
        flagCode: meta.flagCode,
        badgeText: meta.badgeText,
        isSpecial: meta.isSpecial,
        collected: progress.collected,
        total: progress.total,
      })
    }
    prevCollectedRef.current = progress.collected
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.collected, progress.total])
}
