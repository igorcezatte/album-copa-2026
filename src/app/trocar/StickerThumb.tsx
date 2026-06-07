'use client'

import { Flag } from '@/components/Flag'
import type { StickerVisual } from '@/utils/trade'

const DIMS = {
  xs: { width: 20, height: 14 },
  sm: { width: 28, height: 20 },
  md: { width: 40, height: 28 },
  lg: { width: 56, height: 40 },
} as const

/**
 * Miniatura de uma figurinha: bandeira do time, ou — para especiais (FWC/CC)
 * que não têm bandeira — um selo colorido com o código. Mesmo tamanho do Flag
 * pra alinhar nas listas.
 */
export function StickerThumb({
  visual,
  size = 'sm',
  dim = false,
}: {
  visual: StickerVisual
  size?: keyof typeof DIMS
  dim?: boolean
}) {
  if (visual.flagCode) {
    return <Flag code={visual.flagCode} size={size} grayscale={dim} />
  }

  const { width, height } = DIMS[size]
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0 font-display font-black leading-none"
      style={{
        width,
        height,
        borderRadius: '0 4px 4px 0',
        background: visual.color,
        color: visual.teamCode === 'CC' ? '#fff' : '#0a0f1c',
        fontSize: Math.round(width * 0.34),
        letterSpacing: '0.02em',
        filter: dim ? 'grayscale(1) brightness(0.5)' : undefined,
        boxShadow: dim ? 'none' : '0 1px 4px rgba(0,0,0,0.5)',
      }}
    >
      {visual.teamCode}
    </span>
  )
}
