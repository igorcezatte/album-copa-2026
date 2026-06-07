import { TEAMS, FWC_SECTION, CC_SECTION } from '@/data/teams'

export type TradeCategory = 'badge' | 'photo' | 'player' | 'special'

export interface TradeProfile {
  v: 1
  nick?: string
  at: string
  dup: Record<TradeCategory, string[]>   // IDs de figurinhas com repetidas
  need: Record<TradeCategory, string[]>  // IDs das figurinhas que faltam
}

export interface TradeItem {
  stickerId: string
  category: TradeCategory
  teamCode: string
  teamName: string
  stickerNumber: string
  stickerLabel: string
}

export interface TradeMatch {
  canOffer: TradeItem[]
  canReceive: TradeItem[]
  isBalanced: boolean
}

// ── Categorização ──────────────────────────────────────────────

export function getStickerCategory(stickerId: string): TradeCategory {
  const [teamCode, number] = stickerId.split('_')
  if (teamCode === 'CC' || teamCode === 'FWC') return 'special'

  const team = TEAMS.find((t) => t.code === teamCode)
  if (!team) return 'player'

  const sticker = team.stickers.find((s) => s.number === number)
  if (!sticker) return 'player'
  if (sticker.type === 'badge') return 'badge'
  if (sticker.type === 'photo') return 'photo'
  return 'player'
}

export function resolveStickerInfo(stickerId: string): TradeItem {
  const [teamCode, number] = stickerId.split('_')
  const category = getStickerCategory(stickerId)

  if (teamCode === 'FWC') {
    const sticker = FWC_SECTION.stickers.find((s) => s.number === number)
    return { stickerId, category: 'special', teamCode: 'FWC', teamName: 'Copa History', stickerNumber: number, stickerLabel: sticker?.label ?? `FWC ${number}` }
  }
  if (teamCode === 'CC') {
    const sticker = CC_SECTION.stickers.find((s) => s.number === number)
    return { stickerId, category: 'special', teamCode: 'CC', teamName: 'Coca-Cola', stickerNumber: number, stickerLabel: sticker?.label ?? `CC ${number}` }
  }

  const team = TEAMS.find((t) => t.code === teamCode)
  const sticker = team?.stickers.find((s) => s.number === number)
  return { stickerId, category, teamCode, teamName: team?.name ?? teamCode, stickerNumber: number, stickerLabel: sticker?.label ?? number }
}

// ── Construção do perfil ────────────────────────────────────────

export function buildTradeProfile(
  duplicates: Array<{ id: string; quantity: number }>,
  missing: string[],
  nick?: string,
): TradeProfile {
  const empty = (): Record<TradeCategory, string[]> =>
    ({ badge: [], photo: [], player: [], special: [] })

  const dup = empty()
  const need = empty()

  for (const { id, quantity } of duplicates) {
    const cat = getStickerCategory(id)
    const extras = quantity - 1
    for (let i = 0; i < extras; i++) dup[cat].push(id)
  }

  for (const id of missing) {
    need[getStickerCategory(id)].push(id)
  }

  return { v: 1, nick, at: new Date().toISOString().split('T')[0], dup, need }
}

// ── Encode / Decode ────────────────────────────────────────────

export function encodeTradeProfile(profile: TradeProfile): string {
  try {
    const json = JSON.stringify(profile)
    return btoa(encodeURIComponent(json))
  } catch {
    return ''
  }
}

export function decodeTradeProfile(encoded: string): TradeProfile | null {
  if (!encoded) return null
  try {
    const json = decodeURIComponent(atob(encoded))
    const parsed = JSON.parse(json)
    if (parsed?.v !== 1) return null
    return parsed as TradeProfile
  } catch {
    return null
  }
}

// ── Cálculo de trocas ──────────────────────────────────────────

function matchDupsToNeeds(dups: string[], needs: string[]): string[] {
  const needCounts = new Map<string, number>()
  for (const id of needs) needCounts.set(id, (needCounts.get(id) ?? 0) + 1)

  const matched: string[] = []
  for (const id of dups) {
    const count = needCounts.get(id) ?? 0
    if (count > 0) {
      matched.push(id)
      needCounts.set(id, count - 1)
    }
  }
  return matched
}

export function calculateTrades(
  mine: TradeProfile,
  theirs: TradeProfile,
  useRules = true,
): TradeMatch {
  const cats: TradeCategory[] = ['badge', 'photo', 'player', 'special']
  const canOffer: TradeItem[] = []
  const canReceive: TradeItem[] = []

  if (useRules) {
    for (const cat of cats) {
      matchDupsToNeeds(mine.dup[cat], theirs.need[cat]).forEach((id) => canOffer.push(resolveStickerInfo(id)))
      matchDupsToNeeds(theirs.dup[cat], mine.need[cat]).forEach((id) => canReceive.push(resolveStickerInfo(id)))
    }
  } else {
    const allMyDups   = cats.flatMap((c) => mine.dup[c])
    const allTheirDups = cats.flatMap((c) => theirs.dup[c])
    const allMyNeed   = cats.flatMap((c) => mine.need[c])
    const allTheirNeed = cats.flatMap((c) => theirs.need[c])
    matchDupsToNeeds(allMyDups, allTheirNeed).forEach((id) => canOffer.push(resolveStickerInfo(id)))
    matchDupsToNeeds(allTheirDups, allMyNeed).forEach((id) => canReceive.push(resolveStickerInfo(id)))
  }

  return { canOffer, canReceive, isBalanced: canOffer.length > 0 && canReceive.length > 0 }
}

// ── Resumo de categorias (para exibição) ──────────────────────

export const CATEGORY_META: Record<TradeCategory, { label: string; icon: string; rule: string }> = {
  badge:   { label: 'Escudos',  icon: '🏅', rule: 'Escudo por escudo (brilhante)' },
  photo:   { label: 'Perfiladas', icon: '📸', rule: 'Perfilada por perfilada (rara)' },
  player:  { label: 'Jogadores', icon: '👥', rule: 'Jogador por jogador'            },
  special: { label: 'Especiais', icon: '⭐', rule: 'Especial por especial'          },
}

// ── Visual de uma figurinha (bandeira + cor) ───────────────────
// Reúso de TEAMS/FWC/CC para renderizar cards de troca. FWC/CC não têm
// bandeira → cor do app (dourado / vermelho Coca) e selo de letra.

export interface StickerVisual {
  teamCode: string
  teamName: string
  label: string
  number: string
  flagCode?: string
  color: string
  isSpecial: boolean
}

export function resolveStickerVisual(stickerId: string): StickerVisual {
  const [teamCode, ...rest] = stickerId.split('_')
  const number = rest.join('_')

  if (teamCode === 'FWC') {
    const s = FWC_SECTION.stickers.find((x) => x.number === number)
    return { teamCode, teamName: 'Copa History', label: s?.label ?? `FWC ${number}`, number, color: '#f5c42e', isSpecial: true }
  }
  if (teamCode === 'CC') {
    const s = CC_SECTION.stickers.find((x) => x.number === number)
    return { teamCode, teamName: 'Coca-Cola', label: s?.label ?? `CC ${number}`, number, color: '#e8222a', isSpecial: true }
  }

  const team = TEAMS.find((t) => t.code === teamCode)
  const s = team?.stickers.find((x) => x.number === number)
  return {
    teamCode,
    teamName: team?.name ?? teamCode,
    label: s?.label ?? number,
    number,
    flagCode: team?.flagCode,
    color: team?.primaryColor ?? '#94a3b8',
    isSpecial: false,
  }
}

// ── Aplicar troca ao álbum (reducer puro, testável) ────────────
// `giving`/`taking`: stickerId → quantidade. Entregar nunca zera a base que o
// usuário possui (só consome extras); pegar soma. Retorna o novo mapa, sem
// mutar o original — o albumStore aplica num único set().

export function applyTradeToAlbum(
  stickers: Record<string, { quantity: number }>,
  giving: Record<string, number>,
  taking: Record<string, number>,
): Record<string, { quantity: number }> {
  const next: Record<string, { quantity: number }> = {}
  for (const [id, entry] of Object.entries(stickers)) next[id] = { quantity: entry.quantity }

  for (const [id, n] of Object.entries(giving)) {
    if (n <= 0) continue
    const current = next[id]?.quantity ?? 0
    if (current <= 0) continue // não cria figurinha que o usuário não tem
    next[id] = { quantity: Math.max(1, current - n) }
  }

  for (const [id, n] of Object.entries(taking)) {
    if (n <= 0) continue
    const current = next[id]?.quantity ?? 0
    next[id] = { quantity: current + n }
  }

  return next
}
