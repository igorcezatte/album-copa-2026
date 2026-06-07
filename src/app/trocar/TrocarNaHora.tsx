'use client'

import { useMemo, useState } from 'react'
import { useAlbumStore } from '@/store/albumStore'
import { useTradeSession, tradeTotal } from '@/store/tradeSessionStore'
import { useHydrated } from '@/hooks/useHydrated'
import { cn } from '@/lib/utils'
import { GiveByTeam } from './GiveByTeam'
import { TakingSearch, TakingItemCard } from './TakingSearch'
import { TradeConfirmSheet } from './TradeConfirmSheet'

function SectionTitle({ kicker, title, count, color }: { kicker: string; title: string; count: number; color?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <div>
        <p className="text-[9px] font-mono tracking-[0.22em] uppercase text-white/30">{kicker}</p>
        <h2 className="text-base font-display font-black tracking-tight uppercase text-white leading-none mt-0.5">{title}</h2>
      </div>
      <span className="font-display font-black text-2xl tracking-tight leading-none" style={{ color: color ?? 'rgba(255,255,255,0.85)' }}>{count}</span>
    </div>
  )
}

export function TrocarNaHora() {
  const hydrated = useHydrated()
  const stickers = useAlbumStore((s) => s.stickers)
  const giving = useTradeSession((s) => s.giving)
  const taking = useTradeSession((s) => s.taking)
  const clear = useTradeSession((s) => s.clear)

  const [confirmOpen, setConfirmOpen] = useState(false)

  // Repetidas (extras) derivadas do mapa estável de stickers — evita snapshot
  // instável do useSyncExternalStore.
  const duplicates = useMemo(
    () =>
      Object.entries(stickers)
        .filter(([, v]) => v.quantity > 1)
        .map(([id, v]) => ({ id, available: v.quantity - 1 }))
        .sort((a, b) => b.available - a.available),
    [stickers],
  )

  const takingIds = useMemo(() => Object.keys(taking), [taking])
  const g = tradeTotal(giving)
  const t = tradeTotal(taking)
  const balanced = g === t && g > 0
  const hasSession = g > 0 || t > 0

  if (!hydrated) {
    return <p className="text-[11px] font-mono uppercase tracking-widest text-white/30 px-1 py-10 text-center">Carregando…</p>
  }

  return (
    <div className="pb-40">
      <p className="text-[11px] text-white/40 font-mono tracking-wider mb-5">
        Abra a seleção e toque nos números que vai dar. Busque o que vai pegar. O app conta pra você.
      </p>

      {/* ENTREGA */}
      <section className="mb-7">
        <SectionTitle kicker="Você dá" title="Suas repetidas" count={g} color="#fbbf24" />

        {duplicates.length === 0 ? (
          <div className="rounded-2xl border border-white/5 px-4 py-8 text-center corner-cut corner-cut-md" style={{ background: 'var(--copa-card)', ['--cut-accent' as string]: 'var(--cut-accent-neutral)' } as React.CSSProperties}>
            <p className="text-white/60 font-display font-bold tracking-wide uppercase text-sm">Sem repetidas ainda</p>
            <p className="text-white/30 text-[11px] mt-1.5 font-mono tracking-wider">Marque repetidas no álbum pra trazê-las pra cá</p>
          </div>
        ) : (
          <GiveByTeam duplicates={duplicates} />
        )}
      </section>

      {/* PEGA */}
      <section>
        <SectionTitle kicker="Você pega" title="O que vem pra você" count={t} color="var(--copa-field)" />

        {takingIds.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {takingIds.map((id) => (
              <TakingItemCard key={id} id={id} />
            ))}
          </div>
        )}

        <TakingSearch />
      </section>

      {/* Placar fixo */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 border-t border-white/10" style={{ background: 'color-mix(in srgb, var(--copa-bg) 92%, transparent)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-lg md:max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 leading-none">
              <span className="font-display font-black text-lg tracking-tight text-amber-400">{g}</span>
              <span className="text-white/30 font-mono text-sm" aria-hidden>⇄</span>
              <span className="font-display font-black text-lg tracking-tight" style={{ color: 'var(--copa-field)' }}>{t}</span>
            </div>
            <p className="text-[9px] font-mono tracking-widest uppercase mt-1" style={{ color: balanced ? 'var(--copa-field)' : 'rgba(255,255,255,0.35)' }}>
              {!hasSession ? 'Dá · Pega' : balanced ? 'Troca justa · 1 por 1' : g > t ? `${g - t} a mais saindo` : `${t - g} a mais entrando`}
            </p>
          </div>

          {hasSession && (
            <button
              onClick={clear}
              className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/40 active:text-white/70 transition-colors px-2"
            >
              Limpar
            </button>
          )}
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={!hasSession}
            className={cn(
              'px-5 py-2.5 rounded-xl text-[11px] font-mono font-black tracking-widest uppercase active:scale-95 transition-transform',
              hasSession ? 'bg-copa-gold text-black' : 'bg-white/5 text-white/30',
            )}
          >
            Concluir
          </button>
        </div>
      </div>

      <TradeConfirmSheet open={confirmOpen} onClose={() => setConfirmOpen(false)} />
    </div>
  )
}
