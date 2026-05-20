'use client'

import Link from 'next/link'
import { useAlbumStore } from '@/store/albumStore'
import { getTeamsByGroup, GROUP_COLORS } from '@/data/teams'
import { Flag } from './Flag'
import { ProgressBar } from './ProgressBar'
import { pct } from '@/lib/utils'
import { useHydrated } from '@/hooks/useHydrated'
import { useShallow } from 'zustand/react/shallow'

interface GroupCardProps {
  group: string
}

export function GroupCard({ group }: GroupCardProps) {
  const hydrated = useHydrated()
  const teams = getTeamsByGroup(group)
  const color = GROUP_COLORS[group]
  const rawProgress = useAlbumStore(useShallow((s) => s.getGroupProgress(group)))
  // Só usa os dados reais após a hydratação — evita 0% no carregamento inicial
  const progress = hydrated ? rawProgress : { collected: 0, total: rawProgress.total }
  const percentage = pct(progress.collected, progress.total)

  return (
    <Link href={`/grupo/${group.toLowerCase()}`} className="block group">
      <div
        className="rounded-2xl p-3.5 border border-white/5 active:scale-95 group-hover:-translate-y-0.5 transition-all duration-200 corner-cut"
        style={{
          background: `linear-gradient(145deg, ${color}18 0%, var(--copa-card) 100%)`,
          boxShadow: percentage === 100 ? `0 0 20px ${color}40` : undefined,
          ['--cut-accent' as string]: `${color}b3`,
        } as React.CSSProperties}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 flex items-center justify-center font-display font-black text-base leading-none corner-cut corner-cut-sm"
              style={{
                background: color,
                color: '#000',
                ['--cut-accent' as string]: 'rgba(0,0,0,0.45)',
                ['--cut-size' as string]: '6px',
              } as React.CSSProperties}
            >
              {group}
            </div>
            <span className="text-[10px] text-white/50 font-mono tracking-[0.2em] uppercase">Grupo</span>
          </div>
          <span
            className="text-base font-display font-black tracking-tight transition-all duration-300"
            style={{ color: percentage === 100 ? 'var(--copa-field)' : color }}
          >
            {hydrated ? `${percentage}%` : '—'}
          </span>
        </div>

        {/* Team flags */}
        <div className="flex gap-1.5 mb-3">
          {teams.map((team) => (
            <Flag key={team.code} code={team.flagCode} size="xs" />
          ))}
        </div>

        {/* Progress bar */}
        <ProgressBar key={hydrated ? 1 : 0} value={progress.collected} total={progress.total} color={color} height="xs" />

        {/* Count */}
        <p className="text-right text-[10px] text-white/30 mt-1 font-mono tracking-wider">
          {hydrated ? `${progress.collected}/${progress.total}` : '—'}
        </p>
      </div>
    </Link>
  )
}
