'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useAlbumStore } from '@/store/albumStore'
import { shouldShowSyncBanner, getBannerDismissed, dismissBanner } from '@/utils/syncBanner'
import { useShallow } from 'zustand/react/shallow'
import { LocalAuthForm } from './LocalAuthForm'

export function SyncBanner() {
  const { data: session } = useSession()
  const total = useAlbumStore(useShallow((s) => s.getTotalProgress()))
  const [dismissed, setDismissed] = useState(true) // começa true pra evitar flash
  const [showLocalAuth, setShowLocalAuth] = useState(false)

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
    <>
      <div
        className="mx-4 mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 animate-fade-in corner-cut corner-cut-sm"
        style={{ ['--cut-accent' as string]: 'rgba(245, 196, 46, 0.4)' } as React.CSSProperties}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-copa-gold/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-copa-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-display font-bold tracking-wide uppercase text-white/80 leading-tight">
              Suas figurinhas só existem aqui
            </p>
            <p className="text-[10px] font-mono tracking-wider text-white/40 leading-tight mt-1">
              Entre pra salvar em qualquer dispositivo
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/25 p-1 flex-shrink-0"
            aria-label="Fechar"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="flex-1 text-[10px] font-mono font-black tracking-widest uppercase text-copa-gold bg-copa-gold/10 px-2.5 py-2 rounded-lg active:scale-95 transition-transform"
          >
            Entrar com Google
          </button>
          <button
            onClick={() => setShowLocalAuth(true)}
            className="flex-1 text-[10px] font-mono font-bold tracking-widest uppercase text-white/70 bg-white/5 border border-white/10 px-2.5 py-2 rounded-lg active:scale-95 transition-transform"
          >
            Apelido e senha
          </button>
        </div>
      </div>

      {showLocalAuth && (
        <LocalAuthForm
          variant="modal"
          initialTab="signup"
          onClose={() => setShowLocalAuth(false)}
        />
      )}
    </>
  )
}
