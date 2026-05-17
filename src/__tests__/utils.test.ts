import { cn, pct, formatPct } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'skip', 'keep')).toBe('base keep')
  })

  it('merges conflicting tailwind classes (tailwind-merge)', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })
})

describe('pct', () => {
  it('returns 0 when total is 0', () => {
    expect(pct(5, 0)).toBe(0)
  })

  it('returns 100 when collected = total', () => {
    expect(pct(20, 20)).toBe(100)
  })

  it('rounds to nearest integer', () => {
    expect(pct(1, 3)).toBe(33)
  })

  it('returns 50 for half', () => {
    expect(pct(10, 20)).toBe(50)
  })

  it('returns 0 when collected is 0', () => {
    expect(pct(0, 994)).toBe(0)
  })
})

describe('formatPct', () => {
  it('appends % sign', () => {
    expect(formatPct(1, 2)).toBe('50%')
    expect(formatPct(0, 10)).toBe('0%')
    expect(formatPct(10, 10)).toBe('100%')
  })
})
