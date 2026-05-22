'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { signIn } from 'next-auth/react'
import { LocalAuthForm } from './LocalAuthForm'

interface SignInSheetProps {
  open: boolean
  onClose: () => void
  /** URL pra onde voltar após signIn com Google. Default: '/' */
  callbackUrl?: string
}

/**
 * Bottom sheet de escolha de método de login. Usado nos pontos onde só cabe
 * UM botão "Entrar" (header, banners compactos) — clicar abre esse sheet com
 * as duas opções: Google (recomendado) e Apelido+senha.
 *
 * Mudar de "choose" pra "local" mantém o sheet aberto; o LocalAuthForm
 * renderiza inline. Botão de voltar leva pro choose.
 */
export function SignInSheet({
  open,
  onClose,
  callbackUrl = '/',
}: SignInSheetProps) {
  const [mode, setMode] = useState<'choose' | 'local'>('choose')
  const [mounted, setMounted] = useState(false)

  // Garante render só client-side (portal precisa de document.body)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset pro choose ao reabrir
  useEffect(() => {
    if (open) setMode('choose')
  }, [open])

  // ESC fecha
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleGoogle = useCallback(() => {
    signIn('google', { callbackUrl })
  }, [callbackUrl])

  if (!open || !mounted) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-sheet-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl corner-cut corner-cut-md"
        style={{
          background: 'var(--copa-card)',
          ['--cut-accent' as string]: 'var(--cut-accent-neutral)',
        } as React.CSSProperties}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {mode === 'local' && (
              <button
                onClick={() => setMode('choose')}
                aria-label="Voltar"
                className="text-white/40 hover:text-white p-1 -ml-1.5 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="min-w-0">
              <p className="text-[10px] text-white/30 font-mono tracking-[0.22em] uppercase">
                {mode === 'choose' ? 'Entrar' : 'Sem Google'}
              </p>
              <h2
                id="signin-sheet-title"
                className="text-xl font-display font-black text-white tracking-tight uppercase leading-none mt-1"
              >
                {mode === 'choose' ? 'Escolha como entrar' : 'Apelido e senha'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-white/40 hover:text-white p-1.5 -mt-1 -mr-1.5 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {mode === 'choose' && (
          <div className="px-5 pb-5 space-y-2">
            <button
              onClick={handleGoogle}
              className="w-full p-4 rounded-2xl bg-copa-gold/10 border border-copa-gold/30 active:scale-[0.98] transition-transform flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-copa-gold" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.908 8.908 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" />
                </svg>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-display font-bold tracking-wide uppercase text-white">
                  Entrar com Google
                </p>
                <p className="text-[10px] font-mono tracking-wider text-white/40 mt-0.5">
                  Recuperável · sincroniza em qualquer device
                </p>
              </div>
              <span className="text-[9px] font-mono font-black tracking-widest uppercase bg-copa-gold/20 text-copa-gold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                Recom.
              </span>
            </button>

            <button
              onClick={() => setMode('local')}
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 active:scale-[0.98] transition-transform flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-display font-bold tracking-wide uppercase text-white">
                  Apelido e senha
                </p>
                <p className="text-[10px] font-mono tracking-wider text-white/40 mt-0.5">
                  Sem email · sem recuperação
                </p>
              </div>
              <svg className="w-4 h-4 text-white/20 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {mode === 'local' && (
          <div className="px-5 pb-5">
            <LocalAuthForm
              variant="inline"
              initialTab="signup"
              onSuccess={onClose}
            />
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
