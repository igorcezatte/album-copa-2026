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
    <Link href={`/grupo/${group.toLowerCase()}`} className="block">
      <div
        className="rounded-2xl p-3.5 border border-white/5 active:scale-95 transition-transform duration-150"
        style={{
          background: `linear-gradient(145deg, ${color}18 0%, var(--copa-card) 100%)`,
          boxShadow: percentage === 100 ? `0 0 20px ${color}40` : undefined,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
              style={{ background: color, color: '#000' }}
            >
              {group}
            </div>
            <span className="text-xs text-white/50 font-medium">Grupo</span>
          </div>
          <span
            className="text-sm font-black transition-all duration-300"
            style={{ color: percentage === 100 ? '#22c55e' : color }}
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
        <p className="text-right text-[10px] text-white/30 mt-1 font-mono">
          {hydrated ? `${progress.collected}/${progress.total}` : '—'}
        </p>
      </div>
    </Link>
  )
}
