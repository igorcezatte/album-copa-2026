'use client'

import { useAlbumStore } from '@/store/albumStore'
import { TEAMS, GROUPS, GROUP_COLORS } from '@/data/teams'
import { Flag } from '@/components/Flag'
import { ProgressBar } from '@/components/ProgressBar'
import { pct } from '@/lib/utils'
import { sortByCompletion, countCompleted, computeGroupStats } from '@/utils/stats'

export default function StatsPage() {
  const getTeamProgress = useAlbumStore((s) => s.getTeamProgress)
  const getGroupProgress = useAlbumStore((s) => s.getGroupProgress)
  const getTotalProgress = useAlbumStore((s) => s.getTotalProgress)
  const getDuplicates = useAlbumStore((s) => s.getDuplicates)

  const total = getTotalProgress()
  const duplicates = getDuplicates()
  const totalDuplicates = duplicates.reduce((sum, d) => sum + d.quantity, 0)

  // Team rows for sorting
  const teamRows = TEAMS.map((t) => {
    const p = getTeamProgress(t.code)
    return { code: t.code, name: t.name, flagCode: t.flagCode, group: t.group, primaryColor: t.primaryColor, collected: p.collected, total: p.total }
  })
  const sorted = sortByCompletion(teamRows)
  const completedCount = countCompleted(teamRows)

  // Group stats
  const groupProgressMap: Record<string, { collected: number; total: number }> = {}
  for (const group of GROUPS) {
    groupProgressMap[group] = getGroupProgress(group)
  }
  const groupStats = computeGroupStats(groupProgressMap)

  return (
    <div className="px-4 pt-6 pb-4 animate-fade-in">
      <h1 className="text-xl font-black text-white mb-5">Estatísticas</h1>

      {/* Resumo geral */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <StatCard value={total.collected} label="Coletadas" color="#f5c42e" />
        <StatCard value={total.total - total.collected} label="Faltantes" color="#ef4444" />
        <StatCard value={totalDuplicates} label="Repetidas" color="#6366f1" />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-6">
        <StatCard value={`${pct(total.collected, total.total)}%`} label="Completo" color="#22c55e" />
        <StatCard value={`${completedCount}/48`} label="Seleções 100%" color="#f5c42e" />
      </div>

      {/* Progresso por grupo */}
      <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Por grupo</h2>
      <div className="space-y-2 mb-6">
        {groupStats.map((g) => (
          <div key={g.group} className="flex items-center gap-3">
            <span
              className="text-[10px] font-black w-5 text-center flex-shrink-0"
              style={{ color: GROUP_COLORS[g.group] }}
            >
              {g.group}
            </span>
            <div className="flex-1">
              <ProgressBar value={g.collected} total={g.total} color={GROUP_COLORS[g.group]} height="xs" />
            </div>
            <span className="text-[10px] font-bold text-white/40 w-8 text-right flex-shrink-0">
              {g.pct}%
            </span>
          </div>
        ))}
      </div>

      {/* Ranking de seleções */}
      <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
        Ranking de seleções
      </h2>
      <div className="space-y-1.5">
        {sorted.map((team, i) => {
          const percentage = pct(team.collected, team.total)
          const color = GROUP_COLORS[team.group]
          return (
            <div
              key={team.code}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 border border-white/5"
              style={{ background: `linear-gradient(90deg, ${color}10 0%, #0d1424 100%)` }}
            >
              <span className="text-[10px] font-black text-white/20 w-4 flex-shrink-0">
                {i + 1}
              </span>
              <Flag code={team.flagCode} size="xs" grayscale={percentage === 0} />
              <span className="text-xs font-bold text-white flex-1 truncate">{team.name}</span>
              <div className="w-16 flex-shrink-0">
                <ProgressBar value={team.collected} total={team.total} color={color} height="xs" />
              </div>
              <span
                className="text-[10px] font-black w-8 text-right flex-shrink-0"
                style={{ color: percentage === 100 ? '#22c55e' : color }}
              >
                {percentage}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatCard({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <div
      className="rounded-2xl p-3 border border-white/5 text-center"
      style={{ background: `linear-gradient(145deg, ${color}15 0%, #0d1424 100%)` }}
    >
      <p className="text-2xl font-black leading-none" style={{ color }}>{value}</p>
      <p className="text-[10px] text-white/40 mt-1 font-medium">{label}</p>
    </div>
  )
}
