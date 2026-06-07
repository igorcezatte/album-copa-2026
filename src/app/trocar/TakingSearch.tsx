'use client'

import { useState } from 'react'
import { searchStickers } from '@/utils/search'
import { resolveStickerVisual } from '@/utils/trade'
import { useAlbumStore, stickerId } from '@/store/albumStore'
import { useTradeSession } from '@/store/tradeSessionStore'
import { cn } from '@/lib/utils'
import { StickerThumb } from './StickerThumb'

/**
 * Selo tem/falta — o coração do lado PEGA. Verde "FALTA" se o usuário não tem
 * a figurinha (vale pegar); laranja "JÁ TEM" se já possui (+N se tem repetida).
 */
export function HaveBadge({ id, className }: { id: string; className?: string }) {
  const qty = useAlbumStore((s) => s.getQuantity(id))
  const have = qty > 0
  return (
    <span
      className={cn(
        'text-[9px] font-mono font-black tracking-widest uppercase px-2 py-1 rounded-full whitespace-nowrap',
        className,
      )}
      style={
        have
          ? { background: 'rgba(245, 158, 11, 0.14)', color: '#fbbf24' }
          : { background: 'rgba(21, 160, 101, 0.16)', color: 'var(--copa-field)' }
      }
    >
      {have ? `JÁ TEM${qty > 1 ? ` +${qty - 1}` : ''}` : 'FALTA'}
    </span>
  )
}

/** Card de um item já escolhido pra pegar, com stepper. */
export function TakingItemCard({ id }: { id: string }) {
  const count = useTradeSession((s) => s.taking[id] ?? 0)
  const addTaking = useTradeSession((s) => s.addTaking)
  const removeTaking = useTradeSession((s) => s.removeTaking)
  const v = resolveStickerVisual(id)

  return (
    <div
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 border border-white/10 corner-cut corner-cut-sm"
      style={{
        background: `linear-gradient(150deg, ${v.color}1f 0%, var(--copa-card) 75%)`,
        ['--cut-accent' as string]: `${v.color}cc`,
      } as React.CSSProperties}
    >
      <StickerThumb visual={v} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-display font-bold tracking-wide uppercase text-white truncate leading-tight">{v.label}</p>
        <p className="text-[9px] font-mono tracking-wider text-white/40 truncate mt-0.5">{v.teamName} · #{v.number.padStart(2, '0')}</p>
      </div>
      <HaveBadge id={id} />
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => removeTaking(id)}
          className="w-7 h-7 rounded-full bg-white/10 text-white font-display font-black text-base flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Pegar uma a menos"
        >
          −
        </button>
        <span className="font-display font-black text-base tracking-tight w-4 text-center" style={{ color: v.color }}>{count}</span>
        <button
          onClick={() => addTaking(id)}
          className="w-7 h-7 rounded-full font-display font-black text-base flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: `${v.color}33`, color: v.color }}
          aria-label="Pegar uma a mais"
        >
          ＋
        </button>
      </div>
    </div>
  )
}

/** Busca sobre o álbum inteiro pra adicionar ao lado PEGA. */
export function TakingSearch() {
  const [query, setQuery] = useState('')
  const addTaking = useTradeSession((s) => s.addTaking)
  const results = searchStickers(query)

  return (
    <div>
      <div
        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 border border-white/10"
        style={{ background: 'var(--copa-card)' }}
      >
        <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="O que estão te oferecendo? BRA12, time, jogador…"
          className="flex-1 bg-transparent text-white placeholder-white/25 text-xs outline-none font-mono"
          autoComplete="off"
        />
        {query && (
          <button className="text-white/40 p-0.5" onClick={() => setQuery('')} aria-label="Limpar busca">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {query && (
        <div className="mt-2 rounded-xl border border-white/5 overflow-hidden" style={{ background: 'var(--copa-card)' }}>
          {results.length === 0 ? (
            <p className="text-center text-white/25 text-[11px] font-mono tracking-widest uppercase py-6">
              Nada encontrado
            </p>
          ) : (
            results.map((r) => {
              const id = stickerId(r.teamCode, r.sticker.number)
              return (
                <button
                  key={id}
                  onClick={() => { addTaking(id); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 active:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                >
                  <StickerThumb visual={resolveStickerVisual(id)} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-display font-bold tracking-wide uppercase text-white truncate leading-tight">{r.sticker.label}</p>
                    <p className="text-[9px] font-mono tracking-wider text-white/40 truncate mt-0.5">{r.teamName} · #{r.sticker.number.padStart(2, '0')}</p>
                  </div>
                  <HaveBadge id={id} />
                  <span className="text-copa-gold text-lg font-display font-black leading-none flex-shrink-0 w-5 text-center">＋</span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
