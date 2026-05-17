'use client'

import { useState, useEffect } from 'react'
import { getTheme, toggleTheme, type Theme } from '@/utils/theme'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('pro')

  useEffect(() => {
    setTheme(getTheme())
  }, [])

  const handleToggle = () => {
    toggleTheme()
    setTheme(getTheme())
  }

  const isKids = theme === 'kids'

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all duration-150 active:scale-90',
        isKids
          ? 'bg-amber-100 text-amber-700'
          : 'bg-white/5 text-white/35 hover:text-white/50',
        className,
      )}
      aria-label={isKids ? 'Mudar para modo escuro' : 'Mudar para modo claro'}
      title={isKids ? 'Modo Kids ativo' : 'Modo Pro ativo'}
    >
      {isKids ? (
        <>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
          Kids
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          Pro
        </>
      )}
    </button>
  )
}
