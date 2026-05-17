import { shouldShowSyncBanner, BANNER_THRESHOLD } from '@/utils/syncBanner'

describe('shouldShowSyncBanner', () => {
  it('exports BANNER_THRESHOLD of 10', () => {
    expect(BANNER_THRESHOLD).toBe(10)
  })

  it('returns true when collected >= 10 and not dismissed', () => {
    expect(shouldShowSyncBanner(10, false)).toBe(true)
    expect(shouldShowSyncBanner(50, false)).toBe(true)
    expect(shouldShowSyncBanner(994, false)).toBe(true)
  })

  it('returns false when dismissed regardless of count', () => {
    expect(shouldShowSyncBanner(10, true)).toBe(false)
    expect(shouldShowSyncBanner(500, true)).toBe(false)
  })

  it('returns false when less than 10 stickers collected', () => {
    expect(shouldShowSyncBanner(9, false)).toBe(false)
    expect(shouldShowSyncBanner(0, false)).toBe(false)
    expect(shouldShowSyncBanner(1, false)).toBe(false)
  })
})
