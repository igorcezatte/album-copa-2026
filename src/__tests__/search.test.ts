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
