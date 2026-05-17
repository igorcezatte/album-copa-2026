'use client'

import { useState, useCallback } from 'react'
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

export function StickerCard({ teamCode, flagCode, primaryColor, sticker }: StickerCardProps) {
  const [animating, setAnimating] = useState(false)
  const [showDupActions, setShowDupActions] = useState(false)

  const id = stickerId(teamCode, sticker.number)
  const quantity = useAlbumStore((s) => s.getQuantity(id))
  const collect = useAlbumStore((s) => s.collect)
  const uncollect = useAlbumStore((s) => s.uncollect)
  const addDuplicate = useAlbumStore((s) => s.addDuplicate)
  const removeDuplicate = useAlbumStore((s) => s.removeDuplicate)

  const collected = quantity > 0
  const duplicates = quantity > 1 ? quantity - 1 : 0

  const handleTap = useCallback(() => {
    if (showDupActions) {
      setShowDupActions(false)
      return
    }
    if (!collected) {
      collect(id)
      playCollectSound()
      setAnimating(true)
      setTimeout(() => setAnimating(false), 300)
    } else {
      setShowDupActions(true)
    }
  }, [collected, collect, id, showDupActions])

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
        'transition-all duration-200 ease-out',
        'border',
        collected
          ? 'border-white/10 shadow-lg'
          : 'border-white/5',
        animating && 'animate-pop',
      )}
      style={{
        aspectRatio: '3/4',
        background: collected
          ? `linear-gradient(145deg, ${primaryColor}22 0%, var(--copa-card) 60%)`
          : 'var(--copa-card)',
      }}
      onClick={handleTap}
    >
      {/* Collected glow */}
      {collected && (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${primaryColor}, transparent 70%)`,
          }}
        />
      )}

      {/* "26" watermark */}
      {collected && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          aria-hidden
        >
          <span
            className="text-7xl font-black opacity-[0.04] select-none"
            style={{ color: primaryColor }}
          >
            26
          </span>
        </div>
      )}

      {/* Duplicate badge */}
      {duplicates > 0 && (
        <div className="absolute top-1.5 right-1.5 z-10 bg-copa-gold text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
          +{duplicates}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-2">
        {/* Number */}
        <div
          className={cn(
            'text-xs font-bold leading-none mb-auto',
            collected ? 'text-white/60' : 'text-white/20',
          )}
        >
          {sticker.number}
        </div>

        {/* Big sticker number (center) */}
        <div className="flex-1 flex items-center justify-center">
          <span
            className={cn(
              'text-3xl font-black transition-all duration-200',
              collected ? 'text-white' : 'text-white/10',
            )}
          >
            {sticker.number === '1' ? '①' : sticker.number === '2' ? '②' : sticker.number}
          </span>
        </div>

        {/* Bottom info */}
        <div className="mt-auto">
          <p
            className={cn(
              'text-[9px] font-semibold uppercase tracking-wide truncate mb-0.5',
              collected ? 'text-white/40' : 'text-white/15',
            )}
          >
            {typeLabel}
          </p>
          <div className="flex items-end justify-between gap-1">
            <p
              className={cn(
                'text-[10px] font-bold truncate flex-1 leading-tight',
                collected ? 'text-white/90' : 'text-white/20',
              )}
            >
              {sticker.label}
            </p>
            {flagCode && (
              <Flag code={flagCode} size="xs" grayscale={!collected} />
            )}
          </div>
        </div>
      </div>

      {/* Duplicate actions overlay */}
      {showDupActions && (
        <div
          className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 rounded-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[10px] text-white/60 uppercase font-bold">Repetidas</p>
          <div className="flex items-center gap-3">
            <button
              className={`w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center transition-transform ${
                duplicates === 0 ? 'bg-white/5 text-white/20' : 'bg-white/10 text-white active:scale-90'
              }`}
              onClick={() => { if (duplicates > 0) removeDuplicate(id) }}
            >
              −
            </button>
            <span className="text-white font-black text-xl w-6 text-center">{duplicates}</span>
            <button
              className="w-8 h-8 rounded-full bg-copa-gold text-black font-bold text-lg flex items-center justify-center active:scale-90 transition-transform"
              onClick={() => addDuplicate(id)}
            >
              +
            </button>
          </div>
          <button
            className="text-[10px] text-red-400 font-bold mt-1"
            onClick={() => { uncollect(id); setShowDupActions(false) }}
          >
            Desmarcar
          </button>
          <button
            className="text-[10px] text-white/40 mt-0"
            onClick={() => setShowDupActions(false)}
          >
            Fechar
          </button>
        </div>
      )}

      {/* Check mark when collected (no dup actions) */}
      {collected && !showDupActions && (
        <div className="absolute top-1.5 left-1.5 z-10">
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: primaryColor }}
          >
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
