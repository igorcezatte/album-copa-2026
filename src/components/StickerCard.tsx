'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Flag } from './Flag'
import { useAlbumStore, stickerId } from '@/store/albumStore'
import { playCollectSound } from '@/utils/sound'
import type { StickerDef } from '@/data/teams'

interface StickerCardProps {
  teamCode: string
  flagCode?: string
  primaryColor: string
  sticker: StickerDef
}

const COUNTER_AUTO_CLOSE = 3500

export function StickerCard({ teamCode, flagCode, primaryColor, sticker }: StickerCardProps) {
  const [animating, setAnimating] = useState(false)
  const [showCounter, setShowCounter] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const id = stickerId(teamCode, sticker.number)
  const quantity  = useAlbumStore((s) => s.getQuantity(id))
  const collect   = useAlbumStore((s) => s.collect)
  const uncollect = useAlbumStore((s) => s.uncollect)
  const addDuplicate    = useAlbumStore((s) => s.addDuplicate)
  const removeDuplicate = useAlbumStore((s) => s.removeDuplicate)

  const collected  = quantity > 0
  const duplicates = Math.max(0, quantity - 1)

  // Fecha o contador automaticamente após inatividade
  const scheduleClose = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setShowCounter(false), COUNTER_AUTO_CLOSE)
  }, [])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const openCounter = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setShowCounter(true)
    scheduleClose()
  }, [scheduleClose])

  const handleCardTap = useCallback(() => {
    if (!collected) {
      collect(id)
      playCollectSound()
      setAnimating(true)
      setTimeout(() => setAnimating(false), 300)
      return
    }
    if (showCounter) {
      setShowCounter(false)
      if (timerRef.current) clearTimeout(timerRef.current)
    } else {
      setShowCounter(true)
      scheduleClose()
    }
  }, [collected, collect, id, showCounter, scheduleClose])

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    addDuplicate(id)
    scheduleClose()
  }, [addDuplicate, id, scheduleClose])

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (quantity <= 1) {
      uncollect(id)
      setShowCounter(false)
    } else {
      removeDuplicate(id)
      scheduleClose()
    }
  }, [quantity, uncollect, removeDuplicate, id, scheduleClose])

  const typeLabel = {
    badge: 'Escudo',
    photo: 'Seleção',
    player: '#' + sticker.number,
    special: 'Especial',
  }[sticker.type]

  return (
    <div
      className={cn(
        'relative select-none rounded-xl overflow-hidden cursor-pointer',
        'transition-all duration-200 ease-out border',
        collected ? 'border-white/10 shadow-lg' : 'border-white/5',
        animating && 'animate-pop',
      )}
      style={{
        aspectRatio: '3/4',
        background: collected
          ? `linear-gradient(145deg, ${primaryColor}22 0%, var(--copa-card) 60%)`
          : 'var(--copa-card)',
      }}
      onClick={handleCardTap}
    >
      {/* Brilho ao ser coletada */}
      {collected && (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 0%, ${primaryColor}, transparent 70%)` }}
        />
      )}

      {/* Watermark "26" */}
      {collected && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" aria-hidden>
          <span className="text-7xl font-black opacity-[0.04] select-none" style={{ color: primaryColor }}>
            26
          </span>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="relative z-10 h-full flex flex-col p-2">
        {/* Linha superior: número + badge de repetidas */}
        <div className="flex items-start justify-between">
          <div className={cn('text-xs font-bold leading-none', collected ? 'text-white/60' : 'text-white/20')}>
            {sticker.number}
          </div>

          {collected && !showCounter && (
            <button
              className={cn(
                'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-black leading-none',
                'active:scale-90 transition-transform',
              )}
              style={{
                background: duplicates > 0 ? primaryColor : `${primaryColor}40`,
                color: duplicates > 0 ? '#fff' : primaryColor,
              }}
              onClick={openCounter}
              aria-label="Gerenciar repetidas"
            >
              {duplicates > 0 ? `+${duplicates}` : '+'}
            </button>
          )}
        </div>

        {/* Número grande central */}
        <div className="flex-1 flex items-center justify-center">
          <span className={cn('text-3xl font-black transition-all duration-200', collected ? 'text-white' : 'text-white/10')}>
            {sticker.number === '1' ? '①' : sticker.number === '2' ? '②' : sticker.number}
          </span>
        </div>

        {/* Rodapé: tipo + nome + bandeira */}
        <div>
          <p className={cn('text-[9px] font-semibold uppercase tracking-wide truncate mb-0.5', collected ? 'text-white/40' : 'text-white/15')}>
            {typeLabel}
          </p>
          <div className="flex items-end justify-between gap-1">
            <p className={cn('text-[10px] font-bold truncate flex-1 leading-tight', collected ? 'text-white/90' : 'text-white/20')}>
              {sticker.label}
            </p>
            {flagCode && <Flag code={flagCode} size="xs" grayscale={!collected} />}
          </div>
        </div>
      </div>

      {/* Barra de contador de repetidas */}
      {showCounter && (
        <div
          className="absolute inset-x-0 bottom-0 z-20 rounded-b-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex items-center justify-between px-2 py-2"
            style={{ background: `${primaryColor}ee`, backdropFilter: 'blur(8px)' }}
          >
            {/* Botão remover / desmarcar */}
            <button
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90',
                quantity <= 1
                  ? 'bg-red-500/30 text-red-300'
                  : 'bg-white/20 text-white',
              )}
              onClick={handleRemove}
              aria-label={quantity <= 1 ? 'Desmarcar figurinha' : 'Remover repetida'}
            >
              {quantity <= 1 ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                </svg>
              )}
            </button>

            {/* Contagem */}
            <div className="flex flex-col items-center">
              <span className="text-white text-xs font-black leading-none">{duplicates}</span>
              <span className="text-white/60 text-[8px] leading-none mt-0.5">
                {duplicates === 1 ? 'repetida' : 'repetidas'}
              </span>
            </div>

            {/* Botão adicionar */}
            <button
              className="w-7 h-7 rounded-full bg-white/25 text-white flex items-center justify-center transition-all active:scale-90"
              onClick={handleAdd}
              aria-label="Adicionar repetida"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
