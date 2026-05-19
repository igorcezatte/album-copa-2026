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

/** Normaliza string: minúsculas, remove acentos, trim. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

// Lookup de nomes/aliases → código do time. Suporta:
//   - código de 3 letras (BRA, FWC, CC...)
//   - nome em português normalizado (alemanha, africa do sul, coreia do sul)
//   - aliases comuns (eua, brazil, korea, tcheca, coca, history...)
const NAME_LOOKUP: Map<string, string> = (() => {
  const m = new Map<string, string>()

  // Códigos de 3 letras (case-insensitive)
  for (const team of TEAMS) m.set(team.code.toLowerCase(), team.code)
  m.set('fwc', 'FWC')
  m.set('cc', 'CC')

  // Nomes em português (normalizados)
  for (const team of TEAMS) m.set(normalize(team.name), team.code)
  m.set(normalize(FWC_SECTION.name), 'FWC')
  m.set(normalize(CC_SECTION.name), 'CC')

  // Aliases comuns (sem acento, minúsculo, sem hífen)
  const aliases: Record<string, string> = {
    // EUA / Brasil / Alemanha
    eua: 'USA',
    brazil: 'BRA',
    germany: 'GER',
    // Coreia do Sul
    coreia: 'KOR',
    korea: 'KOR',
    'korea do sul': 'KOR',
    // República Tcheca
    tcheca: 'CZE',
    'republica tcheca': 'CZE',
    'rep tcheca': 'CZE',
    czechia: 'CZE',
    czech: 'CZE',
    // África do Sul
    'south africa': 'RSA',
    // FWC
    'fifa world cup history': 'FWC',
    'copa history': 'FWC',
    historia: 'FWC',
    history: 'FWC',
    // CC
    'coca cola': 'CC',
    coca: 'CC',
    cocacola: 'CC',
    'figurinhas coca cola': 'CC',
  }
  for (const [k, v] of Object.entries(aliases)) m.set(k, v)

  return m
})()

const MAX_NAME_TOKENS = (() => {
  let max = 1
  NAME_LOOKUP.forEach((_, key) => {
    const n = key.split(/\s+/).length
    if (n > max) max = n
  })
  return max
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
 * Parser global de entrada rápida. Tokeniza letras (com acentos) e dígitos
 * separadamente, depois faz matching mais-longo-possível pra times com nome
 * composto. Aceita:
 *
 *   "BRA 5, MEX 12, FWC 19"        →  [BRA_5, MEX_12, FWC_19]
 *   "bra 5 12 7, mex 1"            →  [BRA_5, BRA_12, BRA_7, MEX_1]
 *   "BRA5 MEX12"                   →  [BRA_5, MEX_12]
 *   "Alemanha 12"                  →  [GER_12]
 *   "alemanha12"                   →  [GER_12]
 *   "Coreia do Sul 5, 7"           →  [KOR_5, KOR_7]
 *   "México 8, áfrica do sul 1"    →  [MEX_8, RSA_1]  (acentos opcionais)
 */
export function parsePackInput(input: string): ParseResult {
  // [À-ÿ] cobre acentos latinos (á, ã, é, ç, ô etc) sem precisar do flag /u
  const tokens = input.match(/[a-zA-ZÀ-ÿ]+|\d+/g) ?? []
  const items: QuickAddItem[] = []
  const errors: string[] = []
  let currentTeam: string | null = null

  let i = 0
  while (i < tokens.length) {
    const token = tokens[i]

    if (/^\d+$/.test(token)) {
      if (!currentTeam) {
        errors.push(`#${token} precisa de um time antes (ex: "BRA ${token}")`)
        i++
        continue
      }
      const num = parseInt(token, 10)
      const max = TEAM_RANGES[currentTeam]
      if (num < 1 || num > max) {
        errors.push(`${currentTeam} #${token} não existe (válido: 1–${max})`)
        i++
        continue
      }
      items.push({ teamCode: currentTeam, number: String(num) })
      i++
      continue
    }

    // Token de letras — tenta matching mais longo possível
    let matchedLen = 0
    let matchedCode: string | null = null
    const maxLen = Math.min(MAX_NAME_TOKENS, tokens.length - i)
    for (let len = maxLen; len >= 1; len--) {
      const slice = tokens.slice(i, i + len)
      // Todos os tokens da slice devem ser letras (não digit no meio)
      if (slice.some((t) => /^\d+$/.test(t))) continue
      const key = normalize(slice.join(' '))
      const code = NAME_LOOKUP.get(key)
      if (code) {
        matchedLen = len
        matchedCode = code
        break
      }
    }

    if (matchedCode) {
      currentTeam = matchedCode
      i += matchedLen
    } else {
      errors.push(`"${token}" não é um time válido`)
      currentTeam = null
      i++
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
