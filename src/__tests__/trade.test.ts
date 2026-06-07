import {
  getStickerCategory,
  buildTradeProfile,
  encodeTradeProfile,
  decodeTradeProfile,
  calculateTrades,
  applyTradeToAlbum,
  resolveStickerVisual,
  type TradeProfile,
} from '@/utils/trade'
import { tradeTotal } from '@/store/tradeSessionStore'

describe('getStickerCategory', () => {
  it('returns badge for N1 (escudo)', () => {
    expect(getStickerCategory('BRA_1')).toBe('badge')
    expect(getStickerCategory('ARG_1')).toBe('badge')
  })

  it('returns photo for N13 (seleção)', () => {
    expect(getStickerCategory('BRA_13')).toBe('photo')
    expect(getStickerCategory('ARG_13')).toBe('photo')
  })

  it('returns player for stickers N2-N12', () => {
    expect(getStickerCategory('BRA_2')).toBe('player')
    expect(getStickerCategory('BRA_12')).toBe('player')
  })

  it('returns player for stickers N14-N20', () => {
    expect(getStickerCategory('BRA_14')).toBe('player')
    expect(getStickerCategory('BRA_20')).toBe('player')
  })

  it('returns special for CC stickers', () => {
    expect(getStickerCategory('CC_1')).toBe('special')
    expect(getStickerCategory('CC_14')).toBe('special')
  })

  it('returns special for FWC stickers', () => {
    expect(getStickerCategory('FWC_1')).toBe('special')
    expect(getStickerCategory('FWC_00')).toBe('special')
  })
})

describe('buildTradeProfile', () => {
  it('separates duplicates into correct categories', () => {
    const dups = [
      { id: 'BRA_1', quantity: 2 },   // badge, 1 extra
      { id: 'BRA_13', quantity: 2 },  // photo, 1 extra
      { id: 'BRA_3', quantity: 3 },   // player, 2 extras
      { id: 'CC_1', quantity: 2 },    // special, 1 extra
    ]
    const profile = buildTradeProfile(dups, [], 'Igor')

    expect(profile.dup.badge).toEqual(['BRA_1'])
    expect(profile.dup.photo).toEqual(['BRA_13'])
    expect(profile.dup.player).toEqual(['BRA_3', 'BRA_3'])
    expect(profile.dup.special).toEqual(['CC_1'])
  })

  it('separates missing into correct categories', () => {
    const missing = ['ARG_1', 'ARG_13', 'ARG_5', 'FWC_2']
    const profile = buildTradeProfile([], missing)

    expect(profile.need.badge).toContain('ARG_1')
    expect(profile.need.photo).toContain('ARG_13')
    expect(profile.need.player).toContain('ARG_5')
    expect(profile.need.special).toContain('FWC_2')
  })

  it('sets version and date', () => {
    const profile = buildTradeProfile([], [])
    expect(profile.v).toBe(1)
    expect(profile.at).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('encodeTradeProfile / decodeTradeProfile', () => {
  const profile: TradeProfile = {
    v: 1,
    nick: 'Igor',
    at: '2026-05-18',
    dup: { badge: ['BRA_1'], photo: [], player: ['ARG_5'], special: [] },
    need: { badge: [], photo: ['MEX_13'], player: ['FRA_7'], special: [] },
  }

  it('roundtrips correctly', () => {
    const encoded = encodeTradeProfile(profile)
    const decoded = decodeTradeProfile(encoded)
    expect(decoded).toEqual(profile)
  })

  it('returns null for invalid input', () => {
    expect(decodeTradeProfile('###INVALID###')).toBeNull()
    expect(decodeTradeProfile('')).toBeNull()
  })
})

describe('calculateTrades', () => {
  const mine: TradeProfile = {
    v: 1, at: '2026-05-18',
    dup: { badge: ['BRA_1'], photo: [], player: ['ARG_5', 'ARG_5'], special: [] },
    need: { badge: ['MEX_1'], photo: ['ARG_13'], player: ['FRA_7'], special: [] },
  }
  const theirs: TradeProfile = {
    v: 1, at: '2026-05-18',
    dup: { badge: ['MEX_1'], photo: ['ARG_13'], player: ['FRA_7'], special: [] },
    need: { badge: ['BRA_1'], photo: [], player: ['ARG_5'], special: [] },
  }

  it('finds trade opportunities with category rules', () => {
    const result = calculateTrades(mine, theirs, true)
    expect(result.canOffer.map(i => i.stickerId)).toContain('BRA_1')
    expect(result.canOffer.map(i => i.stickerId)).toContain('ARG_5')
    expect(result.canReceive.map(i => i.stickerId)).toContain('MEX_1')
    expect(result.canReceive.map(i => i.stickerId)).toContain('FRA_7')
  })

  it('marks balanced when both sides can trade', () => {
    const result = calculateTrades(mine, theirs, true)
    expect(result.isBalanced).toBe(true)
  })

  it('returns empty and unbalanced when no matches', () => {
    const noMatch: TradeProfile = {
      v: 1, at: '2026-05-18',
      dup: { badge: ['ESP_1'], photo: [], player: [], special: [] },
      need: { badge: [], photo: [], player: ['URU_8'], special: [] },
    }
    const result = calculateTrades(mine, noMatch, true)
    expect(result.canOffer).toHaveLength(0)
    expect(result.canReceive).toHaveLength(0)
    expect(result.isBalanced).toBe(false)
  })

  it('without rules, can match badge dup against badge need cross-category', () => {
    // With rules disabled, I should still find badge↔badge matches
    const result = calculateTrades(mine, theirs, false)
    expect(result.canOffer.length).toBeGreaterThan(0)
    expect(result.canReceive.length).toBeGreaterThan(0)
  })
})

// ── Troca presencial ("Na hora") ────────────────────────────────

describe('applyTradeToAlbum', () => {
  it('entrega consome extras sem zerar a base que o usuário possui', () => {
    const stickers = { BRA_2: { quantity: 3 } } // 2 extras
    const next = applyTradeToAlbum(stickers, { BRA_2: 2 }, {})
    expect(next.BRA_2.quantity).toBe(1)
  })

  it('nunca remove a base mesmo se pedir mais do que tem', () => {
    const next = applyTradeToAlbum({ BRA_2: { quantity: 2 } }, { BRA_2: 5 }, {})
    expect(next.BRA_2.quantity).toBe(1)
  })

  it('ignora entrega de figurinha que o usuário não possui', () => {
    const next = applyTradeToAlbum({}, { ARG_5: 1 }, {})
    expect(next.ARG_5).toBeUndefined()
  })

  it('pegar soma à quantidade existente', () => {
    const next = applyTradeToAlbum({ ARG_5: { quantity: 1 } }, {}, { ARG_5: 2 })
    expect(next.ARG_5.quantity).toBe(3)
  })

  it('pegar algo que falta cria a entrada', () => {
    const next = applyTradeToAlbum({}, {}, { MEX_10: 1 })
    expect(next.MEX_10.quantity).toBe(1)
  })

  it('funciona para especiais (FWC/CC)', () => {
    const next = applyTradeToAlbum({ FWC_3: { quantity: 2 } }, { FWC_3: 1 }, { CC_5: 1 })
    expect(next.FWC_3.quantity).toBe(1)
    expect(next.CC_5.quantity).toBe(1)
  })

  it('não muta o mapa original', () => {
    const stickers = { BRA_2: { quantity: 3 } }
    applyTradeToAlbum(stickers, { BRA_2: 1 }, { ARG_5: 1 })
    expect(stickers.BRA_2.quantity).toBe(3)
    expect((stickers as Record<string, unknown>).ARG_5).toBeUndefined()
  })

  it('entrega e pega na mesma operação', () => {
    const stickers = { BRA_2: { quantity: 3 }, ARG_5: { quantity: 1 } }
    const next = applyTradeToAlbum(stickers, { BRA_2: 2 }, { MEX_7: 1, ARG_5: 1 })
    expect(next.BRA_2.quantity).toBe(1)
    expect(next.MEX_7.quantity).toBe(1)
    expect(next.ARG_5.quantity).toBe(2)
  })
})

describe('tradeTotal', () => {
  it('soma as quantidades do mapa', () => {
    expect(tradeTotal({})).toBe(0)
    expect(tradeTotal({ a: 1, b: 2, c: 3 })).toBe(6)
  })
})

describe('resolveStickerVisual', () => {
  it('resolve especiais com cor e sem bandeira', () => {
    const fwc = resolveStickerVisual('FWC_3')
    expect(fwc.isSpecial).toBe(true)
    expect(fwc.flagCode).toBeUndefined()
    expect(fwc.color).toBe('#f5c42e')

    const cc = resolveStickerVisual('CC_5')
    expect(cc.color).toBe('#e8222a')
  })

  it('resolve time com bandeira e cor', () => {
    const v = resolveStickerVisual('BRA_2')
    expect(v.isSpecial).toBe(false)
    expect(v.flagCode).toBeTruthy()
    expect(v.number).toBe('2')
  })
})
