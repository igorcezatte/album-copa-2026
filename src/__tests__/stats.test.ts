import { sortByCompletion, countCompleted, computeGroupStats } from '@/utils/stats'

const makeProgress = (collected: number, total: number) => ({ collected, total })

describe('sortByCompletion', () => {
  it('sorts teams by percentage descending', () => {
    const teams = [
      { code: 'A', name: 'Time A', collected: 10, total: 20 },
      { code: 'B', name: 'Time B', collected: 20, total: 20 },
      { code: 'C', name: 'Time C', collected: 5, total: 20 },
    ]
    const sorted = sortByCompletion(teams)
    expect(sorted[0].code).toBe('B')
    expect(sorted[1].code).toBe('A')
    expect(sorted[2].code).toBe('C')
  })

  it('handles all zeros', () => {
    const teams = [
      { code: 'A', name: 'A', collected: 0, total: 20 },
      { code: 'B', name: 'B', collected: 0, total: 20 },
    ]
    const sorted = sortByCompletion(teams)
    expect(sorted).toHaveLength(2)
  })

  it('returns a new array without mutating input', () => {
    const teams = [
      { code: 'A', name: 'A', collected: 5, total: 20 },
      { code: 'B', name: 'B', collected: 15, total: 20 },
    ]
    const original = [...teams]
    sortByCompletion(teams)
    expect(teams[0].code).toBe(original[0].code)
  })
})

describe('countCompleted', () => {
  it('counts teams with 100% completion', () => {
    const teams = [
      makeProgress(20, 20),
      makeProgress(10, 20),
      makeProgress(20, 20),
      makeProgress(0, 20),
    ]
    expect(countCompleted(teams)).toBe(2)
  })

  it('returns 0 when none completed', () => {
    const teams = [makeProgress(0, 20), makeProgress(5, 20)]
    expect(countCompleted(teams)).toBe(0)
  })

  it('handles total = 0 without counting as complete', () => {
    expect(countCompleted([makeProgress(0, 0)])).toBe(0)
  })
})

describe('computeGroupStats', () => {
  it('returns one entry per group', () => {
    const groups = { A: makeProgress(40, 80), B: makeProgress(20, 80) }
    const result = computeGroupStats(groups)
    expect(result).toHaveLength(2)
  })

  it('includes group, collected, total and pct fields', () => {
    const groups = { A: makeProgress(40, 80) }
    const result = computeGroupStats(groups)
    expect(result[0]).toMatchObject({
      group: 'A',
      collected: 40,
      total: 80,
      pct: 50,
    })
  })

  it('sorts groups alphabetically', () => {
    const groups = { C: makeProgress(10, 80), A: makeProgress(40, 80), B: makeProgress(20, 80) }
    const result = computeGroupStats(groups)
    expect(result.map((r) => r.group)).toEqual(['A', 'B', 'C'])
  })
})
