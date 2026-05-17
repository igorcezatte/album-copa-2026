'use client'

import Link from 'next/link'
import { useAlbumStore } from '@/store/albumStore'
import { getTeamsByGroup, GROUP_COLORS } from '@/data/teams'
import { TeamCard } from '@/components/TeamCard'
import { ProgressBar } from '@/components/ProgressBar'
import { pct } from '@/lib/utils'

interface Props {
  group: string
}

export function GroupPageClient({ group }: Props) {
  const teams = getTeamsByGroup(group)
  const color = GROUP_COLORS[group]
  const progress = useAlbumStore((s) => s.getGroupProgress(group))
  const percentage = pct(progress.collected, progress.total)

  return (
    <div className="px-4 pt-6 animate-fade-in">
      <Link href="/" className="flex items-center gap-1 text-white/40 text-sm mb-6 -ml-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Álbum
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)`, color: '#000' }}
          >
            {group}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Grupo {group}</h1>
            <p className="text-sm text-white/40">{teams.length} seleções · {progress.total} figurinhas</p>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 border border-white/5"
          style={{ background: `linear-gradient(145deg, ${color}18 0%, var(--copa-card) 100%)` }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/60 font-medium">
              {progress.collected} de {progress.total}
            </p>
            <p className="font-black text-lg" style={{ color: percentage === 100 ? '#22c55e' : color }}>
              {percentage}%
            </p>
          </div>
          <ProgressBar value={progress.collected} total={progress.total} color={color} height="sm" />
        </div>
      </div>

      <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Seleções</h2>
      <div className="grid grid-cols-1 gap-3">
        {teams.map((team) => (
          <TeamCard key={team.code} team={team} />
        ))}
      </div>
    </div>
  )
}
