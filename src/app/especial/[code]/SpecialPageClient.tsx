'use client'

import Link from 'next/link'
import { useAlbumStore } from '@/store/albumStore'
import { FWC_SECTION, CC_SECTION } from '@/data/teams'
import { StickerCard } from '@/components/StickerCard'
import { ProgressBar } from '@/components/ProgressBar'
import { pct } from '@/lib/utils'
import { useTeamConfetti } from '@/hooks/useTeamConfetti'

const SECTION_META = {
  FWC: {
    label: 'Páginas Iniciais & História',
    color: '#f5c42e',
    icon: '🏆',
    description: 'Mascote, troféu, sedes e história da Copa do Mundo',
  },
  CC: {
    label: 'Figurinhas Coca-Cola',
    color: '#e8222a',
    icon: '🥤',
    description: 'Coleção especial patrocinada pela Coca-Cola',
  },
}

interface Props {
  sectionCode: string
}

export function SpecialPageClient({ sectionCode }: Props) {
  const section = sectionCode === 'FWC' ? FWC_SECTION : CC_SECTION
  const meta = SECTION_META[sectionCode as keyof typeof SECTION_META]
  const progress = useAlbumStore((s) => s.getSectionProgress(sectionCode))
  const percentage = pct(progress.collected, progress.total)
  useTeamConfetti(sectionCode)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div
        className="px-4 pt-6 pb-5 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${meta.color}25 0%, var(--copa-bg) 100%)` }}
      >
        <Link href="/" className="flex items-center gap-1 text-white/40 text-sm mb-4 -ml-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Álbum
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: `${meta.color}20`, border: `1px solid ${meta.color}40` }}
          >
            {meta.icon}
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-tight">{meta.label}</h1>
            <p className="text-xs text-white/40 mt-0.5">{meta.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm text-white/50 font-medium">
            {progress.collected}/{progress.total} figurinhas
          </p>
          <p
            className="font-black text-xl leading-none"
            style={{ color: percentage === 100 ? '#22c55e' : meta.color }}
          >
            {percentage}%
          </p>
        </div>
        <ProgressBar value={progress.collected} total={progress.total} color={meta.color} height="sm" />
      </div>

      {/* Sticker grid */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">Figurinhas</h2>
          <span className="text-[10px] text-white/20">Toque para marcar</span>
        </div>

        <div className="grid grid-cols-4 gap-2 pb-4">
          {section.stickers.map((sticker) => (
            <StickerCard
              key={sticker.number}
              teamCode={sectionCode}
              primaryColor={meta.color}
              sticker={sticker}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
