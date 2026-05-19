'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export type ShareFormat = 'png' | 'text' | 'pdf'

interface Props {
  open: boolean
  onClose: () => void
  onShare: (format: ShareFormat) => Promise<void>
}

const OPTIONS: Array<{
  format: ShareFormat
  icon: string
  label: string
  subtitle: string
  highlight?: boolean
}> = [
  {
    format: 'png',
    icon: '🖼️',
    label: 'Imagem',
    subtitle: 'Card de progresso pra status e stories',
    highlight: true,
  },
  {
    format: 'pdf',
    icon: '📄',
    label: 'PDF',
    subtitle: 'Lista completa com bandeiras',
  },
  {
    format: 'text',
    icon: '💬',
    label: 'Texto',
    subtitle: 'Mensagem rápida copiável',
  },
]

export function ShareSheet({ open, onClose, onShare }: Props) {
  const [busy, setBusy] = useState<ShareFormat | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!open || !mounted) return null

  const handle = async (format: ShareFormat) => {
    if (busy) return
    setBusy(format)
    try {
      await onShare(format)
    } finally {
      setBusy(null)
      // dá tempo de mostrar o feedback antes de fechar
      setTimeout(() => onClose(), 250)
    }
  }

  // Portal pra document.body — escapa containing blocks criados por
  // transforms nos wrappers das páginas (animate-fade-in etc.)
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sharesheet-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose()
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
        style={{ background: 'var(--copa-card)' }}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-copa-gold/15 flex items-center justify-center text-xl">
            📤
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="sharesheet-title" className="text-base font-black text-white">
              Compartilhar coleção
            </h2>
            <p className="text-[11px] text-white/40">
              Escolha o formato que melhor se encaixa
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={!!busy}
            aria-label="Fechar"
            className="text-white/30 p-1 active:scale-90 transition-transform disabled:opacity-30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Options */}
        <div className="p-3 space-y-2">
          {OPTIONS.map((opt) => {
            const isBusy = busy === opt.format
            return (
              <button
                key={opt.format}
                onClick={() => handle(opt.format)}
                disabled={!!busy}
                className="w-full p-4 rounded-2xl flex items-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-50"
                style={{
                  background: opt.highlight
                    ? 'rgba(245, 196, 46, 0.08)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: opt.highlight
                    ? '1px solid rgba(245, 196, 46, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <span className="text-2xl" aria-hidden>{opt.icon}</span>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-black text-white">
                      {opt.label}
                    </span>
                    {opt.highlight && (
                      <span className="text-[9px] font-black bg-copa-gold text-black px-1.5 py-0.5 rounded-full">
                        RECOMENDADO
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/40 leading-tight mt-0.5">
                    {opt.subtitle}
                  </p>
                </div>
                {isBusy ? (
                  <svg className="w-4 h-4 animate-spin text-white/60" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>,
    document.body
  )
}
