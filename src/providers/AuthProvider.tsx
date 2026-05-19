'use client'

import { SessionProvider } from 'next-auth/react'
import { useSyncStore } from '@/hooks/useSyncStore'
import { useDailyAutoSave } from '@/hooks/useDailyAutoSave'
import { ConflictModal } from '@/components/ConflictModal'
import { AccountChoiceModal } from '@/components/AccountChoiceModal'

function SyncManager() {
  useSyncStore()
  useDailyAutoSave()
  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SyncManager />
      {children}
      <ConflictModal />
      <AccountChoiceModal />
    </SessionProvider>
  )
}
