'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useAlbumStore } from '@/store/albumStore'
import { useSyncState, type ConflictResolution } from '@/store/syncState'
import {
  buildSyncPayload,
  mergeStickerData,
  type RemoteStickerEntry,
} from '@/utils/migration'
import { isSignificantDivergence } from '@/utils/syncGuards'
import { saveSnapshot, type SnapshotReason } from '@/utils/localBackup'

function snapshotBeforeReplace(reason: SnapshotReason) {
  saveSnapshot(useAlbumStore.getState().stickers, reason)
}

const SYNCED_KEY = 'copa26-synced-v1'
const RETRY_DELAYS = [0, 2000, 8000] // ms — 3 tentativas com backoff
const PUT_DEBOUNCE = 1500

function waitForHydration(): Promise<void> {
  if (useAlbumStore.persist.hasHydrated()) return Promise.resolve()
  return new Promise((resolve) => {
    const unsub = useAlbumStore.persist.onFinishHydration(() => {
      unsub()
      resolve()
    })
  })
}

function remoteToLocal(
  entries: RemoteStickerEntry[]
): Record<string, { quantity: number }> {
  const result: Record<string, { quantity: number }> = {}
  for (const { sticker_id, quantity } of entries) {
    result[sticker_id] = { quantity }
  }
  return result
}

async function fetchRemoteOnce(): Promise<RemoteStickerEntry[] | null> {
  try {
    const r = await fetch('/api/stickers')
    if (!r.ok) return null
    const data = (await r.json()) as { stickers?: RemoteStickerEntry[] }
    return data.stickers ?? []
  } catch {
    return null
  }
}

async function fetchRemoteWithRetry(): Promise<RemoteStickerEntry[] | null> {
  for (let attempt = 0; attempt < RETRY_DELAYS.length; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]))
    }
    const result = await fetchRemoteOnce()
    if (result !== null) return result
  }
  return null
}

async function pushFullState(force: boolean): Promise<Response | null> {
  const payload = buildSyncPayload(useAlbumStore.getState().stickers)
  try {
    return await fetch('/api/stickers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stickers: payload, ...(force ? { force: true } : {}) }),
    })
  } catch {
    return null
  }
}

export function useSyncStore() {
  const { data: session, status } = useSession()
  const stickers = useAlbumStore((s) => s.stickers)
  const mergeStickers = useAlbumStore((s) => s.mergeStickers)
  const replaceStickers = useAlbumStore((s) => s.replaceStickers)
  const setSyncStatus = useSyncState((s) => s.setStatus)
  const openConflict = useSyncState((s) => s.openConflict)
  const closeConflict = useSyncState((s) => s.closeConflict)

  // Guard durante merge inicial — bloqueia PUT efêmero
  const isMergingRef = useRef(false)
  // Guard persistente após falha de GET ou conflito — bloqueia PUTs até resolução
  const isBlockedRef = useRef(false)
  const prevUserIdRef = useRef<string | null>(null)

  // ============================================================
  // INITIAL SYNC: corre 1x por userId após login/reload
  // ============================================================
  useEffect(() => {
    const userId = session?.user?.id ?? null
    if (!userId || userId === prevUserIdRef.current) return
    prevUserIdRef.current = userId

    isMergingRef.current = true
    isBlockedRef.current = false
    setSyncStatus('syncing')

    const buildResolver =
      (remoteStickers: RemoteStickerEntry[]) =>
      async (resolution: ConflictResolution) => {
        if (resolution === 'keep-cloud') {
          snapshotBeforeReplace('sync-conflict-keep-cloud')
          replaceStickers(remoteToLocal(remoteStickers))
          isBlockedRef.current = false
          closeConflict()
          return
        }

        if (resolution === 'merge') {
          const currentLocal = useAlbumStore.getState().stickers
          const merged = mergeStickerData(currentLocal, remoteStickers)
          mergeStickers(merged)
          isBlockedRef.current = false
          const r = await pushFullState(false)
          if (r && r.ok) closeConflict()
          else setSyncStatus('error')
          return
        }

        if (resolution === 'keep-local') {
          isBlockedRef.current = false
          const r = await pushFullState(true)
          if (r && r.ok) closeConflict()
          else setSyncStatus('error')
          return
        }
      }

    const run = async () => {
      await waitForHydration()
      const remoteStickers = await fetchRemoteWithRetry()

      if (remoteStickers === null) {
        // GET falhou após retries → bloqueia PUTs até próximo reload
        isBlockedRef.current = true
        setSyncStatus('error')
        return
      }

      const currentLocal = useAlbumStore.getState().stickers
      const localSize = Object.keys(currentLocal).length
      const remoteSize = remoteStickers.length
      const syncedBefore =
        localStorage.getItem(`${SYNCED_KEY}-${userId}`) === 'true'

      // Em login subsequente, se o remoto divergir muito do local, abre modal
      // de conflito. (No 1º login, merge-união é seguro porque só cresce.)
      if (syncedBefore && isSignificantDivergence(localSize, remoteSize)) {
        isBlockedRef.current = true
        openConflict(
          { localSize, remoteSize },
          buildResolver(remoteStickers)
        )
        return
      }

      if (!syncedBefore) {
        const merged = mergeStickerData(currentLocal, remoteStickers)
        mergeStickers(merged)
        localStorage.setItem(`${SYNCED_KEY}-${userId}`, 'true')
      } else {
        // Estado local sera substituído pelo remoto — salva snapshot pra
        // recuperar em /config caso o usuário tenha adicionado coisas sem
        // login antes desse sync.
        snapshotBeforeReplace('sync-replace')
        replaceStickers(remoteToLocal(remoteStickers))
      }

      setSyncStatus('ok')
    }

    run().finally(() => {
      setTimeout(() => {
        isMergingRef.current = false
      }, 100)
    })
  }, [
    session?.user?.id,
    mergeStickers,
    replaceStickers,
    setSyncStatus,
    openConflict,
    closeConflict,
  ])

  // ============================================================
  // PUSH PUT: debounce de mudanças locais
  // ============================================================
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return
    if (isMergingRef.current || isBlockedRef.current) return

    const timer = setTimeout(async () => {
      const r = await pushFullState(false)
      if (!r) {
        setSyncStatus('error')
        return
      }

      if (r.status === 409) {
        // Sanity guard do servidor disparou — abre modal de conflito
        isBlockedRef.current = true
        const data = await r.json().catch(() => null)
        const remote = await fetchRemoteOnce()
        if (remote === null) {
          setSyncStatus('error')
          return
        }
        const localSize = Object.keys(
          useAlbumStore.getState().stickers
        ).length
        openConflict(
          {
            localSize,
            remoteSize: data?.currentSize ?? remote.length,
          },
          async (resolution) => {
            if (resolution === 'keep-cloud') {
              snapshotBeforeReplace('sync-conflict-keep-cloud')
              replaceStickers(remoteToLocal(remote))
              isBlockedRef.current = false
              closeConflict()
              return
            }
            if (resolution === 'merge') {
              const currentLocal = useAlbumStore.getState().stickers
              const merged = mergeStickerData(currentLocal, remote)
              mergeStickers(merged)
              isBlockedRef.current = false
              const r2 = await pushFullState(false)
              if (r2 && r2.ok) closeConflict()
              else setSyncStatus('error')
              return
            }
            if (resolution === 'keep-local') {
              isBlockedRef.current = false
              const r2 = await pushFullState(true)
              if (r2 && r2.ok) closeConflict()
              else setSyncStatus('error')
              return
            }
          }
        )
        return
      }

      if (!r.ok) {
        setSyncStatus('error')
        return
      }

      setSyncStatus('ok')
    }, PUT_DEBOUNCE)

    return () => clearTimeout(timer)
  }, [
    stickers,
    status,
    session?.user?.id,
    setSyncStatus,
    openConflict,
    closeConflict,
    mergeStickers,
    replaceStickers,
  ])
}
