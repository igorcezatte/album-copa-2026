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
      <p className="text-[10px] text-white/30 font-mono tracking-[0.22em] uppercase">Dashboard</p>
      <h1 className="text-2xl font-display font-black text-white tracking-tight uppercase mb-5 mt-0.5">Estatísticas</h1>

      {/* Resumo geral */}
      <div className="grid grid-cols-3 gap-2 mb-2.5">
        <StatCard value={total.collected} label="Coletadas" color="#f5c42e" />
        <StatCard value={total.total - total.collected} label="Faltantes" color="#ef4444" />
        <StatCard value={totalDuplicates} label="Repetidas" color="#6366f1" />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-6">
        <StatCard value={`${pct(total.collected, total.total)}%`} label="Completo" color="#15a065" />
        <StatCard value={`${completedCount}/48`} label="Seleções 100%" color="#f5c42e" />
      </div>

      {/* Progresso por grupo */}
      <h2 className="text-xs font-display font-bold text-white/40 uppercase tracking-[0.2em] mb-3 flex items-baseline gap-2">
        <span className="font-mono text-white/25" aria-hidden>—</span>
        Por grupo
      </h2>
      <div className="space-y-2 mb-6">
        {groupStats.map((g) => (
          <div key={g.group} className="flex items-center gap-3">
            <span
              className="text-sm font-display font-black tracking-tight w-5 text-center flex-shrink-0"
              style={{ color: GROUP_COLORS[g.group] }}
            >
              {g.group}
            </span>
            <div className="flex-1">
              <ProgressBar value={g.collected} total={g.total} color={GROUP_COLORS[g.group]} height="xs" />
            </div>
            <span className="text-[11px] font-mono font-bold tracking-wider text-white/40 w-9 text-right flex-shrink-0">
              {g.pct}%
            </span>
          </div>
        ))}
      </div>

      {/* Ranking de seleções */}
      <h2 className="text-xs font-display font-bold text-white/40 uppercase tracking-[0.2em] mb-3 flex items-baseline gap-2">
        <span className="font-mono text-white/25" aria-hidden>—</span>
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
              style={{ background: `linear-gradient(90deg, ${color}10 0%, var(--copa-card) 100%)` }}
            >
              <span className="text-[11px] font-mono font-bold tracking-wider text-white/30 w-5 flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <Flag code={team.flagCode} size="xs" grayscale={percentage === 0} />
              <span className="text-xs font-display font-bold tracking-wide uppercase text-white flex-1 truncate">{team.name}</span>
              <div className="w-16 flex-shrink-0">
                <ProgressBar value={team.collected} total={team.total} color={color} height="xs" />
              </div>
              <span
                className="text-xs font-display font-black tracking-tight w-9 text-right flex-shrink-0"
                style={{ color: percentage === 100 ? 'var(--copa-field)' : color }}
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
      className="rounded-2xl p-3 border border-white/5 text-center corner-cut corner-cut-sm"
      style={{
        background: `linear-gradient(145deg, ${color}15 0%, var(--copa-card) 100%)`,
        ['--cut-accent' as string]: `${color}aa`,
      } as React.CSSProperties}
    >
      <p className="text-3xl font-display font-black leading-none tracking-tight" style={{ color }}>{value}</p>
      <p className="text-[9px] text-white/40 mt-1.5 font-mono tracking-widest uppercase">{label}</p>
    </div>
  )
}
