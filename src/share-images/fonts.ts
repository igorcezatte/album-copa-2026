// Carrega TTF do Google Fonts pra alimentar o ImageResponse (Satori não
// aceita woff2). A CSS API legacy (sem User-Agent moderno) retorna TTF.
// O fetch é cacheado no Edge entre invocações, então só dói no cold start.

async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const familyUrl = family.replace(/ /g, '+')
  const cssUrl = `https://fonts.googleapis.com/css?family=${familyUrl}:${weight}`
  const cssRes = await fetch(cssUrl)
  if (!cssRes.ok) throw new Error(`google fonts css ${cssRes.status} for ${family}`)
  const css = await cssRes.text()
  const match = css.match(/url\((https?:\/\/[^)]+\.ttf)\)/)
  if (!match) throw new Error(`no TTF url in css for ${family}`)
  const fontRes = await fetch(match[1])
  if (!fontRes.ok) throw new Error(`google fonts ttf ${fontRes.status} for ${family}`)
  return await fontRes.arrayBuffer()
}

export interface LoadedFonts {
  display: ArrayBuffer
  mono: ArrayBuffer
}

let cached: Promise<LoadedFonts> | null = null

export function loadShareFonts(): Promise<LoadedFonts> {
  if (!cached) {
    cached = Promise.all([
      loadGoogleFont('Big Shoulders Display', 900),
      loadGoogleFont('Space Mono', 700),
    ]).then(([display, mono]) => ({ display, mono }))
  }
  return cached
}
