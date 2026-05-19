/**
 * Gerador de imagem PNG da coleção usando Canvas 2D nativo.
 *
 * Não depende de DOM/CSS — desenha cada elemento direto no canvas.
 * Isso evita todos os problemas de captura via html-to-image/html2canvas,
 * que sofrem com interferência do CSS global do app.
 */

export interface ShareableData {
  collected: number
  total: number
  teamsMissing: Array<{
    teamName: string
    flagCode: string
    missing: string[]
  }>
  specialsMissing: Array<{
    name: string
    icon: string
    missing: string[]
  }>
  duplicates: Array<{
    teamCode: string
    teamName: string
    flagCode: string
    number: string
    extras: number
  }>
}

const CARD_W = 1080
const PADDING = 60
const SCALE = 2 // pixel ratio pra resolução crisp

// Cores
const COLOR_BG_TOP = '#0a1226'
const COLOR_BG_BOTTOM = '#060a14'
const COLOR_TEXT = '#f1f5f9'
const COLOR_GOLD = '#f5c42e'
const COLOR_GOLD_DARK = '#d4a017'
const COLOR_RED = '#ef4444'
const COLOR_MUTED = 'rgba(255,255,255,0.45)'
const COLOR_MUTED_LIGHT = 'rgba(255,255,255,0.3)'

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif'

function flagEmoji(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return '🏳️'
  const cp = (c: string) => 0x1f1e6 + c.charCodeAt(0) - 65
  return Array.from(iso2.toUpperCase())
    .map((c) => String.fromCodePoint(cp(c)))
    .join('')
}

// Helper: trim numbers list pra não estourar o card. Quebra em várias linhas.
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(', ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current}, ${word}` : word
    if (ctx.measureText(test).width <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  // r não pode passar de metade do menor lado, senão desenha paths inválidos
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.lineTo(x + w - rr, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr)
  ctx.lineTo(x + w, y + h - rr)
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
  ctx.lineTo(x + rr, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr)
  ctx.lineTo(x, y + rr)
  ctx.quadraticCurveTo(x, y, x + rr, y)
  ctx.closePath()
}

// ─── Layout: calcula a altura total antes de criar canvas ─────────────

interface LayoutMeasure {
  totalHeight: number
  faltantesRows: Array<{ height: number; lines: string[] }>
  duplicateRows: number
}

function measureLayout(
  ctx: CanvasRenderingContext2D,
  data: ShareableData
): LayoutMeasure {
  let h = PADDING // top padding
  h += 80 // header (logo + title row)
  h += 30 // spacer below header
  h += 100 // progress section
  h += 40 // spacer

  const totalMissing =
    data.teamsMissing.reduce((acc, t) => acc + t.missing.length, 0) +
    data.specialsMissing.reduce((acc, s) => acc + s.missing.length, 0)

  const faltantesRows: Array<{ height: number; lines: string[] }> = []

  if (totalMissing > 0) {
    h += 1 + 30 // divider + spacer
    h += 50 // section title

    const allRows = [...data.teamsMissing, ...data.specialsMissing].filter(
      (r) => r.missing.length > 0
    )
    ctx.font = `500 22px ${FONT_STACK}`
    for (const row of allRows) {
      const text = row.missing.join(', ')
      const maxWidth = CARD_W - PADDING * 2 - 60 - 24 - 80 // emoji + gap + badge
      const lines = wrapText(ctx, text, maxWidth)
      const rowHeight = Math.max(60, 30 + lines.length * 30 + 16)
      faltantesRows.push({ height: rowHeight, lines })
      h += rowHeight + 10 // spacing
    }
  }

  if (data.duplicates.length > 0) {
    h += 1 + 30 // divider + spacer
    h += 50 // section title
    const rows = Math.ceil(data.duplicates.length / 2)
    h += rows * 64 + 8
  }

  h += 30 // spacer
  h += 1 + 24 // footer divider
  h += 40 // footer text
  h += PADDING // bottom padding

  return { totalHeight: h, faltantesRows, duplicateRows: Math.ceil(data.duplicates.length / 2) }
}

// ─── Drawing ──────────────────────────────────────────────────────────

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const grad = ctx.createLinearGradient(0, 0, 0, height)
  grad.addColorStop(0, COLOR_BG_TOP)
  grad.addColorStop(1, COLOR_BG_BOTTOM)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  data: ShareableData,
  y: number
): number {
  const pct = data.total > 0 ? Math.round((data.collected / data.total) * 100) : 0

  // Logo "26"
  const logoSize = 60
  const logoX = PADDING
  const logoY = y
  const logoGrad = ctx.createLinearGradient(
    logoX,
    logoY,
    logoX + logoSize,
    logoY + logoSize
  )
  logoGrad.addColorStop(0, COLOR_GOLD)
  logoGrad.addColorStop(1, COLOR_GOLD_DARK)
  ctx.fillStyle = logoGrad
  roundRect(ctx, logoX, logoY, logoSize, logoSize, 14)
  ctx.fill()

  ctx.fillStyle = '#000'
  ctx.font = `900 28px ${FONT_STACK}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('26', logoX + logoSize / 2, logoY + logoSize / 2 + 2)

  // Título
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = COLOR_TEXT
  ctx.font = `900 32px ${FONT_STACK}`
  ctx.fillText('Álbum Copa 2026', logoX + logoSize + 14, y + 28)

  ctx.fillStyle = COLOR_MUTED
  ctx.font = `500 18px ${FONT_STACK}`
  ctx.fillText('Minha coleção', logoX + logoSize + 14, y + 54)

  // Percentage à direita
  ctx.fillStyle = COLOR_GOLD
  ctx.font = `900 72px ${FONT_STACK}`
  ctx.textAlign = 'right'
  ctx.fillText(`${pct}%`, CARD_W - PADDING, y + 60)
  ctx.textAlign = 'left'

  return y + 80
}

function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  data: ShareableData,
  y: number
): number {
  const pct = data.total > 0 ? data.collected / data.total : 0
  const x = PADDING
  const w = CARD_W - PADDING * 2

  // "357/994" + "figurinhas"
  ctx.fillStyle = COLOR_TEXT
  ctx.font = `900 40px ${FONT_STACK}`
  ctx.textBaseline = 'alphabetic'
  const collectedW = ctx.measureText(String(data.collected)).width
  ctx.fillText(String(data.collected), x, y + 30)
  ctx.fillStyle = COLOR_MUTED_LIGHT
  ctx.font = `900 28px ${FONT_STACK}`
  ctx.fillText(`/${data.total}`, x + collectedW + 4, y + 30)

  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = `500 16px ${FONT_STACK}`
  ctx.textAlign = 'right'
  ctx.fillText('figurinhas', CARD_W - PADDING, y + 30)
  ctx.textAlign = 'left'

  // Barra
  const barY = y + 50
  const barH = 14
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  roundRect(ctx, x, barY, w, barH, 7)
  ctx.fill()

  // Fill
  const fillW = Math.max(barH, w * pct)
  const fillGrad = ctx.createLinearGradient(x, 0, x + w, 0)
  if (pct === 1) {
    fillGrad.addColorStop(0, '#22c55e')
    fillGrad.addColorStop(1, '#16a34a')
  } else {
    fillGrad.addColorStop(0, 'rgba(245,196,46,0.8)')
    fillGrad.addColorStop(1, COLOR_GOLD)
  }
  ctx.fillStyle = fillGrad
  roundRect(ctx, x, barY, fillW, barH, 7)
  ctx.fill()

  return y + 90
}

function drawDivider(ctx: CanvasRenderingContext2D, y: number): number {
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.fillRect(PADDING, y, CARD_W - PADDING * 2, 1)
  return y + 1 + 30
}

function drawFaltantesSection(
  ctx: CanvasRenderingContext2D,
  data: ShareableData,
  measure: LayoutMeasure,
  y: number
): number {
  const totalMissing =
    data.teamsMissing.reduce((acc, t) => acc + t.missing.length, 0) +
    data.specialsMissing.reduce((acc, s) => acc + s.missing.length, 0)

  // Título
  ctx.fillStyle = COLOR_RED
  ctx.font = `900 22px ${FONT_STACK}`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(`❌ Faltam ${totalMissing}`, PADDING, y + 22)
  y += 50

  const allRows: Array<{
    teamName: string
    icon: string
    missing: string[]
    isSpecial: boolean
  }> = [
    ...data.teamsMissing.map((t) => ({
      teamName: t.teamName,
      icon: flagEmoji(t.flagCode),
      missing: t.missing,
      isSpecial: false,
    })),
    ...data.specialsMissing.map((s) => ({
      teamName: s.name,
      icon: s.icon,
      missing: s.missing,
      isSpecial: true,
    })),
  ].filter((r) => r.missing.length > 0)

  let rowIdx = 0
  for (const row of allRows) {
    const m = measure.faltantesRows[rowIdx++]
    const rowH = m.height

    // Card background
    ctx.fillStyle = row.isSpecial
      ? 'rgba(245,196,46,0.05)'
      : 'rgba(255,255,255,0.03)'
    roundRect(ctx, PADDING, y, CARD_W - PADDING * 2, rowH, 12)
    ctx.fill()
    ctx.strokeStyle = row.isSpecial
      ? 'rgba(245,196,46,0.15)'
      : 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Bandeira/icon
    ctx.fillStyle = COLOR_TEXT
    ctx.font = `28px ${FONT_STACK}`
    ctx.textBaseline = 'middle'
    ctx.fillText(row.icon, PADDING + 14, y + 20 + 14)

    // Nome
    ctx.fillStyle = COLOR_TEXT
    ctx.font = `700 18px ${FONT_STACK}`
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(row.teamName, PADDING + 14 + 36 + 12, y + 30)

    // Números (multi-line se preciso)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = `500 15px ${FONT_STACK}`
    let lineY = y + 30 + 22
    for (const line of m.lines) {
      ctx.fillText(line, PADDING + 14 + 36 + 12, lineY)
      lineY += 22
    }

    // Badge -N
    const badgeText = `-${row.missing.length}`
    ctx.font = `900 14px ${FONT_STACK}`
    const badgeW = ctx.measureText(badgeText).width + 20
    const badgeX = CARD_W - PADDING - 14 - badgeW
    const badgeY = y + 14
    const badgeH = 26
    ctx.fillStyle = row.isSpecial
      ? 'rgba(245,196,46,0.12)'
      : 'rgba(239,68,68,0.12)'
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 999)
    ctx.fill()
    ctx.fillStyle = row.isSpecial ? COLOR_GOLD : COLOR_RED
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2 + 1)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'

    y += rowH + 10
  }

  return y
}

function drawRepetidasSection(
  ctx: CanvasRenderingContext2D,
  data: ShareableData,
  y: number
): number {
  const total = data.duplicates.reduce((acc, d) => acc + d.extras, 0)

  // Título
  ctx.fillStyle = COLOR_GOLD
  ctx.font = `900 22px ${FONT_STACK}`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(`♻️ Repetidas ${total}`, PADDING, y + 22)
  y += 50

  // 2 colunas
  const colW = (CARD_W - PADDING * 2 - 8) / 2
  const itemH = 56

  data.duplicates.forEach((d, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const itemX = PADDING + col * (colW + 8)
    const itemY = y + row * (itemH + 8)

    ctx.fillStyle = 'rgba(245,196,46,0.05)'
    roundRect(ctx, itemX, itemY, colW, itemH, 10)
    ctx.fill()
    ctx.strokeStyle = 'rgba(245,196,46,0.15)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Bandeira
    ctx.fillStyle = COLOR_TEXT
    ctx.font = `22px ${FONT_STACK}`
    ctx.textBaseline = 'middle'
    ctx.fillText(flagEmoji(d.flagCode), itemX + 12, itemY + itemH / 2)

    // Nome
    ctx.fillStyle = COLOR_TEXT
    ctx.font = `700 14px ${FONT_STACK}`
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(d.teamName, itemX + 12 + 28, itemY + 22)

    // #N · ×K
    const extras = d.extras > 1 ? ` · ×${d.extras}` : ''
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = `500 13px ${FONT_STACK}`
    ctx.fillText(`#${d.number}${extras}`, itemX + 12 + 28, itemY + 42)
  })

  const rows = Math.ceil(data.duplicates.length / 2)
  return y + rows * (itemH + 8)
}

function drawFooter(ctx: CanvasRenderingContext2D, y: number): number {
  y += 16
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  ctx.fillRect(PADDING, y, CARD_W - PADDING * 2, 1)
  y += 24

  ctx.fillStyle = COLOR_GOLD
  ctx.font = `700 18px ${FONT_STACK}`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('📲 meualbumcopa26.vercel.app', PADDING, y + 18)

  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.font = `500 13px ${FONT_STACK}`
  ctx.textAlign = 'right'
  ctx.fillText('FIFA World Cup', CARD_W - PADDING, y + 18)
  ctx.textAlign = 'left'

  return y + 40
}

// ─── API pública ──────────────────────────────────────────────────────

export async function generateShareCanvas(data: ShareableData): Promise<Blob | null> {
  // Cria canvas off-screen
  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')!

  // Mede primeiro pra saber a altura
  const measure = measureLayout(tempCtx, data)

  // Cria canvas com tamanho real (já com pixel ratio)
  const canvas = document.createElement('canvas')
  canvas.width = CARD_W * SCALE
  canvas.height = measure.totalHeight * SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.scale(SCALE, SCALE)

  // Desenha
  drawBackground(ctx, CARD_W, measure.totalHeight)

  let y = PADDING
  y = drawHeader(ctx, data, y)
  y += 30
  y = drawProgressBar(ctx, data, y)
  y += 40

  const hasMissing =
    data.teamsMissing.some((t) => t.missing.length > 0) ||
    data.specialsMissing.some((s) => s.missing.length > 0)

  if (hasMissing) {
    y = drawDivider(ctx, y)
    y = drawFaltantesSection(ctx, data, measure, y)
  }

  if (data.duplicates.length > 0) {
    y = drawDivider(ctx, y)
    y = drawRepetidasSection(ctx, data, y)
  }

  drawFooter(ctx, y)

  // Exporta
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}
