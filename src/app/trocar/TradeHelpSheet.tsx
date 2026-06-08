'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Os 3 passos da troca presencial. Compartilhados entre o guia empty-state
 * (versão curta — só title) e este sheet (com a frase de utilidade).
 */
export const TRADE_STEPS = [
  { title: 'Marque suas repetidas', detail: 'O que você entrega. Abra a seleção e toque nos números que vai dar.' },
  { title: 'Busque o que falta', detail: 'O que você pega. O selo verde FALTA / laranja JÁ TEM avisa na hora.' },
  { title: 'Veja se tá 1 por 1', detail: 'O app conta os dois lados; o placar embaixo mostra se a troca está justa.' },
] as const

/**
 * Sheet "Como funciona" — explica o fluxo da troca na hora.
 * Via createPortal (sob backdrop-blur o `fixed` quebra — padrão de modais do app).
 */
export function TradeHelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!open || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg rounded-t-3xl border-t border-white/10 px-4 pt-5 animate-fade-in max-h-[85vh] overflow-y-auto"
        style={{ background: 'var(--copa-bg)', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5">
          <p className="text-[10px] text-white/30 font-mono tracking-[0.22em] uppercase">Trocar na hora</p>
          <h2 className="text-xl font-display font-black text-white tracking-tight uppercase leading-none mt-0.5">
            Como funciona
          </h2>
          <p className="text-[11px] font-mono tracking-wider text-white/40 mt-1.5">
            Monte a troca aqui — o app confere pra você.
          </p>
        </div>

        <ol className="flex flex-col gap-3 mb-5">
          {TRADE_STEPS.map((step, i) => (
            <li
              key={step.title}
              className="flex gap-3 rounded-2xl border border-white/5 p-3 corner-cut corner-cut-sm"
              style={{ background: 'var(--copa-card)', ['--cut-accent' as string]: 'var(--cut-accent-neutral)' } as React.CSSProperties}
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-copa-gold/15 text-copa-gold font-display font-black text-sm flex items-center justify-center leading-none">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-display font-bold tracking-wide uppercase text-white leading-tight">{step.title}</p>
                <p className="text-[11px] font-mono tracking-wider text-white/45 mt-1 leading-snug">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="text-[9px] font-mono tracking-wider text-white/30 text-center mb-4 px-2">
          Fica só nesse aparelho até você concluir.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white/5 text-white/70 text-[11px] font-mono font-black tracking-widest uppercase active:scale-95 transition-transform"
        >
          Entendi
        </button>
      </div>
    </div>,
    document.body,
  )
}
