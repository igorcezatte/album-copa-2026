'use client'

import { useCallback, useEffect, useState } from 'react'

const WELCOME_FLAG = 'copa26-welcome-seen-v1'

/**
 * Modal de boas-vindas no primeiríssimo acesso ao app.
 *
 * Decisão: gate puro por flag em localStorage (`copa26-welcome-seen-v1`).
 * Não bloqueia nada — fechou, fechou pra sempre nesse browser. Sem competir
 * com AccountChoiceModal: aquele só dispara após login, esse roda no mount
 * pra anônimos zerados.
 */
export function WelcomeModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(WELCOME_FLAG)) {
        setOpen(true)
      }
    } catch {
      // storage bloqueado / SSR — silencia
    }
  }, [])

  const close = useCallback(() => {
    try {
      localStorage.setItem(WELCOME_FLAG, '1')
    } catch {}
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      onClick={close}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl corner-cut corner-cut-lg relative"
        style={{
          background: 'var(--copa-card)',
          ['--cut-accent' as string]: 'rgba(245, 196, 46, 0.7)',
        } as React.CSSProperties}
      >
        {/* Marca d'água tipográfica */}
        <span
          aria-hidden
          className="absolute -right-3 -top-8 font-display font-black text-[140px] leading-none text-white/[0.025] select-none pointer-events-none"
        >
          26
        </span>

        {/* Header */}
        <div className="px-6 pt-7 pb-5 relative">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-9 h-9 flex items-center justify-center font-display font-black text-base corner-cut corner-cut-sm"
              style={{
                background: 'linear-gradient(135deg, #f5c42e, #d4a017)',
                ['--cut-accent' as string]: 'rgba(0,0,0,0.4)',
              } as React.CSSProperties}
            >
              <span className="text-black tracking-tight">26</span>
            </div>
            <div>
              <p className="text-[10px] text-copa-gold/70 font-mono tracking-[0.22em] uppercase leading-none">
                Bem-vindo
              </p>
              <p className="text-[11px] text-white/50 font-mono tracking-[0.18em] uppercase mt-1 leading-none">
                Panini · FIFA World Cup 2026™
              </p>
            </div>
          </div>

          <h2
            id="welcome-title"
            className="text-3xl font-display font-black text-white tracking-tight uppercase leading-[0.95]"
          >
            Sua coleção,
            <br />
            <span className="text-copa-gold">simples e divertida</span>
          </h2>
          <p className="text-[13px] text-white/60 leading-relaxed mt-3">
            Colecione, organize e compartilhe suas figurinhas do álbum oficial
            da{' '}
            <span className="font-mono text-white/80">FIFA World Cup 2026™</span>{' '}
            da Panini de um jeito simples e divertido. Marque as que você já
            tem, veja o que falta e compartilhe com seus amigos.
          </p>
        </div>

        {/* Features */}
        <div className="px-6 pb-5 space-y-2.5">
          <Feature
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Organize seu álbum"
            desc="Marque cada figurinha e acompanhe o progresso por seleção"
          />
          <Feature
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            }
            title="Repetidas e faltantes"
            desc="Veja na hora o que tá sobrando e o que falta pra completar"
          />
          <Feature
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            }
            title="Troque com amigos"
            desc="Compartilhe sua lista por WhatsApp e complete o álbum junto"
          />
        </div>

        {/* CTA */}
        <div className="px-6 pb-7 pt-2">
          <button
            onClick={close}
            className="w-full relative overflow-hidden rounded-2xl py-4 active:scale-[0.98] transition-transform group corner-cut corner-cut-md"
            style={{
              background: 'linear-gradient(135deg, #f5c42e 0%, #d4a017 100%)',
              ['--cut-accent' as string]: 'rgba(0,0,0,0.4)',
            } as React.CSSProperties}
          >
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
            <span className="relative flex items-center justify-center gap-2 font-display font-black text-black text-lg tracking-wide uppercase">
              Começar
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
          <p className="text-center text-[10px] text-white/30 font-mono tracking-widest uppercase mt-3">
            100% gratuito · sem cadastro · offline
          </p>
        </div>
      </div>
    </div>
  )
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-copa-gold/10 text-copa-gold flex items-center justify-center mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-display font-bold text-white tracking-wide uppercase leading-tight">
          {title}
        </p>
        <p className="text-[11px] text-white/50 leading-snug mt-0.5">{desc}</p>
      </div>
    </div>
  )
}
