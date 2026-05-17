export const BANNER_THRESHOLD = 10

export function shouldShowSyncBanner(collectedCount: number, isDismissed: boolean): boolean {
  if (isDismissed) return false
  return collectedCount >= BANNER_THRESHOLD
}

export const BANNER_DISMISSED_KEY = 'copa26-sync-banner-dismissed'

export function getBannerDismissed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(BANNER_DISMISSED_KEY) === 'true'
}

export function dismissBanner(): void {
  localStorage.setItem(BANNER_DISMISSED_KEY, 'true')
}
