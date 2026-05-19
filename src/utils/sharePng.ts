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
  await new Promise((r) => requestAnimationFrame(r))
  return toBlob(el, {
    pixelRatio: PIXEL_RATIO,
    backgroundColor: '#060a14',
    cacheBust: true,
  })
}
