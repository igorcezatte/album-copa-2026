'use client'

import { useEffect } from 'react'
import { getTheme } from '@/utils/theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', getTheme())
  }, [])

  return <>{children}</>
}
