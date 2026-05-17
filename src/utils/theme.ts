export type Theme = 'pro' | 'kids'

export const THEME_KEY = 'copa26-theme'

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'pro'
  const stored = localStorage.getItem(THEME_KEY)
  return stored === 'kids' ? 'kids' : 'pro'
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme)
  document.documentElement.setAttribute('data-theme', theme)
}

export function toggleTheme(): void {
  setTheme(getTheme() === 'pro' ? 'kids' : 'pro')
}
