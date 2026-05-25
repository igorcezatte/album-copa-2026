// QR code como SVG data URI pra embutir no Satori via <img>. Usa
// qrcode.toString({ type: 'svg' }) que é puramente algorítmico —
// roda em Edge runtime sem precisar de Buffer/Canvas.
import QRCode from 'qrcode'

const cache = new Map<string, string>()

export interface QrOptions {
  /** Cor dos módulos (default preto) */
  dark?: string
  /** Cor de fundo (default transparente — passe '#FFFFFF00' explicitamente
   *  pra forçar transparente, ou cor sólida pra fundo). */
  light?: string
  /** Margem em módulos (default 1, mínimo recomendado pelo padrão). */
  margin?: number
}

export async function loadQrDataUri(text: string, opts: QrOptions = {}): Promise<string> {
  const key = `${text}::${opts.dark ?? ''}::${opts.light ?? ''}::${opts.margin ?? 1}`
  const cached = cache.get(key)
  if (cached) return cached

  const svg = await QRCode.toString(text, {
    type: 'svg',
    margin: opts.margin ?? 1,
    errorCorrectionLevel: 'M',
    color: {
      dark: opts.dark ?? '#000000',
      light: opts.light ?? '#FFFFFF',
    },
  })

  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  cache.set(key, uri)
  return uri
}
