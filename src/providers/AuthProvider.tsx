'use client'

import { SessionProvider } from 'next-auth/react'
import { useSyncStore } from '@/hooks/useSyncStore'

function SyncManager() {
  useSyncStore()
  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SyncManager />
      {children}
    </SessionProvider>
  )
}
