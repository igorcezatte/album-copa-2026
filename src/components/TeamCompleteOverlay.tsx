'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Flag } from './Flag'
import { useCelebrationStore } from '@/store/celebrationStore'
import { fireConfetti } from '@/utils/confetti'
import { playGoalRoar } from '@/utils/sound'
import { vibrateSuccess } from '@/utils/haptics'

const AUTO_DISMISS_MS = 2500

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Momento-conquista "gol de estádio". Montado uma vez no layout; renderiza via
 * createPortal no body porque NavBar/DesktopHeader são fixed sob backdrop-blur
 * (fixed aninhado quebra). Aparece, toca rugido + confete + vibra, e some
 * sozinho em ~2.5s — tap fecha antes. Texto sempre claro (cena escura),
 * via cores inline pra não ser invertido pelo tema light.
 */
export function TeamCompleteOverlay() {
  const active = useCelebrationStore((s) => s.active)
  const dismiss = useCelebrationStore((s) => s.dismiss)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!active) return
    const reduced = prefersReducedMotion()

    fireConfetti(active.color)
    playGoalRoar()
    vibrateSuccess()

    const timer = window.setTimeout(dismiss, reduced ? 1800 : AUTO_DISMISS_MS)
    return () => window.clearTimeout(timer)
  }, [active, dismiss])

  if (!mounted || !active) return null

  const reduced = prefersReducedMotion()
  const headline = active.isSpecial ? 'SEÇÃO COMPLETA' : 'GOOOL!'
  const { color } = active

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      onClick={dismiss}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      style={{ animation: reduced ? undefined : 'fade-in 0.25s ease-out both' }}
    >
      {/* Scrim escuro */}
      <div className="absolute inset-0" style={{ background: 'rgba(3,5,10,0.82)' }} />

      {/* Flood da cor do time, expandindo do centro */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 46%, ${color}cc 0%, ${color}55 30%, transparent 62%)`,
          animation: reduced ? undefined : 'goal-flood 0.7s ease-out both',
        }}
      />

      {/* Holofotes de estádio varrendo */}
      {!reduced && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div
            className="absolute -top-1/2 left-1/2 h-[200%] w-[140%] -translate-x-1/2"
            style={{
              background:
                'conic-gradient(from 90deg at 50% 0%, transparent 0deg, rgba(255,255,255,0.10) 14deg, transparent 28deg, transparent 60deg, rgba(255,255,255,0.08) 74deg, transparent 88deg)',
              animation: 'stadium-sweep 2.4s ease-in-out both',
              transformOrigin: '50% 0%',
            }}
          />
        </div>
      )}

      {/* Conteúdo */}
      <div
        className="relative z-10 flex flex-col items-center px-6 text-center"
        style={{ animation: reduced ? undefined : 'goal-punch 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        <h2
          className="font-display font-black uppercase leading-none tracking-tight"
          style={{
            color: '#fff',
            fontSize: active.isSpecial ? 'clamp(2.4rem, 13vw, 4.5rem)' : 'clamp(3.4rem, 20vw, 7rem)',
            textShadow: `0 0 28px ${color}, 0 6px 24px rgba(0,0,0,0.55)`,
            letterSpacing: '-0.02em',
          }}
        >
          {headline}
        </h2>

        {/* Bandeira (time) ou badge (seção) + nome */}
        <div className="mt-5 flex items-center gap-3">
          {active.isSpecial ? (
            <div
              className="flex h-11 w-11 items-center justify-center corner-cut corner-cut-sm flex-shrink-0"
              style={{ background: color, ['--cut-accent' as string]: 'rgba(0,0,0,0.35)' } as React.CSSProperties}
            >
              <span className="font-display font-black leading-none" style={{ color: '#fff', fontSize: '1.1rem' }}>
                {active.badgeText}
              </span>
            </div>
          ) : (
            active.flagCode && <Flag code={active.flagCode} size="lg" />
          )}
          <span
            className="font-display font-black uppercase tracking-tight"
            style={{ color: '#fff', fontSize: 'clamp(1.4rem, 7vw, 2.25rem)' }}
          >
            {active.name}
          </span>
        </div>

        {/* Placar estilo LED de estádio */}
        <div
          className="mt-6 flex items-center gap-3 rounded-lg px-5 py-2.5"
          style={{ background: 'rgba(0,0,0,0.55)', border: `1px solid ${color}66` }}
        >
          <span
            className="font-mono font-bold leading-none"
            style={{ color, fontSize: '1.6rem', letterSpacing: '0.08em' }}
          >
            {active.total}/{active.total}
          </span>
          <span
            className="font-display font-bold uppercase tracking-[0.25em] leading-none"
            style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.7rem' }}
          >
            Completo
          </span>
        </div>

        <p
          className="mt-6 font-mono uppercase tracking-[0.22em]"
          style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.625rem' }}
        >
          Toque para fechar
        </p>
      </div>
    </div>,
    document.body,
  )
}
