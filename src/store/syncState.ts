'use client'

import { create } from 'zustand'

export type ConflictResolution = 'keep-cloud' | 'keep-local' | 'merge'

export type ConflictState = {
  localSize: number
  remoteSize: number
}

// Modal de escolha exibido no PRIMEIRO sync de uma conta neste browser
// (não no caminho "conflito" pós-sync). Dois sabores:
//   - welcome: anônimo virou usuário, oferecemos vincular ou começar zero
//   - mismatch: detectamos que outra conta passou aqui antes, alarmamos
export type AccountChoiceKind = 'welcome' | 'mismatch'

export type AccountChoiceResolution = 'link-local' | 'start-fresh' | 'sign-out'

export type AccountChoiceState = {
  kind: AccountChoiceKind
  localSize: number
}

export type SyncStatus =
  | 'idle'
  | 'syncing'
  | 'error'
  | 'ok'
  | 'conflict'
  | 'account-choice'

interface SyncStateStore {
  status: SyncStatus
  conflict: ConflictState | null
  /** Resolver injetado pelo useSyncStore (acesso fechado sobre o estado). */
  resolveConflict: ((resolution: ConflictResolution) => Promise<void>) | null

  accountChoice: AccountChoiceState | null
  resolveAccountChoice:
    | ((resolution: AccountChoiceResolution) => Promise<void>)
    | null

  setStatus: (s: SyncStatus) => void
  openConflict: (
    c: ConflictState,
    resolver: (resolution: ConflictResolution) => Promise<void>
  ) => void
  closeConflict: () => void

  openAccountChoice: (
    c: AccountChoiceState,
    resolver: (resolution: AccountChoiceResolution) => Promise<void>
  ) => void
  closeAccountChoice: () => void
}

export const useSyncState = create<SyncStateStore>((set) => ({
  status: 'idle',
  conflict: null,
  resolveConflict: null,
  accountChoice: null,
  resolveAccountChoice: null,

  setStatus: (status) => set({ status }),

  openConflict: (conflict, resolver) =>
    set({ status: 'conflict', conflict, resolveConflict: resolver }),

  closeConflict: () =>
    set({ status: 'ok', conflict: null, resolveConflict: null }),

  openAccountChoice: (accountChoice, resolver) =>
    set({
      status: 'account-choice',
      accountChoice,
      resolveAccountChoice: resolver,
    }),

  closeAccountChoice: () =>
    set({
      status: 'ok',
      accountChoice: null,
      resolveAccountChoice: null,
    }),
}))
