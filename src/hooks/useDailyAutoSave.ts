'use client'

import { useEffect, useRef } from 'react'
import { useAlbumStore } from '@/store/albumStore'
import { addVersion, listVersions } from '@/utils/versions'

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000

function hasHydrated(): boolean {
  return useAlbumStore.persist.hasHydrated()
}

function waitForHydration(): Promise<void> {
  if (hasHydrated()) return Promise.resolve()
  return new Promise((resolve) => {
    const unsub = useAlbumStore.persist.onFinishHydration(() => {
      unsub()
      resolve()
    })
  })
}

/**
 * Cria uma versão 'auto-daily' uma vez por carregamento de app, desde que:
 *  - haja stickers locais (>0)
 *  - tenha passado pelo menos 12h desde a última versão de qualquer tipo
 *
 * Dedup do addVersion garante que se o estado não mudou desde o último save,
 * nada é gravado (hash idêntico).
 */
export function useDailyAutoSave(): void {
  const didRunRef = useRef(false)

  useEffect(() => {
    if (didRunRef.current) return
    didRunRef.current = true

    const run = async () => {
      await waitForHydration()
      const stickers = useAlbumStore.getState().stickers
      if (Object.keys(stickers).length === 0) return

      const versions = listVersions()
      if (versions.length > 0) {
        const lastSavedAt = new Date(versions[0].savedAt).getTime()
        if (Date.now() - lastSavedAt < TWELVE_HOURS_MS) return
      }

      addVersion(stickers, 'auto-daily')
    }

    void run()
  }, [])
}
