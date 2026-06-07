'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { resolveStickerVisual } from '@/utils/trade'
import { useAlbumStore } from '@/store/albumStore'
import { useTradeSession, tradeTotal } from '@/store/tradeSessionStore'
import { StickerThumb } from './StickerThumb'
import { HaveBadge } from './TakingSearch'

function ItemLine({ id, showHave }: { id: string; showHave?: boolean }) {
  const v = resolveStickerVisual(id)
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
      <StickerThumb visual={v} size="xs" />
      <span className="flex-1 min-w-0 text-[11px] font-display font-bold tracking-wide uppercase text-white truncate">
        {v.label}
        <span className="text-white/35 font-mono ml-1 text-[10px] tracking-wider">#{v.number.padStart(2, '0')}</span>
      </span>
      {showHave && <HaveBadge id={id} />}
    </div>
  )
}

function expand(map: Record<string, number>): string[] {
  const out: string[] = []
  for (const [id, n] of Object.entries(map)) for (let i = 0; i < n; i++) out.push(id)
  return out
}

/**
 * Resumo da troca + decisão de aplicar ou não ao álbum.
 * Via createPortal (sob backdrop-blur o `fixed` quebra — ver padrão de modais).
 */
export function TradeConfirmSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const giving = useTradeSession((s) => s.giving)
  const taking = useTradeSession((s) => s.taking)
  const clear = useTradeSession((s) => s.clear)
  const applyTrade = useAlbumStore((s) => s.applyTrade)

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!open || !mounted) return null

  const givingIds = expand(giving)
  const takingIds = expand(taking)
  const g = tradeTotal(giving)
  const t = tradeTotal(taking)
  const balanced = g === t && g > 0

  const handleApply = () => {
    applyTrade(giving, taking)
    clear()
    onClose()
  }
  const handleCloseOnly = () => {
    clear()
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg rounded-t-3xl border-t border-white/10 px-4 pt-5 pb-8 animate-fade-in max-h-[85vh] overflow-y-auto"
        style={{ background: 'var(--copa-bg)', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <p className="text-[10px] text-white/30 font-mono tracking-[0.22em] uppercase">Concluir troca</p>
          <h2 className="text-xl font-display font-black text-white tracking-tight uppercase leading-none mt-0.5">
            Confere aí
          </h2>
          <p className="text-[11px] font-mono tracking-wider mt-1.5" style={{ color: balanced ? 'var(--copa-field)' : 'rgba(255,255,255,0.4)' }}>
            {balanced ? 'Troca justa · 1 por 1' : `Você entrega ${g} · pega ${t}`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl border border-white/5 p-3 corner-cut corner-cut-sm" style={{ background: 'var(--copa-card)', ['--cut-accent' as string]: 'rgba(245,158,11,0.5)' } as React.CSSProperties}>
            <p className="text-[9px] font-mono font-black tracking-widest uppercase mb-2 text-amber-400">Você entrega · {g}</p>
            {givingIds.length === 0
              ? <p className="text-[10px] font-mono tracking-wider text-white/25 uppercase">Nada</p>
              : givingIds.map((id, i) => <ItemLine key={`g${i}`} id={id} />)}
          </div>
          <div className="rounded-2xl border border-white/5 p-3 corner-cut corner-cut-sm" style={{ background: 'var(--copa-card)', ['--cut-accent' as string]: 'rgba(21,160,101,0.5)' } as React.CSSProperties}>
            <p className="text-[9px] font-mono font-black tracking-widest uppercase mb-2" style={{ color: 'var(--copa-field)' }}>Você pega · {t}</p>
            {takingIds.length === 0
              ? <p className="text-[10px] font-mono tracking-wider text-white/25 uppercase">Nada</p>
              : takingIds.map((id, i) => <ItemLine key={`t${i}`} id={id} showHave />)}
          </div>
        </div>

        <button
          onClick={handleApply}
          className="w-full py-3 rounded-xl bg-copa-gold text-black text-[11px] font-mono font-black tracking-widest uppercase active:scale-95 transition-transform mb-2"
        >
          Aplicar ao álbum
        </button>
        <p className="text-[9px] font-mono tracking-wider text-white/30 text-center mb-3 px-2">
          tira as entregues das suas repetidas e marca as que você pegou
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleCloseOnly}
            className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 text-[10px] font-mono font-bold tracking-widest uppercase active:scale-95 transition-transform"
          >
            Só fechar
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 text-[10px] font-mono font-bold tracking-widest uppercase active:scale-95 transition-transform"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
