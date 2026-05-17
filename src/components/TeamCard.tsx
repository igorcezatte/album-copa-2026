'use client'

import Link from 'next/link'
import { useAlbumStore } from '@/store/albumStore'
import { Flag } from './Flag'
import { ProgressBar } from './ProgressBar'
import { pct } from '@/lib/utils'
import type { Team } from '@/data/teams'
import { GROUP_COLORS } from '@/data/teams'

interface TeamCardProps {
  team: Team
}

export function TeamCard({ team }: TeamCardProps) {
  const progress = useAlbumStore((s) => s.getTeamProgress(team.code))
  const percentage = pct(progress.collected, progress.total)
  const color = GROUP_COLORS[team.group]
  const complete = percentage === 100

  return (
    <Link href={`/selecao/${team.code.toLowerCase()}`} className="block">
      <div
        className="rounded-2xl p-4 border active:scale-95 transition-all duration-150"
        style={{
          background: `linear-gradient(145deg, ${team.primaryColor}20 0%, #0d1424 80%)`,
          borderColor: complete ? `${color}60` : 'rgba(255,255,255,0.05)',
          boxShadow: complete ? `0 0 16px ${color}30` : undefined,
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <Flag code={team.flagCode} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-white truncate">{team.name}</p>
            <p className="text-[10px] text-white/40 font-mono">{team.code}</p>
          </div>
          {complete ? (
            <div className="w-6 h-6 rounded-full bg-copa-green flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <span className="text-xs font-black" style={{ color }}>
              {percentage}%
            </span>
          )}
        </div>

        <ProgressBar value={progress.collected} total={progress.total} color={color} height="xs" />
        <p className="text-right text-[10px] text-white/30 mt-1 font-mono">
          {progress.collected}/{progress.total}
        </p>
      </div>
    </Link>
  )
}
