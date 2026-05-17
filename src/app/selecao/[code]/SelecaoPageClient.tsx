'use client'

import Link from 'next/link'
import { useAlbumStore } from '@/store/albumStore'
import { TEAMS, GROUP_COLORS } from '@/data/teams'
import { Flag } from '@/components/Flag'
import { StickerCard } from '@/components/StickerCard'
import { ProgressBar } from '@/components/ProgressBar'
import { pct } from '@/lib/utils'
import { useTeamConfetti } from '@/hooks/useTeamConfetti'

interface Props {
  teamCode: string
}

export function SelecaoPageClient({ teamCode }: Props) {
  useTeamConfetti(teamCode)
  const team = TEAMS.find((t) => t.code === teamCode)!
  const progress = useAlbumStore((s) => s.getTeamProgress(team.code))
  const percentage = pct(progress.collected, progress.total)
  const color = GROUP_COLORS[team.group]
  const complete = percentage === 100

  return (
    <div className="animate-fade-in">
      <div
        className="px-4 pt-6 pb-5 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${team.primaryColor}30 0%, var(--copa-bg) 100%)` }}
      >
        <Link
          href={`/grupo/${team.group.toLowerCase()}`}
          className="flex items-center gap-1 text-white/40 text-sm mb-4 -ml-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Grupo {team.group}
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <Flag code={team.flagCode} size="lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white leading-tight">{team.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${color}30`, color }}
              >
                GRUPO {team.group}
              </span>
              <span className="text-[10px] text-white/30 font-mono">{team.code}</span>
            </div>
          </div>
          {complete && (
            <div className="w-10 h-10 rounded-full bg-copa-green flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm text-white/50 font-medium">
            {progress.collected}/{progress.total} figurinhas
          </p>
          <p className="font-black text-xl leading-none" style={{ color: complete ? '#22c55e' : color }}>
            {percentage}%
          </p>
        </div>
        <ProgressBar value={progress.collected} total={progress.total} color={color} height="sm" />
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">Figurinhas</h2>
          <span className="text-[10px] text-white/20">Toque para marcar</span>
        </div>
        <div className="grid grid-cols-4 gap-2 pb-4">
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
    </div>
  )
}
