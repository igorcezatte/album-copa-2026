import { TEAMS, FWC_SECTION, CC_SECTION, type StickerDef } from '@/data/teams'

export interface SearchResult {
  teamCode: string
  teamName: string
  flagCode: string
  primaryColor: string
  group: string
  sticker: StickerDef
}

const MAX_RESULTS = 50

export function searchStickers(query: string): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const results: SearchResult[] = []

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
