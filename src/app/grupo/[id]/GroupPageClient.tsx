'use client'

import Link from 'next/link'
import { useAlbumStore } from '@/store/albumStore'
import { getTeamsByGroup, GROUP_COLORS } from '@/data/teams'
import { TeamCard } from '@/components/TeamCard'
import { ProgressBar } from '@/components/ProgressBar'
import { pct } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'

interface Props {
  group: string
}

export function GroupPageClient({ group }: Props) {
  const teams = getTeamsByGroup(group)
  const color = GROUP_COLORS[group]
  const progress = useAlbumStore(useShallow((s) => s.getGroupProgress(group)))
  const percentage = pct(progress.collected, progress.total)

  return (
    <div className="px-4 pt-6 animate-fade-in">
      <Link href="/" className="flex items-center gap-1 text-white/40 text-[11px] font-mono font-bold tracking-widest uppercase mb-6 -ml-1 hover:text-white/60 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Álbum
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-14 h-14 flex items-center justify-center font-display font-black text-3xl tracking-tight shadow-lg corner-cut corner-cut-sm"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}aa)`,
              color: '#000',
              ['--cut-accent' as string]: 'rgba(0,0,0,0.45)',
            } as React.CSSProperties}
          >
            {group}
          </div>
          <div>
            <p className="text-[10px] text-white/40 font-mono tracking-[0.22em] uppercase">FIFA World Cup</p>
            <h1 className="text-2xl font-display font-black text-white tracking-tight uppercase leading-none mt-0.5">Grupo {group}</h1>
            <p className="text-[11px] text-white/40 font-mono tracking-wider mt-1">{teams.length} seleções · {progress.total} figurinhas</p>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 border border-white/5 corner-cut corner-cut-lg"
          style={{
            background: `linear-gradient(145deg, ${color}18 0%, var(--copa-card) 100%)`,
            ['--cut-accent' as string]: `${color}99`,
          } as React.CSSProperties}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-white/50 font-mono tracking-widest uppercase">
              <span className="font-display font-black text-base text-white tracking-tight mr-1">{progress.collected}</span>
              de {progress.total}
            </p>
            <p className="font-display font-black text-3xl tracking-tight" style={{ color: percentage === 100 ? 'var(--copa-field)' : color }}>
              {percentage}<span className="text-lg opacity-70">%</span>
            </p>
          </div>
          <ProgressBar value={progress.collected} total={progress.total} color={color} height="sm" />
        </div>
      </div>

      <h2 className="text-xs font-display font-bold text-white/40 uppercase tracking-[0.2em] mb-3 flex items-baseline gap-2">
        <span className="font-mono text-white/25" aria-hidden>—</span>
        Seleções
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {teams.map((team) => (
          <TeamCard key={team.code} team={team} />
        ))}
      </div>
    </div>
  )
}
