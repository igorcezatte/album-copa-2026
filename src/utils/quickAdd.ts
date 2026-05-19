/**
 * Parsers para os fluxos de entrada rápida:
 *   - parseQuickNumbers: "5 7 13 5" no contexto de um time → 4 figurinhas
 *   - parsePackInput: "BRA 5, MEX 12, FWC 19" misturando times → 3 figurinhas
 *
 * Ambos consideram repetições de número como múltiplas instâncias (1ª vira
 * coleta, 2ª vira repetida, etc.). itemsToCounts agrupa pra aplicar via
 * addDuplicate N vezes no albumStore.
 */

import { TEAMS, FWC_SECTION, CC_SECTION } from '@/data/teams'

// Map team/section code → quantidade total de figurinhas
const TEAM_RANGES: Record<string, number> = (() => {
  const r: Record<string, number> = {}
  for (const team of TEAMS) r[team.code] = team.stickers.length
  r['FWC'] = FWC_SECTION.stickers.length
  r['CC'] = CC_SECTION.stickers.length
  return r
})()

export function getMaxNumber(code: string): number | null {
  return TEAM_RANGES[code] ?? null
}

export type QuickAddItem = {
  teamCode: string
  number: string
}

export type ParseResult = {
  items: QuickAddItem[]
  errors: string[]
}

/**
 * Parser do quick-add por time: extrai todos os números do input,
 * valida contra a faixa do time, ignora qualquer texto não-numérico.
 */
export function parseQuickNumbers(
  input: string,
  teamCode: string
): ParseResult {
  const max = TEAM_RANGES[teamCode]
  if (!max) {
    return { items: [], errors: [`Time "${teamCode}" desconhecido`] }
  }

  const tokens = input.match(/\d+/g) ?? []
  const items: QuickAddItem[] = []
  const errors: string[] = []

  for (const token of tokens) {
    const num = parseInt(token, 10)
    if (num < 1 || num > max) {
      errors.push(`#${token} não existe (válido: 1–${max})`)
      continue
    }
    items.push({ teamCode, number: String(num) })
  }

  return { items, errors }
}

/**
 * Parser global "Abri um pacote": tokeniza alternando letras e dígitos.
 * Códigos de time/seção definem o contexto pros números seguintes.
 *
 *   "BRA 5, MEX 12, FWC 19"  →  [BRA_5, MEX_12, FWC_19]
 *   "bra 5 12 7, mex 1"      →  [BRA_5, BRA_12, BRA_7, MEX_1]
 *   "BRA5 MEX12"             →  [BRA_5, MEX_12]
 */
export function parsePackInput(input: string): ParseResult {
  const tokens = input.match(/[a-z]+|\d+/gi) ?? []
  const items: QuickAddItem[] = []
  const errors: string[] = []
  let currentTeam: string | null = null

  for (const token of tokens) {
    if (/^\d+$/.test(token)) {
      if (!currentTeam) {
        errors.push(`#${token} precisa de um time antes (ex: "BRA ${token}")`)
        continue
      }
      const num = parseInt(token, 10)
      const max = TEAM_RANGES[currentTeam]
      if (num < 1 || num > max) {
        errors.push(`${currentTeam} #${token} não existe (válido: 1–${max})`)
        continue
      }
      items.push({ teamCode: currentTeam, number: String(num) })
    } else {
      const code = token.toUpperCase()
      if (TEAM_RANGES[code]) {
        currentTeam = code
      } else {
        errors.push(`"${token}" não é um time válido`)
        currentTeam = null
      }
    }
  }

  return { items, errors }
}

/**
 * Agrupa items por sticker_id contando quantas vezes aparece, pra saber
 * quantas chamadas de addDuplicate disparar por figurinha.
 */
export function itemsToCounts(items: QuickAddItem[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const item of items) {
    const id = `${item.teamCode}_${item.number}`
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return counts
}
