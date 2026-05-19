'use client'

import { SessionProvider } from 'next-auth/react'
import { useSyncStore } from '@/hooks/useSyncStore'
import { ConflictModal } from '@/components/ConflictModal'
import { AccountChoiceModal } from '@/components/AccountChoiceModal'

function SyncManager() {
  useSyncStore()
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
