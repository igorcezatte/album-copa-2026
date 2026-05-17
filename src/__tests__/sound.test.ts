import { getSoundEnabled, setSoundEnabled, toggleSound, SOUND_KEY } from '@/utils/sound'

beforeEach(() => {
  localStorage.clear()
})

describe('sound preference', () => {
  it('defaults to true when no preference saved', () => {
    expect(getSoundEnabled()).toBe(true)
  })

  it('setSoundEnabled persists to localStorage', () => {
    setSoundEnabled(false)
    expect(localStorage.getItem(SOUND_KEY)).toBe('false')
  })

  it('getSoundEnabled reads from localStorage', () => {
    localStorage.setItem(SOUND_KEY, 'false')
    expect(getSoundEnabled()).toBe(false)
  })

  it('toggleSound flips true → false', () => {
    setSoundEnabled(true)
    toggleSound()
    expect(getSoundEnabled()).toBe(false)
  })

  it('toggleSound flips false → true', () => {
    setSoundEnabled(false)
    toggleSound()
    expect(getSoundEnabled()).toBe(true)
  })
})
