import { getTheme, setTheme, toggleTheme, THEME_KEY, type Theme } from '@/utils/theme'

beforeEach(() => {
  localStorage.clear()
})

describe('theme preference', () => {
  it('defaults to pro when no preference saved', () => {
    expect(getTheme()).toBe('pro')
  })

  it('setTheme persists to localStorage', () => {
    setTheme('kids')
    expect(localStorage.getItem(THEME_KEY)).toBe('kids')
  })

  it('getTheme reads kids from localStorage', () => {
    localStorage.setItem(THEME_KEY, 'kids')
    expect(getTheme()).toBe('kids')
  })

  it('getTheme reads pro from localStorage', () => {
    localStorage.setItem(THEME_KEY, 'pro')
    expect(getTheme()).toBe('pro')
  })

  it('toggleTheme flips pro → kids', () => {
    setTheme('pro')
    toggleTheme()
    expect(getTheme()).toBe('kids')
  })

  it('toggleTheme flips kids → pro', () => {
    setTheme('kids')
    toggleTheme()
    expect(getTheme()).toBe('pro')
  })

  it('getTheme returns pro for unknown value', () => {
    localStorage.setItem(THEME_KEY, 'unknown')
    expect(getTheme()).toBe('pro')
  })
})
