// Banner regular: aparece após o usuário anônimo coletar algumas figurinhas,
// avisando que os dados só existem localmente. Dispensável.
export const BANNER_THRESHOLD = 5

// Lembrete estendido: aparece apenas quando o usuário JÁ dispensou o banner
// regular E continua acumulando figurinhas (sem fazer backup nem logar).
// Mensagem mais forte oferecendo as duas opções de proteção.
export const EXTENDED_REMINDER_THRESHOLD = 30

export const BANNER_DISMISSED_KEY = 'copa26-sync-banner-dismissed'
export const EXTENDED_REMINDER_DISMISSED_KEY =
  'copa26-extended-reminder-dismissed'

export function shouldShowSyncBanner(
  collectedCount: number,
  isDismissed: boolean
): boolean {
  if (isDismissed) return false
  return collectedCount >= BANNER_THRESHOLD
}

export function shouldShowExtendedReminder(
  collectedCount: number,
  syncBannerDismissed: boolean,
  extendedDismissed: boolean
): boolean {
  if (extendedDismissed) return false
  // Só aparece depois que o usuário já dispensou o banner regular — evita
  // empilhar dois avisos ao mesmo tempo.
  if (!syncBannerDismissed) return false
  return collectedCount >= EXTENDED_REMINDER_THRESHOLD
}

export function getBannerDismissed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(BANNER_DISMISSED_KEY) === 'true'
}

export function dismissBanner(): void {
  localStorage.setItem(BANNER_DISMISSED_KEY, 'true')
}

export function getExtendedReminderDismissed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(EXTENDED_REMINDER_DISMISSED_KEY) === 'true'
}

export function dismissExtendedReminder(): void {
  localStorage.setItem(EXTENDED_REMINDER_DISMISSED_KEY, 'true')
}
