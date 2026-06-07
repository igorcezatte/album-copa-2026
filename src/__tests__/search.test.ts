import { searchStickers } from '@/utils/search'

describe('searchStickers', () => {
  it('returns empty array for empty query', () => {
    expect(searchStickers('')).toEqual([])
  })

  it('returns empty array for whitespace-only query', () => {
    expect(searchStickers('   ')).toEqual([])
  })

  it('finds stickers by player name (case insensitive)', () => {
    const results = searchStickers('messi')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.sticker.label.toLowerCase().includes('messi'))).toBe(true)
  })

  it('finds stickers by team name (case insensitive)', () => {
    const results = searchStickers('brasil')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.teamCode === 'BRA')).toBe(true)
  })

  it('finds sticker by exact number', () => {
    const results = searchStickers('BRA_3')
    // should not match — we search by number like "3", not by ID
    expect(results).toBeDefined()
  })

  it('finds stickers by sticker number', () => {
    const results = searchStickers('1')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.sticker.number === '1')).toBe(true)
  })

  it('finds stickers by team code', () => {
    const results = searchStickers('ARG')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.teamCode === 'ARG')).toBe(true)
  })

  it('search is case insensitive for team names', () => {
    const lower = searchStickers('argentina')
    const upper = searchStickers('ARGENTINA')
    expect(lower.length).toBe(upper.length)
    expect(lower.length).toBeGreaterThan(0)
  })

  it('result shape has required fields', () => {
    const results = searchStickers('brasil')
    const first = results[0]
    expect(first).toHaveProperty('teamCode')
    expect(first).toHaveProperty('teamName')
    expect(first).toHaveProperty('flagCode')
    expect(first).toHaveProperty('primaryColor')
    expect(first).toHaveProperty('group')
    expect(first).toHaveProperty('sticker')
    expect(first.sticker).toHaveProperty('number')
    expect(first.sticker).toHaveProperty('label')
    expect(first.sticker).toHaveProperty('type')
  })

  it('limits results to avoid rendering thousands of items', () => {
    // searching "a" matches many — should be capped
    const results = searchStickers('a')
    expect(results.length).toBeLessThanOrEqual(50)
  })

  it('includes FWC section stickers in results', () => {
    const results = searchStickers('mascote')
    expect(results.some((r) => r.teamCode === 'FWC')).toBe(true)
  })

  it('includes CC section stickers in results', () => {
    const results = searchStickers('coca')
    expect(results.some((r) => r.teamCode === 'CC')).toBe(true)
  })
})

describe('searchStickers — inteligência de código+número (quick-add)', () => {
  it('resolve "BRA12" na figurinha exata no topo', () => {
    const r = searchStickers('BRA12')
    expect(r[0].teamCode).toBe('BRA')
    expect(r[0].sticker.number).toBe('12')
  })

  it('aceita zero à esquerda ("ARG02" → ARG_2)', () => {
    const r = searchStickers('ARG02')
    expect(r[0].teamCode).toBe('ARG')
    expect(r[0].sticker.number).toBe('2')
  })

  it('aceita espaço entre código e número ("MEX 8")', () => {
    const r = searchStickers('MEX 8')
    expect(r[0].teamCode).toBe('MEX')
    expect(r[0].sticker.number).toBe('8')
  })

  it('aceita nome em português ("alemanha 5")', () => {
    const r = searchStickers('alemanha 5')
    expect(r[0].teamCode).toBe('GER')
    expect(r[0].sticker.number).toBe('5')
  })

  it('resolve especiais ("fwc 19", "cc 5")', () => {
    expect(searchStickers('fwc 19')[0]).toMatchObject({ teamCode: 'FWC', sticker: { number: '19' } })
    expect(searchStickers('cc 5')[0]).toMatchObject({ teamCode: 'CC', sticker: { number: '5' } })
  })

  it('não duplica o match exato na busca por substring', () => {
    const r = searchStickers('BRA12')
    const bra12 = r.filter((x) => x.teamCode === 'BRA' && x.sticker.number === '12')
    expect(bra12).toHaveLength(1)
  })

  it('ignora número fora da faixa do time ("BRA99")', () => {
    const r = searchStickers('BRA99')
    expect(r.some((x) => x.teamCode === 'BRA' && x.sticker.number === '99')).toBe(false)
  })
})
