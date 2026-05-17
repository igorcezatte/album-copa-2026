'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useAlbumStore } from '@/store/albumStore'
import { buildSyncPayload, mergeStickerData, type RemoteStickerEntry } from '@/utils/migration'

const SYNCED_KEY = 'copa26-synced-v1'

function waitForHydration(): Promise<void> {
  if (useAlbumStore.persist.hasHydrated()) return Promise.resolve()
  return new Promise((resolve) => {
    const unsub = useAlbumStore.persist.onFinishHydration(() => {
      unsub()
      resolve()
    })
  })
}

function remoteToLocal(entries: RemoteStickerEntry[]): Record<string, { quantity: number }> {
  const result: Record<string, { quantity: number }> = {}
  for (const { sticker_id, quantity } of entries) {
    result[sticker_id] = { quantity }
  }
  return result
}

export function useSyncStore() {
  const { data: session, status } = useSession()
  const stickers = useAlbumStore((s) => s.stickers)
  const mergeStickers  = useAlbumStore((s) => s.mergeStickers)
  const replaceStickers = useAlbumStore((s) => s.replaceStickers)

  const isMergingRef  = useRef(false)
  const prevUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    const userId = session?.user?.id ?? null
    if (!userId || userId === prevUserIdRef.current) return
    prevUserIdRef.current = userId

    isMergingRef.current = true

    waitForHydration()
      .then(() => fetch('/api/stickers'))
      .then((r) => {
        if (!r.ok) return null
        return r.json() as Promise<{ stickers?: RemoteStickerEntry[] }>
      })
      .then((data) => {
        if (!data) return

        const remoteStickers = data.stickers ?? []
        const syncedBefore = localStorage.getItem(`${SYNCED_KEY}-${userId}`) === 'true'

        if (!syncedBefore) {
          // Primeiro login: merge (preserva figurinhas adicionadas localmente)
          const currentLocal = useAlbumStore.getState().stickers
          const merged = mergeStickerData(currentLocal, remoteStickers)
          mergeStickers(merged)
          localStorage.setItem(`${SYNCED_KEY}-${userId}`, 'true')
        } else {
          // Logins subsequentes: Supabase é fonte de verdade
          replaceStickers(remoteToLocal(remoteStickers))
        }
      })
      .catch(console.error)
      .finally(() => {
        setTimeout(() => { isMergingRef.current = false }, 100)
      })
  }, [session?.user?.id, mergeStickers, replaceStickers])

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return
    if (isMergingRef.current) return

    const timer = setTimeout(() => {
      const payload = buildSyncPayload(stickers)
      fetch('/api/stickers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stickers: payload }),
      }).catch(console.error)
    }, 1500)

    return () => clearTimeout(timer)
  }, [stickers, status, session?.user?.id])
}
