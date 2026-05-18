import {
  shouldShowSyncBanner,
  shouldShowExtendedReminder,
  BANNER_THRESHOLD,
  EXTENDED_REMINDER_THRESHOLD,
} from '@/utils/syncBanner'

describe('shouldShowSyncBanner', () => {
  it('threshold é 5 figurinhas', () => {
    expect(BANNER_THRESHOLD).toBe(5)
  })

  it('aparece a partir do threshold quando não dispensado', () => {
    expect(shouldShowSyncBanner(5, false)).toBe(true)
    expect(shouldShowSyncBanner(50, false)).toBe(true)
    expect(shouldShowSyncBanner(994, false)).toBe(true)
  })

  it('não aparece quando dispensado, qualquer count', () => {
    expect(shouldShowSyncBanner(5, true)).toBe(false)
    expect(shouldShowSyncBanner(500, true)).toBe(false)
  })

  it('não aparece abaixo do threshold', () => {
    expect(shouldShowSyncBanner(4, false)).toBe(false)
    expect(shouldShowSyncBanner(0, false)).toBe(false)
    expect(shouldShowSyncBanner(1, false)).toBe(false)
  })
})

describe('shouldShowExtendedReminder', () => {
  it('threshold é 30 figurinhas', () => {
    expect(EXTENDED_REMINDER_THRESHOLD).toBe(30)
  })

  it('só aparece depois do banner regular dispensado', () => {
    expect(shouldShowExtendedReminder(50, false, false)).toBe(false)
    expect(shouldShowExtendedReminder(50, true, false)).toBe(true)
  })

  it('não aparece se foi dispensado, mesmo com banner regular dispensado', () => {
    expect(shouldShowExtendedReminder(100, true, true)).toBe(false)
  })

  it('não aparece abaixo do threshold de 30', () => {
    expect(shouldShowExtendedReminder(29, true, false)).toBe(false)
    expect(shouldShowExtendedReminder(0, true, false)).toBe(false)
  })

  it('aparece exatamente no threshold', () => {
    expect(shouldShowExtendedReminder(30, true, false)).toBe(true)
  })
})
