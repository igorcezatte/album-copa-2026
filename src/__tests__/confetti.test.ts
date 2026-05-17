import { shouldTriggerConfetti } from '@/utils/confetti'

describe('shouldTriggerConfetti', () => {
  it('returns true when team just became complete', () => {
    expect(shouldTriggerConfetti(19, 20, 20)).toBe(true)
  })

  it('returns false when team was already complete', () => {
    expect(shouldTriggerConfetti(20, 20, 20)).toBe(false)
  })

  it('returns false when team is not complete yet', () => {
    expect(shouldTriggerConfetti(18, 19, 20)).toBe(false)
  })

  it('returns false when total is 0', () => {
    expect(shouldTriggerConfetti(0, 0, 0)).toBe(false)
  })

  it('returns true when first sticker completes a 1-sticker section', () => {
    expect(shouldTriggerConfetti(0, 1, 1)).toBe(true)
  })

  it('returns false when going backwards (uncollect)', () => {
    expect(shouldTriggerConfetti(20, 19, 20)).toBe(false)
  })

  it('returns false for progress in the middle', () => {
    expect(shouldTriggerConfetti(10, 11, 20)).toBe(false)
  })
})
