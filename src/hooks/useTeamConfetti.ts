'use client'

import { useEffect, useRef } from 'react'
import { useAlbumStore } from '@/store/albumStore'
import { shouldTriggerConfetti, fireConfetti } from '@/utils/confetti'

const SPECIAL_CODES = ['FWC', 'CC']

export function useTeamConfetti(teamCode: string) {
  const teamProgress = useAlbumStore((s) => s.getTeamProgress(teamCode))
  const sectionProgress = useAlbumStore((s) => s.getSectionProgress(teamCode))

  const isSpecial = SPECIAL_CODES.includes(teamCode)
  const progress = isSpecial ? sectionProgress : teamProgress

  const prevCollectedRef = useRef(progress.collected)

  useEffect(() => {
    const prev = prevCollectedRef.current
    if (shouldTriggerConfetti(prev, progress.collected, progress.total)) {
      fireConfetti()
    }
    prevCollectedRef.current = progress.collected
  }, [progress.collected, progress.total])
}
