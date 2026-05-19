/**
 * Gerador de PNG da coleção via Canvas 2D nativo.
 *
 * Layout espelha o PDF (faltantes + repetidas) mas em 2 colunas pra ficar
 * legível quando o WhatsApp/Instagram reduz a imagem. Bandeiras reais
 * baixadas de flagcdn.com (mesma fonte do PDF).
 */

export interface ShareableData {
  collected: number
  total: number
  generatedAt: string
  teams: Array<{
    teamName: string
    flagCode: string
    primaryColor: string
    missing: string[]
  }>
  specialSections: Array<{
    name: string
    color: string
    missing: string[]
  }>
  duplicates: Array<{
    teamName: string
    flagCode: string
    primaryColor: string
    labels: string[]
    totalExtras: number
  }>
}

const CARD_W = 1080
const PADDING = 60
// SCALE alto pra garantir nitidez em telas retina (3x DPR) e sobreviver
// à recompressão JPEG do WhatsApp/Instagram.
const SCALE = 3

const COLOR_BG_TOP = '#0a1226'
const COLOR_BG_BOTTOM = '#060a14'
const COLOR_TEXT = '#f1f5f9'
const COLOR_MUTED = 'rgba(255,255,255,0.55)'
const COLOR_MUTED_LIGHT = 'rgba(255,255,255,0.35)'
const COLOR_GOLD = '#f5c42e'
const COLOR_GOLD_DARK = '#d4a017'
const COLOR_RED = '#ef4444'
const COLOR_GREEN = '#22c55e'

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

// ─── Bandeiras: cache + loading ───────────────────────────────────

const flagCache = new Map<string, HTMLImageElement | null>()

function loadFlag(code: string): Promise<HTMLImageElement | null> {
  if (flagCache.has(code)) return Promise.resolve(flagCache.get(code) ?? null)
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      flagCache.set(code, img)
      resolve(img)
    }
    img.onerror = () => {
      flagCache.set(code, null)
      resolve(null)
    }
    // w640 dá margem pra desenhar a bandeira em ate ~10x sem pixelar.
    img.src = `https://flagcdn.com/w640/${code}.png`
  })
}

async function preloadFlags(codes: string[]): Promise<void> {
  await Promise.all(codes.map((c) => loadFlag(c)))
}

// ─── Helpers ──────────────────────────────────────────────────────

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  separator = ' · '
): string[] {
  const parts = text.split(separator)
  const lines: string[] = []
  let current = ''
  for (const part of parts) {
    const test = current ? `${current}${separator}${part}` : part
    if (ctx.measureText(test).width <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = part
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawFlag(
  ctx: CanvasRenderingContext2D,
  code: string,
  primaryColor: string,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const img = flagCache.get(code)
  ctx.save()
  roundRect(ctx, x, y, w, h, 6)
  ctx.clip()
  if (img) {
    ctx.drawImage(img, x, y, w, h)
  } else {
    // fallback: cor do time
    ctx.fillStyle = primaryColor
    ctx.fillRect(x, y, w, h)
  }
  ctx.restore()
  // borda sutil
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1
  roundRect(ctx, x, y, w, h, 6)
  ctx.stroke()
}

// ─── Layout config ────────────────────────────────────────────────

const COL_GAP = 20
const COL_W = (CARD_W - PADDING * 2 - COL_GAP) / 2
const ROW_PAD = 18
const FLAG_W = 64
const FLAG_H = 42
const FLAG_GAP = 16
const NAME_FONT_SIZE = 28
const NUM_FONT_SIZE = 24
const NUM_LINE_H = 30
const MAX_NUM_LINES = 4

// ─── Pre-compute heights ──────────────────────────────────────────

interface RowMeta {
  title: string
  flagCode: string
  primaryColor: string
  itemsText: string
  badgeText: string
  badgeColor: 'red' | 'gold' | 'green'
  isComplete?: boolean
}

function measureRow(
  ctx: CanvasRenderingContext2D,
  row: RowMeta
): { lines: string[]; height: number } {
  if (row.isComplete || !row.itemsText) {
    return { lines: [], height: ROW_PAD * 2 + FLAG_H }
  }
  ctx.font = `500 ${NUM_FONT_SIZE}px ${FONT_STACK}`
  const maxW = COL_W - ROW_PAD * 2
  const lines = wrapText(ctx, row.itemsText, maxW)
  const visibleLines = Math.min(lines.length, MAX_NUM_LINES)
  if (lines.length > MAX_NUM_LINES) {
    lines[MAX_NUM_LINES - 1] = lines[MAX_NUM_LINES - 1].trimEnd() + ' …'
  }
  const trimmed = lines.slice(0, MAX_NUM_LINES)
  // header (bandeira+nome) ~ FLAG_H, depois espaço, depois números
  const headerH = FLAG_H + 16
  const numsH = visibleLines * NUM_LINE_H
  return { lines: trimmed, height: ROW_PAD * 2 + headerH + numsH }
}

// ─── Drawing primitives ───────────────────────────────────────────

function drawBackground(ctx: CanvasRenderingContext2D, height: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, height)
  grad.addColorStop(0, COLOR_BG_TOP)
  grad.addColorStop(1, COLOR_BG_BOTTOM)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, CARD_W, height)
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  data: ShareableData,
  y: number
): number {
  // Logo "26"
  const logoSize = 72
  const logoX = PADDING
  const logoGrad = ctx.createLinearGradient(
    logoX,
    y,
    logoX + logoSize,
    y + logoSize
  )
  logoGrad.addColorStop(0, COLOR_GOLD)
  logoGrad.addColorStop(1, COLOR_GOLD_DARK)
  ctx.fillStyle = logoGrad
  roundRect(ctx, logoX, y, logoSize, logoSize, 18)
  ctx.fill()

  ctx.fillStyle = '#000'
  ctx.font = `900 36px ${FONT_STACK}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('26', logoX + logoSize / 2, y + logoSize / 2 + 2)

  // Título
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = COLOR_TEXT
  ctx.font = `900 40px ${FONT_STACK}`
  ctx.fillText('Álbum Copa 2026', logoX + logoSize + 20, y + 34)

  ctx.fillStyle = COLOR_MUTED
  ctx.font = `500 22px ${FONT_STACK}`
  ctx.fillText(`Minha coleção · ${data.generatedAt}`, logoX + logoSize + 20, y + 64)

  return y + logoSize + 40
}

function drawHero(
  ctx: CanvasRenderingContext2D,
  data: ShareableData,
  y: number
): number {
  const pct = data.total > 0 ? data.collected / data.total : 0
  const pctInt = Math.round(pct * 100)
  const isComplete = pctInt === 100

  // Card hero
  const heroH = 200
  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  roundRect(ctx, PADDING, y, CARD_W - PADDING * 2, heroH, 24)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  ctx.stroke()

  // % grande à esquerda
  ctx.fillStyle = isComplete ? COLOR_GREEN : COLOR_GOLD
  ctx.font = `900 110px ${FONT_STACK}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(`${pctInt}%`, PADDING + 32, y + 110)

  // collected/total
  ctx.fillStyle = COLOR_TEXT
  ctx.font = `900 40px ${FONT_STACK}`
  ctx.fillText(String(data.collected), PADDING + 32, y + 160)
  const cw = ctx.measureText(String(data.collected)).width
  ctx.fillStyle = COLOR_MUTED_LIGHT
  ctx.font = `900 28px ${FONT_STACK}`
  ctx.fillText(`/ ${data.total}`, PADDING + 32 + cw + 8, y + 160)
  ctx.font = `500 20px ${FONT_STACK}`
  ctx.fillStyle = COLOR_MUTED
  ctx.fillText('figurinhas', PADDING + 32 + cw + 8 + ctx.measureText(`/ ${data.total}`).width + 12, y + 160)

  // Mini stats à direita
  const totalMissing =
    data.teams.reduce((acc, t) => acc + t.missing.length, 0) +
    data.specialSections.reduce((acc, s) => acc + s.missing.length, 0)
  const totalDupes = data.duplicates.reduce((acc, d) => acc + d.totalExtras, 0)

  const statsX = CARD_W - PADDING - 32
  ctx.textAlign = 'right'
  ctx.fillStyle = COLOR_RED
  ctx.font = `900 56px ${FONT_STACK}`
  ctx.fillText(String(totalMissing), statsX, y + 80)
  ctx.fillStyle = 'rgba(239,68,68,0.7)'
  ctx.font = `700 18px ${FONT_STACK}`
  ctx.fillText('FALTAM', statsX, y + 108)

  ctx.fillStyle = COLOR_GOLD
  ctx.font = `900 56px ${FONT_STACK}`
  ctx.fillText(String(totalDupes), statsX, y + 162)
  ctx.fillStyle = 'rgba(245,196,46,0.7)'
  ctx.font = `700 18px ${FONT_STACK}`
  ctx.fillText('REPETIDAS', statsX, y + 190)

  ctx.textAlign = 'left'
  return y + heroH + 30
}

function drawSectionTitle(
  ctx: CanvasRenderingContext2D,
  title: string,
  subtitle: string,
  accent: string,
  y: number
): number {
  ctx.fillStyle = accent
  ctx.font = `900 36px ${FONT_STACK}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(title, PADDING, y + 36)

  ctx.fillStyle = COLOR_MUTED
  ctx.font = `500 22px ${FONT_STACK}`
  ctx.fillText(subtitle, PADDING, y + 66)

  // linha sutil
  ctx.fillStyle = `${accent}33` // hex alpha
  ctx.fillRect(PADDING, y + 86, CARD_W - PADDING * 2, 2)

  return y + 110
}

function drawRow(
  ctx: CanvasRenderingContext2D,
  row: RowMeta,
  measured: { lines: string[]; height: number },
  x: number,
  y: number
) {
  const w = COL_W
  const h = measured.height

  // Card
  const accentRgba =
    row.badgeColor === 'gold' ? 'rgba(245,196,46,0.06)' : 'rgba(255,255,255,0.04)'
  const borderRgba =
    row.badgeColor === 'gold' ? 'rgba(245,196,46,0.18)' : 'rgba(255,255,255,0.07)'
  ctx.fillStyle = accentRgba
  roundRect(ctx, x, y, w, h, 18)
  ctx.fill()
  ctx.strokeStyle = borderRgba
  ctx.lineWidth = 1
  ctx.stroke()

  // Bandeira + nome
  drawFlag(ctx, row.flagCode, row.primaryColor, x + ROW_PAD, y + ROW_PAD, FLAG_W, FLAG_H)

  const nameX = x + ROW_PAD + FLAG_W + FLAG_GAP
  const nameY = y + ROW_PAD + FLAG_H / 2 + 2
  ctx.fillStyle = COLOR_TEXT
  ctx.font = `900 ${NAME_FONT_SIZE}px ${FONT_STACK}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'

  // Trunca nome se necessário
  const maxNameW = w - ROW_PAD - FLAG_W - FLAG_GAP - 90 - ROW_PAD // 90 ~ badge
  let name = row.title
  if (ctx.measureText(name).width > maxNameW) {
    while (name.length > 4 && ctx.measureText(name + '…').width > maxNameW) {
      name = name.slice(0, -1)
    }
    name += '…'
  }
  ctx.fillText(name, nameX, nameY)

  // Badge
  ctx.font = `900 22px ${FONT_STACK}`
  const badgeTextW = ctx.measureText(row.badgeText).width
  const badgeW = badgeTextW + 26
  const badgeH = 38
  const badgeX = x + w - ROW_PAD - badgeW
  const badgeY = y + ROW_PAD + (FLAG_H - badgeH) / 2
  const badgeBg =
    row.badgeColor === 'red'
      ? 'rgba(239,68,68,0.18)'
      : row.badgeColor === 'gold'
      ? 'rgba(245,196,46,0.2)'
      : 'rgba(34,197,94,0.2)'
  const badgeFg =
    row.badgeColor === 'red'
      ? COLOR_RED
      : row.badgeColor === 'gold'
      ? COLOR_GOLD
      : COLOR_GREEN
  ctx.fillStyle = badgeBg
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 999)
  ctx.fill()
  ctx.fillStyle = badgeFg
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(row.badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2 + 1)

  // Números
  if (row.isComplete) {
    // não renderiza nada extra
    return
  }
  if (measured.lines.length > 0) {
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = `500 ${NUM_FONT_SIZE}px ${FONT_STACK}`
    let lineY = y + ROW_PAD + FLAG_H + 16 + NUM_FONT_SIZE - 4
    for (const line of measured.lines) {
      ctx.fillText(line, x + ROW_PAD, lineY)
      lineY += NUM_LINE_H
    }
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  rows: RowMeta[],
  y: number
): number {
  if (rows.length === 0) return y

  // Mede cada linha
  const measures = rows.map((r) => measureRow(ctx, r))

  // Distribui em 2 colunas equilibrando altura
  const left: Array<{ row: RowMeta; m: ReturnType<typeof measureRow> }> = []
  const right: Array<{ row: RowMeta; m: ReturnType<typeof measureRow> }> = []
  let leftH = 0
  let rightH = 0
  rows.forEach((r, i) => {
    const m = measures[i]
    if (leftH <= rightH) {
      left.push({ row: r, m })
      leftH += m.height + 12
    } else {
      right.push({ row: r, m })
      rightH += m.height + 12
    }
  })

  // Renderiza
  const leftX = PADDING
  const rightX = PADDING + COL_W + COL_GAP
  let ly = y
  let ry = y
  for (const { row, m } of left) {
    drawRow(ctx, row, m, leftX, ly)
    ly += m.height + 12
  }
  for (const { row, m } of right) {
    drawRow(ctx, row, m, rightX, ry)
    ry += m.height + 12
  }

  return Math.max(ly, ry)
}

function drawFooter(ctx: CanvasRenderingContext2D, y: number, height: number) {
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fillRect(PADDING, y, CARD_W - PADDING * 2, 1)
  y += 28

  ctx.fillStyle = COLOR_GOLD
  ctx.font = `900 26px ${FONT_STACK}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('meualbumcopa26.vercel.app', PADDING, y + 22)

  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.font = `500 18px ${FONT_STACK}`
  ctx.textAlign = 'right'
  ctx.fillText('FIFA World Cup 2026™', CARD_W - PADDING, y + 22)
  void height
}

// ─── Build rows ───────────────────────────────────────────────────

function buildFaltanteRows(data: ShareableData): RowMeta[] {
  const teamRows: RowMeta[] = data.teams
    .filter((t) => t.missing.length > 0)
    .map((t) => ({
      title: t.teamName,
      flagCode: t.flagCode,
      primaryColor: t.primaryColor,
      itemsText: t.missing.join(' · '),
      badgeText: `-${t.missing.length}`,
      badgeColor: 'red',
    }))

  const specialRows: RowMeta[] = data.specialSections
    .filter((s) => s.missing.length > 0)
    .map((s) => ({
      title: s.name,
      flagCode: '',
      primaryColor: s.color,
      itemsText: s.missing.join(' · '),
      badgeText: `-${s.missing.length}`,
      badgeColor: 'gold',
    }))

  return [...teamRows, ...specialRows]
}

function buildRepetidasRows(data: ShareableData): RowMeta[] {
  return data.duplicates.map((d) => ({
    title: d.teamName,
    flagCode: d.flagCode,
    primaryColor: d.primaryColor,
    itemsText: d.labels.join(' · '),
    badgeText: `+${d.totalExtras}`,
    badgeColor: 'gold',
  }))
}

// ─── Public API ───────────────────────────────────────────────────

export async function generateShareCanvas(
  data: ShareableData
): Promise<Blob | null> {
  // Pré-carrega bandeiras (paralelo)
  const codes = new Set<string>()
  for (const t of data.teams) if (t.flagCode) codes.add(t.flagCode)
  for (const d of data.duplicates) if (d.flagCode) codes.add(d.flagCode)
  await preloadFlags(Array.from(codes))

  // Canvas temporário só pra medir (usamos fontes/textos)
  const measureCanvas = document.createElement('canvas')
  measureCanvas.width = 100
  measureCanvas.height = 100
  const measureCtx = measureCanvas.getContext('2d')
  if (!measureCtx) return null

  const faltanteRows = buildFaltanteRows(data)
  const repetidasRows = buildRepetidasRows(data)

  // Calcula altura total iterando o layout (sem desenhar)
  let totalH = PADDING
  totalH += 72 + 40 // header
  totalH += 200 + 30 // hero

  if (faltanteRows.length > 0) {
    totalH += 110 // section title

    // simula 2 colunas pra altura
    const measures = faltanteRows.map((r) => measureRow(measureCtx, r))
    let leftH = 0
    let rightH = 0
    measures.forEach((m) => {
      if (leftH <= rightH) leftH += m.height + 12
      else rightH += m.height + 12
    })
    totalH += Math.max(leftH, rightH)
    totalH += 30
  }

  if (repetidasRows.length > 0) {
    totalH += 110 // section title

    const measures = repetidasRows.map((r) => measureRow(measureCtx, r))
    let leftH = 0
    let rightH = 0
    measures.forEach((m) => {
      if (leftH <= rightH) leftH += m.height + 12
      else rightH += m.height + 12
    })
    totalH += Math.max(leftH, rightH)
    totalH += 30
  }

  totalH += 80 // footer
  totalH += PADDING

  // Renderiza
  const canvas = document.createElement('canvas')
  canvas.width = CARD_W * SCALE
  canvas.height = totalH * SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.scale(SCALE, SCALE)
  // Bandeiras vêm em 640px e sao desenhadas em ~64px — sem isso o downscale
  // sai borrado.
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  drawBackground(ctx, totalH)
  let y = PADDING
  y = drawHeader(ctx, data, y)
  y = drawHero(ctx, data, y)

  if (faltanteRows.length > 0) {
    y = drawSectionTitle(
      ctx,
      'Faltantes',
      `${faltanteRows.reduce((acc, r) => acc + (r.itemsText.split(' · ').length), 0)} figurinhas pra completar`,
      COLOR_RED,
      y
    )
    y = drawGrid(ctx, faltanteRows, y)
    y += 30
  }

  if (repetidasRows.length > 0) {
    y = drawSectionTitle(
      ctx,
      'Repetidas pra trocar',
      `${data.duplicates.reduce((acc, d) => acc + d.totalExtras, 0)} cópias disponíveis`,
      COLOR_GOLD,
      y
    )
    y = drawGrid(ctx, repetidasRows, y)
    y += 30
  }

  drawFooter(ctx, totalH - PADDING - 80, totalH)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}
