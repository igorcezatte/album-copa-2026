'use client'

import Link from 'next/link'
import { useAlbumStore } from '@/store/albumStore'
import { Flag } from './Flag'
import { ProgressBar } from './ProgressBar'
import { pct } from '@/lib/utils'
import type { Team } from '@/data/teams'
import { GROUP_COLORS } from '@/data/teams'
import { useShallow } from 'zustand/react/shallow'

interface TeamCardProps {
  team: Team
}

export function TeamCard({ team }: TeamCardProps) {
  const progress = useAlbumStore(useShallow((s) => s.getTeamProgress(team.code)))
  const percentage = pct(progress.collected, progress.total)
  const color = GROUP_COLORS[team.group]
  const complete = percentage === 100

  return (
    <Link href={`/selecao/${team.code.toLowerCase()}`} className="block group">
      <div
        className="rounded-2xl p-4 border active:scale-95 group-hover:-translate-y-0.5 transition-all duration-200 corner-cut corner-cut-md"
        style={{
          background: `linear-gradient(145deg, ${team.primaryColor}20 0%, var(--copa-card) 80%)`,
          borderColor: complete ? `${color}60` : 'rgba(255,255,255,0.05)',
          boxShadow: complete ? `0 0 16px ${color}30` : undefined,
          ['--cut-accent' as string]: `${color}b3`,
        } as React.CSSProperties}
      >
        <div className="flex items-center gap-3 mb-3">
          <Flag code={team.flagCode} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm text-white truncate tracking-wide uppercase">{team.name}</p>
            <p className="text-[10px] text-white/40 font-mono tracking-widest">{team.code}</p>
          </div>
          {complete ? (
            <div
              className="w-6 h-6 flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--copa-field)' }}
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <span className="text-base font-display font-black tracking-tight" style={{ color }}>
              {percentage}%
            </span>
          )}
        </div>

        <ProgressBar value={progress.collected} total={progress.total} color={color} height="xs" />
        <p className="text-right text-[10px] text-white/30 mt-1 font-mono tracking-wider">
          {progress.collected}/{progress.total}
        </p>
      </div>
    </Link>
  )
}
