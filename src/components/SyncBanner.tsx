'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useAlbumStore } from '@/store/albumStore'
import { shouldShowSyncBanner, getBannerDismissed, dismissBanner } from '@/utils/syncBanner'

export function SyncBanner() {
  const { data: session } = useSession()
  const total = useAlbumStore((s) => s.getTotalProgress())
  const [dismissed, setDismissed] = useState(true) // começa true pra evitar flash

  useEffect(() => {
    setDismissed(getBannerDismissed())
  }, [])

  // Não mostra se logado ou dispensado ou abaixo do threshold
  if (session?.user) return null
  if (!shouldShowSyncBanner(total.collected, dismissed)) return null

  const handleDismiss = () => {
    dismissBanner()
    setDismissed(true)
  }

  return (
    <div className="mx-4 mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-copa-gold/10 flex items-center justify-center">
        <svg className="w-4 h-4 text-copa-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-white/80 leading-tight">
          Salvo neste dispositivo
        </p>
        <p className="text-[10px] text-white/40 leading-tight mt-0.5">
          Crie uma conta grátis para acessar de qualquer celular
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="text-[10px] font-black text-copa-gold bg-copa-gold/10 px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform whitespace-nowrap"
        >
          Entrar
        </button>
        <button
          onClick={handleDismiss}
          className="text-white/25 p-1"
          aria-label="Fechar"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
