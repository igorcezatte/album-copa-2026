'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useAlbumStore } from '@/store/albumStore'
import { buildSyncPayload, mergeStickerData, type RemoteStickerEntry } from '@/utils/migration'

// Aguarda o Zustand terminar de hidratar do localStorage antes de continuar.
// Sem isso, há race condition: o merge roda com store vazio e zera os dados.
function waitForHydration(): Promise<void> {
  if (useAlbumStore.persist.hasHydrated()) return Promise.resolve()
  return new Promise((resolve) => {
    const unsub = useAlbumStore.persist.onFinishHydration(() => {
      unsub()
      resolve()
    })
  })
}

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

    // Espera hidratação do localStorage antes de fazer merge
    waitForHydration()
      .then(() => fetch('/api/stickers'))
      .then((r) => {
        // Não merga se a API retornou erro (sessão inválida, rede, etc.)
        if (!r.ok) return null
        return r.json() as Promise<{ stickers?: RemoteStickerEntry[] }>
      })
      .then((data) => {
        if (!data) return  // API com erro — preserva o localStorage
        const remoteStickers = data.stickers ?? []
        const currentLocal = useAlbumStore.getState().stickers
        const merged = mergeStickerData(currentLocal, remoteStickers)
        mergeStickers(merged)
      })
      .catch(console.error)
      .finally(() => {
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
