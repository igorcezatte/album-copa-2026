'use client'

import { useState, useEffect } from 'react'
import { getSoundEnabled, toggleSound } from '@/utils/sound'
import { cn } from '@/lib/utils'

export function SoundToggle({ className }: { className?: string }) {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    setEnabled(getSoundEnabled())
  }, [])

  const handleToggle = () => {
    toggleSound()
    setEnabled(getSoundEnabled())
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90',
        enabled ? 'text-white/40 hover:text-white/60' : 'text-white/15',
        className,
      )}
      aria-label={enabled ? 'Desativar sons' : 'Ativar sons'}
      title={enabled ? 'Sons ativados' : 'Sons desativados'}
    >
      {enabled ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3M9.172 16.828A4 4 0 016 13H3v-2h3a4 4 0 013.172-3.828M12 6L9.172 7.172" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9a3 3 0 000 6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6a6 6 0 110 12" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      )}
    </button>
  )
}
