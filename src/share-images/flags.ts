// Pre-carrega bandeiras como data URIs em paralelo. Sem isso, o Satori
// fetcha cada <img src="https://flagcdn..."> sequencialmente dentro do
// pipeline de render, virando o gargalo (~20-30s pra ~50 bandeiras).
// Com pre-load + Promise.all, sao todos os fetches em ~500ms.
// w40 = ~40x27px PNG (~1KB cada), suficiente pra renderizar em 28x20.

const cache = new Map<string, string>()

async function fetchFlagDataUri(code: string): Promise<string | null> {
  const cached = cache.get(code)
  if (cached) return cached
  try {
    const res = await fetch(`https://flagcdn.com/w40/${code}.png`)
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const arr = new Uint8Array(buf)
    let binary = ''
    for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i])
    const uri = `data:image/png;base64,${btoa(binary)}`
    cache.set(code, uri)
    return uri
  } catch {
    return null
  }
}

export async function loadFlags(
  codes: string[]
): Promise<Map<string, string>> {
  const unique = Array.from(new Set(codes))
  const results = await Promise.all(
    unique.map(async (c) => [c, await fetchFlagDataUri(c)] as const)
  )
  const map = new Map<string, string>()
  for (const [c, uri] of results) if (uri) map.set(c, uri)
  return map
}

/** Devolve uma URL utilizavel pelo img/Satori, com fallback pra URL externa
 *  caso o pre-load tenha falhado pra um codigo. */
export function makeFlagResolver(
  flagMap: Map<string, string>
): (code: string) => string {
  return (code) =>
    flagMap.get(code) ?? `https://flagcdn.com/w40/${code}.png`
}

export type FlagResolver = ReturnType<typeof makeFlagResolver>
