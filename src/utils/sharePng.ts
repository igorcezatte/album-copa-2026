/**
 * Captura um elemento DOM como PNG via html-to-image.
 *
 * A lib é importada dinamicamente (~80KB) — fica fora do bundle inicial,
 * só carrega quando o usuário escolhe compartilhar como imagem.
 */

const PIXEL_RATIO = 2 // 2x — fica nítido em telas Retina e quando o
// WhatsApp/Instagram redimensiona

export async function elementToPng(el: HTMLElement): Promise<Blob | null> {
  const { toBlob } = await import('html-to-image')

  // Força layout: lê dimensões antes da captura. Garante que o elemento
  // foi medido pelo browser (importante quando renderizamos off-screen).
  const rect = el.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) {
    console.warn('elementToPng: elemento sem dimensões', rect)
    return null
  }

  // Dois RAFs + pequena espera pra browser finalizar paint (fontes, emojis)
  await new Promise((r) => requestAnimationFrame(r))
  await new Promise((r) => requestAnimationFrame(r))
  await new Promise((r) => setTimeout(r, 50))

  return toBlob(el, {
    pixelRatio: PIXEL_RATIO,
    backgroundColor: '#060a14',
    cacheBust: true,
    width: rect.width,
    height: rect.height,
  })
}
