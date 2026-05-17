import { pct } from '@/lib/utils'

export interface TeamRow {
  code: string
  name: string
  collected: number
  total: number
}

export interface GroupStat {
  group: string
  collected: number
  total: number
  pct: number
}

export function sortByCompletion<T extends TeamRow>(teams: T[]): T[] {
  return [...teams].sort((a, b) => {
    const pctA = a.total > 0 ? a.collected / a.total : 0
    const pctB = b.total > 0 ? b.collected / b.total : 0
    return pctB - pctA
  })
}

export function countCompleted(teams: Array<{ collected: number; total: number }>): number {
  return teams.filter((t) => t.total > 0 && t.collected >= t.total).length
}

export function computeGroupStats(
  groups: Record<string, { collected: number; total: number }>,
): GroupStat[] {
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, progress]) => ({
      group,
      collected: progress.collected,
      total: progress.total,
      pct: pct(progress.collected, progress.total),
    }))
}
