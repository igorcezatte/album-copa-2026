'use client'

import { useState, useEffect } from 'react'
import { useAlbumStore } from '@/store/albumStore'

/**
 * Retorna true somente depois que o Zustand persist terminou de
 * carregar os dados do localStorage. Usado para evitar que
 * componentes mostrem 0% enquanto o store ainda não está pronto.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Zustand já hydratou (ex: navegação client-side)
    if (useAlbumStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    // Aguarda a hydratação terminar e força re-render via useState
    return useAlbumStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  return hydrated
}
