'use client'

import { useMemo, useRef, useState } from 'react'
import { useAlbumStore } from '@/store/albumStore'
import { useTradeSession, tradeTotal } from '@/store/tradeSessionStore'
import { useHydrated } from '@/hooks/useHydrated'
import { cn } from '@/lib/utils'
import { readableTextOn } from '@/lib/teamColor'
import { GiveByTeam } from './GiveByTeam'
import { TakingSearch, TakingItemCard } from './TakingSearch'
import { TradeConfirmSheet } from './TradeConfirmSheet'
import { TradeHelpSheet, TRADE_STEPS } from './TradeHelpSheet'

const GIVE_COLOR = '#fbbf24'
const TAKE_COLOR = 'var(--copa-field)'

type Side = 'da' | 'pega'

/** Faixa-cabeçalho sólida na cor do lado, conectada ao corpo da caixa. */
function SectionBand({ kicker, title, count, color }: { kicker: string; title: string; count: number; color: string }) {
  // Texto legível na faixa; `var(...)` não dá pra medir luminância, então o
  // verde do PEGA é tratado como caso conhecido (texto branco).
  const fg = color.startsWith('#') ? readableTextOn(color) : '#ffffff'
  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-t-2xl" style={{ background: color }}>
      <div className="min-w-0" style={{ color: fg }}>
        <p className="text-[9px] font-mono font-black tracking-[0.2em] uppercase opacity-70 leading-none">{kicker}</p>
        <p className="text-sm font-display font-black tracking-tight uppercase leading-none mt-1 truncate">{title}</p>
      </div>
      <span className="font-display font-black text-2xl tracking-tight leading-none flex-shrink-0" style={{ color: fg }}>{count}</span>
    </div>
  )
}

/** Botão do seletor de aba — forte e colorido quando ativo. */
function SideTab({ active, color, label, sub, count, onClick }: { active: boolean; color: string; label: string; sub: string; count: number; onClick: () => void }) {
  const fg = active ? (color.startsWith('#') ? readableTextOn(color) : '#ffffff') : undefined
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex-1 text-left rounded-2xl px-3.5 py-3 transition-all active:scale-[0.98]',
        !active && 'bg-white/5',
      )}
      style={active ? { background: color, color: fg } : { color }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] font-mono font-black tracking-[0.18em] uppercase leading-none" style={{ opacity: active ? 0.75 : 1 }}>{label}</p>
        <span className="font-display font-black text-xl tracking-tight leading-none">{count}</span>
      </div>
      <p className="text-[10px] font-mono tracking-wider mt-1 leading-none" style={{ opacity: active ? 0.75 : 0.5 }}>{sub}</p>
    </button>
  )
}

export function TrocarNaHora() {
  const hydrated = useHydrated()
  const stickers = useAlbumStore((s) => s.stickers)
  const giving = useTradeSession((s) => s.giving)
  const taking = useTradeSession((s) => s.taking)
  const clear = useTradeSession((s) => s.clear)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [side, setSide] = useState<Side>('da')
  const tabsRef = useRef<HTMLDivElement>(null)

  const switchTo = (next: Side) => {
    setSide(next)
    // Reposiciona no topo do conteúdo — trocar de uma lista DÁ longa pra um
    // PEGA curto deixaria a tela rolada no vazio.
    requestAnimationFrame(() => tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

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
      {/* Link de ajuda — discreto, sempre disponível */}
      <button
        onClick={() => setHelpOpen(true)}
        className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest uppercase text-white/40 active:text-white/70 transition-colors mb-4"
      >
        <span className="w-4 h-4 rounded-full border border-white/25 flex items-center justify-center text-[10px] leading-none">?</span>
        Como funciona
      </button>

      {/* Guia empty-state — some sozinho quando a troca começa */}
      {!hasSession && (
        <div
          className="rounded-2xl border border-white/5 px-4 py-4 mb-5 corner-cut corner-cut-md"
          style={{ background: 'var(--copa-card)', ['--cut-accent' as string]: 'var(--cut-accent-neutral)' } as React.CSSProperties}
        >
          <p className="text-sm font-display font-black tracking-wide uppercase text-white leading-none">Vai trocar figurinhas?</p>
          <ol className="flex flex-col gap-2 mt-3.5">
            {TRADE_STEPS.map((step, i) => (
              <li key={step.title} className="flex items-center gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-copa-gold/15 text-copa-gold font-display font-black text-[11px] flex items-center justify-center leading-none">
                  {i + 1}
                </span>
                <span className="text-[12px] font-display font-bold tracking-wide uppercase text-white/80 leading-tight">{step.title}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Seletor de aba — uma metade por vez, forte e colorido */}
      <div ref={tabsRef} role="tablist" className="flex gap-2 mb-4 scroll-mt-20">
        <SideTab active={side === 'da'} color={GIVE_COLOR} label="Você dá" sub="suas repetidas" count={g} onClick={() => switchTo('da')} />
        <SideTab active={side === 'pega'} color={TAKE_COLOR} label="Você pega" sub="o que falta" count={t} onClick={() => switchTo('pega')} />
      </div>

      {/* Metade ativa — caixa delimitada com faixa colorida */}
      {side === 'da' ? (
        <section>
          <SectionBand kicker="Você dá" title="Suas repetidas" count={g} color={GIVE_COLOR} />
          <div
            className="rounded-b-2xl px-3.5 py-4"
            style={{ background: 'var(--copa-card)', border: `1px solid ${GIVE_COLOR}40`, borderTop: 'none' }}
          >
            {duplicates.length === 0 ? (
              <div className="px-1 py-8 text-center">
                <p className="text-white/60 font-display font-bold tracking-wide uppercase text-sm">Sem repetidas ainda</p>
                <p className="text-white/30 text-[11px] mt-1.5 font-mono tracking-wider">Marque repetidas no álbum pra trazê-las pra cá</p>
              </div>
            ) : (
              <GiveByTeam duplicates={duplicates} />
            )}
          </div>
        </section>
      ) : (
        <section>
          <SectionBand kicker="Você pega" title="O que vem pra você" count={t} color={TAKE_COLOR} />
          <div
            className="rounded-b-2xl px-3.5 py-4"
            style={{ background: 'var(--copa-card)', border: '1px solid color-mix(in srgb, var(--copa-field) 40%, transparent)', borderTop: 'none' }}
          >
            {takingIds.length > 0 && (
              <div className="flex flex-col gap-2 mb-3">
                {takingIds.map((id) => (
                  <TakingItemCard key={id} id={id} />
                ))}
              </div>
            )}
            <TakingSearch />
          </div>
        </section>
      )}

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
      <TradeHelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
