/**
 * Detecta navegadores embutidos (WebViews) de apps populares. Esses browsers
 * normalmente isolam localStorage por sessão — quando o usuário fecha o app,
 * tudo some, mesmo que ele "tenha" um "browser aberto".
 *
 * Origem do problema: usuária recebeu o link via WhatsApp, abriu (WebView do
 * WhatsApp, não Safari de verdade), coletou figurinhas e perdeu tudo na sessão
 * seguinte. Apps cobertos aqui são os que mais aparecem no funil do app
 * (WhatsApp + Instagram em primeiro lugar).
 *
 * Padrões de UA verificados em 2026-05 (iOS e Android):
 * - WhatsApp:   "...WhatsApp/2.23.x..."
 * - Instagram:  "...Instagram 320.0.0.x Android..."
 * - Facebook:   "...FBAN/FBIOS;..." ou "...FB_IAB/FB4A;FBAV/..."
 * - Messenger:  "...FB_IAB/MESSENGER;..." ou "...FBAN/MessengerForiOS..."
 * - TikTok:     "...TikTok/..." ou "...musical_ly/..."
 */

export type InAppBrowserApp =
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'messenger'
  | 'tiktok'

export interface InAppBrowserInfo {
  app: InAppBrowserApp
  label: string
}

const LABELS: Record<InAppBrowserApp, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
  messenger: 'Messenger',
  tiktok: 'TikTok',
}

export function detectInAppBrowser(
  ua: string | undefined | null
): InAppBrowserInfo | null {
  if (!ua) return null
  const u = ua.toLowerCase()

  // Ordem importa: Messenger antes de Facebook (Messenger tem "FB_IAB" também).
  if (u.includes('whatsapp')) return { app: 'whatsapp', label: LABELS.whatsapp }
  if (u.includes('instagram')) return { app: 'instagram', label: LABELS.instagram }
  if (
    u.includes('fb_iab/messenger') ||
    u.includes('messengerforios') ||
    u.includes('messengerlite')
  ) {
    return { app: 'messenger', label: LABELS.messenger }
  }
  if (u.includes('fbav') || u.includes('fban') || u.includes('fb_iab')) {
    return { app: 'facebook', label: LABELS.facebook }
  }
  if (u.includes('tiktok') || u.includes('musical_ly')) {
    return { app: 'tiktok', label: LABELS.tiktok }
  }

  return null
}

/** Retorna 'iOS' | 'Android' | 'other' a partir do UA. */
export function detectOS(ua: string | undefined | null): 'ios' | 'android' | 'other' {
  if (!ua) return 'other'
  const u = ua.toLowerCase()
  if (/iphone|ipad|ipod/.test(u)) return 'ios'
  if (u.includes('android')) return 'android'
  return 'other'
}
