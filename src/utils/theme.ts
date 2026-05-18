export type Theme = 'pro' | 'light'

export const THEME_KEY = 'copa26-theme'

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'pro'
  const stored = localStorage.getItem(THEME_KEY)
  // retrocompatibilidade: 'kids' vira 'light'
  return stored === 'light' || stored === 'kids' ? 'light' : 'pro'
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme)
  document.documentElement.setAttribute('data-theme', theme)
}

export function toggleTheme(): void {
  setTheme(getTheme() === 'pro' ? 'light' : 'pro')
}
