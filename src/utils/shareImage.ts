// Snapshot enviado pro endpoint /api/share-image. O card é renderizado
// server-side via next/og, então o payload precisa ser self-contained
// (nada de stores client).
import { GROUPS } from '@/data/teams'

export interface ShareImageTeam {
  code: string
  name: string
  flagCode: string
  primaryColor: string
  group: string
  collected: number
  total: number
  /** Números faltantes na ordem do álbum, ex: ['2', '5', '11'] */
  missing: string[]
}

export interface ShareImageSpecial {
  code: 'FWC' | 'CC'
  name: string
  color: string
  collected: number
  total: number
  /** Números faltantes (sem o prefixo, ex: ['1', '3', '7']) */
  missing: string[]
}

export interface ShareImageDuplicate {
  teamCode: string
  teamName: string
  flagCode?: string
  primaryColor: string
  /** Labels formatados, ex: ['5', '11 ×2', 'FWC3'] */
  labels: string[]
  totalExtras: number
}

export type ShareImageFormat = 'card' | 'story'

export interface ShareImagePayload {
  collected: number
  total: number
  completedTeams: number
  teams: ShareImageTeam[]
  specials: ShareImageSpecial[]
  duplicates: ShareImageDuplicate[]
  totalDuplicates: number
  /** Default 'card'. 'story' renderiza StoryCard 1080×1920 pra Instagram. */
  format?: ShareImageFormat
}

interface BuildInput {
  totalProgress: { collected: number; total: number }
  teams: Array<{
    code: string
    name: string
    flagCode: string
    primaryColor: string
    group: string
    progress: { collected: number; total: number }
    missing: string[]
  }>
  specials: Array<{
    code: 'FWC' | 'CC'
    name: string
    color: string
    progress: { collected: number; total: number }
    missing: string[]
  }>
  duplicates: ShareImageDuplicate[]
}

export function buildShareImagePayload(input: BuildInput): ShareImagePayload {
  const teams: ShareImageTeam[] = input.teams.map((t) => ({
    code: t.code,
    name: t.name,
    flagCode: t.flagCode,
    primaryColor: t.primaryColor,
    group: t.group,
    collected: t.progress.collected,
    total: t.progress.total,
    missing: t.missing,
  }))
  const completedTeams = teams.filter(
    (t) => t.total > 0 && t.collected === t.total
  ).length
  const totalDuplicates = input.duplicates.reduce(
    (acc, d) => acc + d.totalExtras,
    0
  )
  return {
    collected: input.totalProgress.collected,
    total: input.totalProgress.total,
    completedTeams,
    teams,
    specials: input.specials.map((s) => ({
      code: s.code,
      name: s.name,
      color: s.color,
      collected: s.progress.collected,
      total: s.progress.total,
      missing: s.missing,
    })),
    duplicates: input.duplicates,
    totalDuplicates,
  }
}

/**
 * Estima altura do CollectionCard pro endpoint passar como `height`
 * do ImageResponse. Layout: 12 cards de grupo em 2 colunas (A-F | G-L),
 * cada um com altura fixa (4 TeamRows uniformes). Specials full-width.
 * Repetidas em 2 colunas. Callout no rodape.
 *
 * Mantido em sincronia com as constantes de CollectionCard.tsx.
 */
const TEAM_ROW_HEIGHT = 82
const TEAM_ROW_GAP = 5
const GROUP_HEADER_H = 32
const GROUP_PADDING = 12
const GROUP_BLOCK_HEIGHT =
  GROUP_PADDING * 2 + GROUP_HEADER_H + 4 * TEAM_ROW_HEIGHT + 3 * TEAM_ROW_GAP // 399
const GROUP_BLOCK_MARGIN = 12

// SectionTitle: marginTop 36 + divisor 2 + marginTop 18 + linha 46 + marginBottom 18
const SECTION_TITLE_H = 36 + 2 + 18 + 46 + 18 // 120

export function estimateCollectionHeight(p: ShareImagePayload): number {
  const PAD = 96
  const HEADER = 360

  // Grupos: 6 rows fixas (12 grupos / 2 cols)
  const half = Math.ceil(GROUPS.length / 2)
  const groupsH = half * (GROUP_BLOCK_HEIGHT + GROUP_BLOCK_MARGIN)

  // Specials (fontes maiores → +alguns px por bloco)
  let specialsH = 22
  for (const s of p.specials) {
    if (s.total > 0 && s.collected === s.total) specialsH += 74
    else {
      const lines = Math.max(1, Math.ceil(s.missing.length / 11))
      specialsH += 66 + lines * 28
    }
    specialsH += 8
  }

  // Repetidas (2 cols) — DupRow tem altura ~66px (header + 1 linha mono).
  // Casos com muitas labels (>28 chars) podem quebrar pra 2 linhas: +18px.
  let dupsH = 0
  if (p.duplicates.length > 0) {
    let total = 0
    for (const d of p.duplicates) {
      const longLine = d.labels.join(' · ').length > 28
      total += (longLine ? 84 : 66) + 5
    }
    dupsH = SECTION_TITLE_H + Math.ceil(total / 2)
  }

  const FOOTER = 36 + 130
  const SAFETY = 140
  return PAD + HEADER + SECTION_TITLE_H + groupsH + specialsH + dupsH + FOOTER + SAFETY
}

export async function requestShareImage(
  payload: ShareImagePayload,
  format: ShareImageFormat = 'card'
): Promise<Blob> {
  const res = await fetch('/api/share-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, format }),
  })
  if (!res.ok) {
    throw new Error(`share-image: ${res.status}`)
  }
  return await res.blob()
}
