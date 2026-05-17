'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useAlbumStore } from '@/store/albumStore'
import { buildSyncPayload, mergeStickerData, type RemoteStickerEntry } from '@/utils/migration'

export function useSyncStore() {
  const { data: session, status } = useSession()
  const stickers = useAlbumStore((s) => s.stickers)
  const mergeStickers = useAlbumStore((s) => s.mergeStickers)

  const isMergingRef = useRef(false)
  const prevUserIdRef = useRef<string | null>(null)

  // Carrega dados do Supabase quando usuário faz login
  useEffect(() => {
    const userId = session?.user?.id ?? null
    if (!userId || userId === prevUserIdRef.current) return
    prevUserIdRef.current = userId

    isMergingRef.current = true
    fetch('/api/stickers')
      .then((r) => r.json())
      .then((data: { stickers?: RemoteStickerEntry[] }) => {
        const remoteStickers = data.stickers ?? []
        const currentLocal = useAlbumStore.getState().stickers
        const merged = mergeStickerData(currentLocal, remoteStickers)
        mergeStickers(merged)
      })
      .catch(console.error)
      .finally(() => {
        // aguarda um tick para o estado do store atualizar antes de liberar sync
        setTimeout(() => { isMergingRef.current = false }, 100)
      })
  }, [session?.user?.id, mergeStickers])

  // Sincroniza para o Supabase com debounce (1.5s após última mudança)
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
