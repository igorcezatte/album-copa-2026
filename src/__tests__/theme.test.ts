import { getTheme, setTheme, toggleTheme, THEME_KEY, type Theme } from '@/utils/theme'

beforeEach(() => {
  localStorage.clear()
})

describe('theme preference', () => {
  it('defaults to pro when no preference saved', () => {
    expect(getTheme()).toBe('pro')
  })

  it('setTheme persists to localStorage', () => {
    setTheme('light')
    expect(localStorage.getItem(THEME_KEY)).toBe('light')
  })

  it('getTheme reads light from localStorage', () => {
    localStorage.setItem(THEME_KEY, 'light')
    expect(getTheme()).toBe('light')
  })

  it('getTheme reads pro from localStorage', () => {
    localStorage.setItem(THEME_KEY, 'pro')
    expect(getTheme()).toBe('pro')
  })

  it('toggleTheme flips pro → light', () => {
    setTheme('pro')
    toggleTheme()
    expect(getTheme()).toBe('light')
  })

  it('toggleTheme flips light → pro', () => {
    setTheme('light')
    toggleTheme()
    expect(getTheme()).toBe('pro')
  })

  it('getTheme returns pro for unknown value', () => {
    localStorage.setItem(THEME_KEY, 'unknown')
    expect(getTheme()).toBe('pro')
  })
})
