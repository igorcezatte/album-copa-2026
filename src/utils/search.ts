import { TEAMS, FWC_SECTION, CC_SECTION, type StickerDef } from '@/data/teams'
import { parsePackInput } from './quickAdd'

export interface SearchResult {
  teamCode: string
  teamName: string
  flagCode: string
  primaryColor: string
  group: string
  sticker: StickerDef
}

const MAX_RESULTS = 50

// Índice código → metadados, pra resolver um item parseado (BRA_12) num
// SearchResult completo. Reúsa as cores/grupo de TEAMS e os especiais.
interface CodeEntry {
  teamName: string
  flagCode: string
  primaryColor: string
  group: string
  stickers: StickerDef[]
}
const CODE_INDEX: Record<string, CodeEntry> = (() => {
  const m: Record<string, CodeEntry> = {}
  for (const t of TEAMS) {
    m[t.code] = { teamName: t.name, flagCode: t.flagCode, primaryColor: t.primaryColor, group: t.group, stickers: t.stickers }
  }
  m['FWC'] = { teamName: FWC_SECTION.name, flagCode: 'un', primaryColor: '#0ea5e9', group: 'FWC', stickers: FWC_SECTION.stickers }
  m['CC'] = { teamName: CC_SECTION.name, flagCode: 'un', primaryColor: '#cc0000', group: 'CC', stickers: CC_SECTION.stickers }
  return m
})()

/**
 * Reconhece entradas no estilo "Adicionar Rapidamente": código/nome do time +
 * número (BRA12, ARG 02, "alemanha 5"). Resolve a(s) figurinha(s) exata(s)
 * pra aparecerem no topo da busca. Reúsa o parser do quick-add.
 */
function codeMatches(query: string): SearchResult[] {
  const { items } = parsePackInput(query)
  const out: SearchResult[] = []
  const seen = new Set<string>()
  for (const it of items) {
    const id = `${it.teamCode}_${it.number}`
    if (seen.has(id)) continue
    const entry = CODE_INDEX[it.teamCode]
    if (!entry) continue
    const sticker = entry.stickers.find((s) => s.number === it.number)
    if (!sticker) continue
    seen.add(id)
    out.push({ teamCode: it.teamCode, teamName: entry.teamName, flagCode: entry.flagCode, primaryColor: entry.primaryColor, group: entry.group, sticker })
  }
  return out
}

export function searchStickers(query: string): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const results: SearchResult[] = []
  const seen = new Set<string>()

  // 1) Matches exatos por código+número (mesma inteligência do quick-add).
  for (const m of codeMatches(query)) {
    results.push(m)
    seen.add(`${m.teamCode}_${m.sticker.number}`)
  }

  for (const team of TEAMS) {
    if (results.length >= MAX_RESULTS) break

    const teamMatches =
      team.name.toLowerCase().includes(q) ||
      team.code.toLowerCase().includes(q)

    for (const sticker of team.stickers) {
      if (results.length >= MAX_RESULTS) break

      const stickerMatches =
        sticker.label.toLowerCase().includes(q) ||
        sticker.number === q

      if (teamMatches || stickerMatches) {
        const id = `${team.code}_${sticker.number}`
        if (seen.has(id)) continue
        seen.add(id)
        results.push({
          teamCode: team.code,
          teamName: team.name,
          flagCode: team.flagCode,
          primaryColor: team.primaryColor,
          group: team.group,
          sticker,
        })
      }
    }
  }

  // Also search special sections
  const specialSections = [
    { section: FWC_SECTION, flagCode: 'un', primaryColor: '#0ea5e9', group: 'FWC' },
    { section: CC_SECTION, flagCode: 'un', primaryColor: '#cc0000', group: 'CC' },
  ]

  for (const { section, flagCode, primaryColor, group } of specialSections) {
    if (results.length >= MAX_RESULTS) break

    const sectionMatches =
      section.name.toLowerCase().includes(q) ||
      section.code.toLowerCase().includes(q)

    for (const sticker of section.stickers) {
      if (results.length >= MAX_RESULTS) break

      const stickerMatches =
        sticker.label.toLowerCase().includes(q) ||
        sticker.number === q

      if (sectionMatches || stickerMatches) {
        const id = `${section.code}_${sticker.number}`
        if (seen.has(id)) continue
        seen.add(id)
        results.push({
          teamCode: section.code,
          teamName: section.name,
          flagCode,
          primaryColor,
          group,
          sticker,
        })
      }
    }
  }

  return results
}
