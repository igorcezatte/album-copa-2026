// Fontes bundleadas inline como base64 — sem fetch externo. Antes,
// loadGoogleFont() fazia 2 fetches em cascata (CSS legacy + TTF) por
// cold start do Edge runtime do Vercel, totalizando ~20s pra renderizar
// a primeira imagem. Inline elimina o roundtrip e cai pra <1s.
//
// Pra atualizar uma fonte, regerar com:
//   curl -A "Mozilla/5.0" "https://fonts.googleapis.com/css?family=NAME:WEIGHT"
//   curl -o NAME-WEIGHT.ttf <url-extraída-do-css>
//   base64 NAME-WEIGHT.ttf > NAME-WEIGHT.ts (formato deste módulo)
import { FONT_BASE64 as BIG_SHOULDERS_DISPLAY_900 } from './fonts-data/big-shoulders-display-900'
import { FONT_BASE64 as SPACE_MONO_700 } from './fonts-data/space-mono-700'

function decodeBase64(b64: string): ArrayBuffer {
  const bin = atob(b64)
  const len = bin.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

export interface LoadedFonts {
  display: ArrayBuffer
  mono: ArrayBuffer
}

let cached: LoadedFonts | null = null

export function loadShareFonts(): LoadedFonts {
  if (!cached) {
    cached = {
      display: decodeBase64(BIG_SHOULDERS_DISPLAY_900),
      mono: decodeBase64(SPACE_MONO_700),
    }
  }
  return cached
}
