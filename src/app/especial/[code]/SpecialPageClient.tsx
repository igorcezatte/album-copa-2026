'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAlbumStore } from '@/store/albumStore'
import { FWC_SECTION, CC_SECTION } from '@/data/teams'
import { StickerCard } from '@/components/StickerCard'
import { ProgressBar } from '@/components/ProgressBar'
import { QuickAddSheet } from '@/components/QuickAddSheet'
import { pct } from '@/lib/utils'
import { useTeamConfetti } from '@/hooks/useTeamConfetti'
import { useShallow } from 'zustand/react/shallow'

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
  const progress = useAlbumStore(useShallow((s) => s.getSectionProgress(sectionCode)))
  const percentage = pct(progress.collected, progress.total)
  useTeamConfetti(sectionCode)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div
        className="px-4 pt-6 pb-5 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${meta.color}25 0%, var(--copa-bg) 100%)` }}
      >
        <Link href="/" className="flex items-center gap-1 text-white/40 text-[11px] font-mono font-bold tracking-widest uppercase mb-4 -ml-1 hover:text-white/60 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Álbum
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0 corner-cut corner-cut-sm"
            style={{
              background: `${meta.color}20`,
              border: `1px solid ${meta.color}40`,
              ['--cut-accent' as string]: `${meta.color}aa`,
            } as React.CSSProperties}
          >
            {meta.icon}
          </div>
          <div>
            <p className="text-[10px] text-white/30 font-mono tracking-[0.22em] uppercase">Edição especial · {sectionCode}</p>
            <h1 className="text-xl font-display font-black text-white leading-tight tracking-tight uppercase mt-0.5">{meta.label}</h1>
            <p className="text-[11px] text-white/40 font-mono tracking-wider mt-1">{meta.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] text-white/50 font-mono tracking-widest uppercase">
            <span className="font-display font-black text-base text-white tracking-tight mr-1">{progress.collected}</span>
            de {progress.total} figurinhas
          </p>
          <p
            className="font-display font-black text-3xl leading-none tracking-tight"
            style={{ color: percentage === 100 ? 'var(--copa-field)' : meta.color }}
          >
            {percentage}<span className="text-lg opacity-70">%</span>
          </p>
        </div>
        <ProgressBar value={progress.collected} total={progress.total} color={meta.color} height="sm" />
      </div>

      {/* Sticker grid */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-display font-bold text-white/40 uppercase tracking-[0.2em] flex items-baseline gap-2">
            <span className="font-mono text-white/25" aria-hidden>—</span>
            Figurinhas
          </h2>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-1 text-[11px] font-display font-bold tracking-widest uppercase px-2.5 py-1 rounded-full active:scale-95 transition-transform"
            style={{ background: `${meta.color}25`, color: meta.color }}
            aria-label="Adicionar várias figurinhas"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Várias
          </button>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3 pb-4">
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

      <QuickAddSheet
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        teamCode={sectionCode}
        teamName={meta.label}
        accentColor={meta.color}
      />
    </div>
  )
}
