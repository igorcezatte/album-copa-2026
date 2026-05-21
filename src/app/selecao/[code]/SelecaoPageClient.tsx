'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAlbumStore } from '@/store/albumStore'
import { TEAMS, GROUP_COLORS } from '@/data/teams'
import { Flag } from '@/components/Flag'
import { StickerCard } from '@/components/StickerCard'
import { ProgressBar } from '@/components/ProgressBar'
import { QuickAddSheet } from '@/components/QuickAddSheet'
import { pct } from '@/lib/utils'
import { useTeamConfetti } from '@/hooks/useTeamConfetti'
import { useShallow } from 'zustand/react/shallow'

interface Props {
  teamCode: string
}

export function SelecaoPageClient({ teamCode }: Props) {
  useTeamConfetti(teamCode)
  const team = TEAMS.find((t) => t.code === teamCode)!
  const progress = useAlbumStore(useShallow((s) => s.getTeamProgress(team.code)))
  const percentage = pct(progress.collected, progress.total)
  const color = GROUP_COLORS[team.group]
  const complete = percentage === 100
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  return (
    <div className="animate-fade-in">
      <div
        className="px-4 pt-6 pb-5 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${team.primaryColor}30 0%, var(--copa-bg) 100%)` }}
      >
        <Link
          href={`/grupo/${team.group.toLowerCase()}`}
          className="flex items-center gap-1 text-white/40 text-[11px] font-mono font-bold tracking-widest uppercase mb-4 -ml-1 hover:text-white/60 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Grupo {team.group}
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <Flag code={team.flagCode} size="lg" />
          <div className="flex-1">
            <p className="text-[10px] text-white/30 font-mono tracking-[0.22em] uppercase">Seleção · {team.code}</p>
            <h1 className="text-2xl font-display font-black text-white leading-tight tracking-tight uppercase mt-0.5">{team.name}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="text-[10px] font-display font-bold px-2 py-0.5 rounded-full tracking-widest uppercase"
                style={{ background: `${color}30`, color }}
              >
                Grupo {team.group}
              </span>
            </div>
          </div>
          {complete && (
            <div
              className="w-10 h-10 flex items-center justify-center corner-cut corner-cut-sm"
              style={{
                background: 'var(--copa-field)',
                ['--cut-accent' as string]: 'rgba(0,0,0,0.35)',
              } as React.CSSProperties}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] text-white/50 font-mono tracking-widest uppercase">
            <span className="font-display font-black text-base text-white tracking-tight mr-1">{progress.collected}</span>
            de {progress.total} figurinhas
          </p>
          <p className="font-display font-black text-3xl leading-none tracking-tight" style={{ color: complete ? 'var(--copa-field)' : color }}>
            {percentage}<span className="text-lg opacity-70">%</span>
          </p>
        </div>
        <ProgressBar value={progress.collected} total={progress.total} color={color} height="sm" />
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-display font-bold text-white/40 uppercase tracking-[0.2em] flex items-baseline gap-2">
            <span className="font-mono text-white/25" aria-hidden>—</span>
            Figurinhas
          </h2>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-1 text-[11px] font-display font-bold tracking-widest uppercase px-2.5 py-1 rounded-full active:scale-95 transition-transform"
            style={{ background: `${color}25`, color }}
            aria-label="Adicionar várias figurinhas"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Várias
          </button>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3 pb-4">
          {team.stickers.map((sticker) => (
            <StickerCard
              key={sticker.number}
              teamCode={team.code}
              flagCode={team.flagCode}
              primaryColor={team.primaryColor}
              sticker={sticker}
            />
          ))}
        </div>
      </div>

      <QuickAddSheet
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        teamCode={team.code}
        teamName={team.name}
        accentColor={color}
      />
    </div>
  )
}
