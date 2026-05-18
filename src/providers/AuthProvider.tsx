'use client'

import { SessionProvider } from 'next-auth/react'
import { useSyncStore } from '@/hooks/useSyncStore'
import { ConflictModal } from '@/components/ConflictModal'

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
    </SessionProvider>
  )
}
