'use client'

import { useEffect, useState } from 'react'
import {
  detectInAppBrowser,
  detectOS,
  type InAppBrowserInfo,
} from '@/utils/detectInAppBrowser'

const DISMISS_KEY = 'copa26-iab-dismissed'

export function InAppBrowserBanner() {
  const [info, setInfo] = useState<InAppBrowserInfo | null>(null)
  const [os, setOs] = useState<'ios' | 'android' | 'other'>('other')
  const [copied, setCopied] = useState(false)
  const [dismissed, setDismissed] = useState(true) // começa true pra evitar flash em SSR

  useEffect(() => {
    try {
      const wasDismissed = sessionStorage.getItem(DISMISS_KEY) === '1'
      setDismissed(wasDismissed)
    } catch {
      setDismissed(false)
    }
    setInfo(detectInAppBrowser(navigator.userAgent))
    setOs(detectOS(navigator.userAgent))
  }, [])

  if (dismissed || !info) return null

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {}
    setDismissed(true)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard bloqueado — fallback seleciona o texto via prompt
      try {
        window.prompt('Copie o link:', window.location.href)
      } catch {}
    }
  }

  const browserHint =
    os === 'ios'
      ? 'Toque ⋯ e escolha "Abrir no Safari"'
      : os === 'android'
        ? 'Toque ⋮ e escolha "Abrir no Chrome"'
        : 'Cole o link no seu navegador padrão'

  return (
    <div
      role="alert"
      className="mx-4 mt-4 mb-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 animate-fade-in"
    >
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center mt-0.5">
          <svg
            className="w-3.5 h-3.5 text-amber-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.74-3l-7-12a2 2 0 00-3.48 0l-7 12A2 2 0 005 19z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-display font-bold tracking-wide uppercase text-amber-200 leading-tight">
            Você está no {info.label}
          </p>
          <p className="text-[11px] text-white/70 leading-snug mt-1">
            Pra salvar suas figurinhas, abra esse link no seu navegador (Safari
            ou Chrome). {browserHint}.
          </p>
          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={handleCopy}
              className="text-[10px] font-mono font-black tracking-widest uppercase bg-white/10 text-white px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform"
            >
              {copied ? '✓ Copiado' : 'Copiar link'}
            </button>
            <button
              onClick={handleDismiss}
              className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/40 hover:text-white/70 px-2.5 py-1.5"
            >
              Continuar aqui
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/30 hover:text-white/60 p-1 -mr-1 flex-shrink-0"
          aria-label="Fechar"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
