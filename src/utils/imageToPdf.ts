'use client'

/**
 * Embute uma imagem (PNG/JPEG) num PDF de UMA pagina, com tamanho de
 * pagina igual ao tamanho da imagem — pixel-perfect, sem distorcao, zero
 * borda.
 *
 * Por que existir: WhatsApp recomprime imagens enviadas como foto (JPEG
 * agressivo que arruina texto pequeno do card). Documentos PDF passam sem
 * recompressao. Por isso embrulhamos o card-imagem num PDF antes do share
 * — receptor abre o PDF e ve a imagem em qualidade original.
 */
export async function imageBlobToPdfBlob(imageBlob: Blob): Promise<Blob> {
  const dataUrl = await blobToDataUrl(imageBlob)
  const { width, height } = await readImageSize(dataUrl)
  const format = detectImageFormat(imageBlob.type)

  const { jsPDF } = await import('jspdf')
  // unit: 'pt' + format custom = pagina exatamente do tamanho da imagem.
  // Sem hotfixes de px scaling (que em algumas versoes de jsPDF dao quirks).
  const pdf = new jsPDF({
    orientation: width >= height ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [width, height],
  })
  pdf.addImage(dataUrl, format, 0, 0, width, height, undefined, 'FAST')

  return pdf.output('blob') as Blob
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function readImageSize(
  dataUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('failed to read image size'))
    img.src = dataUrl
  })
}

function detectImageFormat(mime: string): 'PNG' | 'JPEG' {
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'JPEG'
  return 'PNG'
}
