'use client'

import { create } from 'zustand'

export type ConflictResolution = 'keep-cloud' | 'keep-local' | 'merge'

export type ConflictState = {
  localSize: number
  remoteSize: number
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'ok' | 'conflict'

interface SyncStateStore {
  status: SyncStatus
  conflict: ConflictState | null
  /** Resolver injetado pelo useSyncStore (acesso fechado sobre o estado). */
  resolveConflict: ((resolution: ConflictResolution) => Promise<void>) | null

  setStatus: (s: SyncStatus) => void
  openConflict: (
    c: ConflictState,
    resolver: (resolution: ConflictResolution) => Promise<void>
  ) => void
  closeConflict: () => void
}

export const useSyncState = create<SyncStateStore>((set) => ({
  status: 'idle',
  conflict: null,
  resolveConflict: null,

  setStatus: (status) => set({ status }),

  openConflict: (conflict, resolver) =>
    set({ status: 'conflict', conflict, resolveConflict: resolver }),

  closeConflict: () =>
    set({ status: 'ok', conflict: null, resolveConflict: null }),
}))
