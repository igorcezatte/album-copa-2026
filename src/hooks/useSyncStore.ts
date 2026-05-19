'use client'

import { useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useAlbumStore } from '@/store/albumStore'
import {
  useSyncState,
  type ConflictResolution,
  type AccountChoiceResolution,
} from '@/store/syncState'
import {
  buildSyncPayload,
  mergeStickerData,
  type RemoteStickerEntry,
} from '@/utils/migration'
import { classifyInitialSync } from '@/utils/syncGuards'
import {
  saveSnapshot,
  type SnapshotReason,
  getLastUserId,
  setLastUserId,
} from '@/utils/localBackup'

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
  const openAccountChoice = useSyncState((s) => s.openAccountChoice)
  const closeAccountChoice = useSyncState((s) => s.closeAccountChoice)

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

    const buildConflictResolver =
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

    // Resolver do modal de escolha de conta (welcome ou mismatch).
    // Diferente do conflict: aqui o sync ainda nao foi marcado como concluido,
    // entao precisamos setar a flag synced-{userId} + last-user-id manualmente
    // depois da resolucao.
    const buildAccountChoiceResolver =
      (remoteStickers: RemoteStickerEntry[]) =>
      async (resolution: AccountChoiceResolution) => {
        if (resolution === 'sign-out') {
          // Local intacto, sem flags, sem PUT. Devolve usuário ao modo anônimo.
          isBlockedRef.current = false
          closeAccountChoice()
          await signOut({ callbackUrl: '/' })
          return
        }

        if (resolution === 'link-local') {
          // Mantém local, mergeia com remoto, manda pro Supabase desta conta.
          // ATENÇÃO: no caso mismatch, isso PODE sobrescrever a conta nova com
          // dados da antiga — é uma escolha consciente do usuário (com aviso
          // no modal). No caso welcome é o comportamento padrão antes do bug.
          const currentLocal = useAlbumStore.getState().stickers
          const merged = mergeStickerData(currentLocal, remoteStickers)
          mergeStickers(merged)
          localStorage.setItem(`${SYNCED_KEY}-${userId}`, 'true')
          setLastUserId(userId)
          isBlockedRef.current = false
          closeAccountChoice()
          // Force pra contornar o guard do servidor se conta atual estiver vazia
          // e estivermos enviando volume relevante (caso welcome).
          await pushFullState(true)
          setSyncStatus('ok')
          return
        }

        if (resolution === 'start-fresh') {
          // Snapshot do estado atual e adopta o remoto. Resolve tanto mismatch
          // (limpa dados da outra conta) quanto welcome (descarta locais).
          snapshotBeforeReplace('sync-replace')
          replaceStickers(remoteToLocal(remoteStickers))
          localStorage.setItem(`${SYNCED_KEY}-${userId}`, 'true')
          setLastUserId(userId)
          isBlockedRef.current = false
          closeAccountChoice()
          setSyncStatus('ok')
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
      const lastUserId = getLastUserId()

      const decision = classifyInitialSync({
        userId,
        localSize,
        remoteSize,
        syncedBefore,
        lastUserId,
      })

      switch (decision.kind) {
        case 'same-user-conflict': {
          isBlockedRef.current = true
          openConflict(
            { localSize, remoteSize },
            buildConflictResolver(remoteStickers)
          )
          return
        }

        case 'same-user-pull': {
          // Mesma conta: remoto é fonte de verdade. Snapshot e substitui.
          snapshotBeforeReplace('sync-replace')
          replaceStickers(remoteToLocal(remoteStickers))
          setLastUserId(userId)
          setSyncStatus('ok')
          return
        }

        case 'pull-silent': {
          // Sem dados locais, primeira vez: adota o remoto direto.
          replaceStickers(remoteToLocal(remoteStickers))
          localStorage.setItem(`${SYNCED_KEY}-${userId}`, 'true')
          setLastUserId(userId)
          setSyncStatus('ok')
          return
        }

        case 'mismatch-modal':
        case 'welcome-modal': {
          // Bloqueia PUT até o usuário escolher pra evitar mandar dados
          // errados pra nuvem da conta nova.
          isBlockedRef.current = true
          openAccountChoice(
            {
              kind: decision.kind === 'mismatch-modal' ? 'mismatch' : 'welcome',
              localSize,
            },
            buildAccountChoiceResolver(remoteStickers)
          )
          return
        }
      }
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
    openAccountChoice,
    closeAccountChoice,
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
