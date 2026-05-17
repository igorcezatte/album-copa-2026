import { GROUP_COLORS } from '@/data/teams'

// ── Tipos v1 (mantidos para compatibilidade) ────────────────────

export interface PdfTeamEntry { teamName: string; missing: string[] }
export interface PdfGroupEntry { group: string; color: string; teams: PdfTeamEntry[] }
export interface PdfData {
  title: string; generatedAt: string; totalMissing: number; groups: PdfGroupEntry[]
}
export interface MissingTeamInput { teamName: string; group: string; missing: string[] }

export function buildPdfData(teams: MissingTeamInput[]): PdfData {
  const totalMissing = teams.reduce((sum, t) => sum + t.missing.length, 0)
  const groupMap = new Map<string, PdfTeamEntry[]>()
  for (const team of teams) {
    if (!groupMap.has(team.group)) groupMap.set(team.group, [])
    groupMap.get(team.group)!.push({ teamName: team.teamName, missing: team.missing })
  }
  const groups: PdfGroupEntry[] = Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, groupTeams]) => ({ group, color: GROUP_COLORS[group] ?? '#666', teams: groupTeams }))
  const generatedAt = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return { title: 'Álbum Copa 2026 — Lista de Faltantes', generatedAt, totalMissing, groups }
}

// ── Tipos v2 ─────────────────────────────────────────────────────

export interface FullTeamInput {
  teamName: string; group: string; primaryColor: string; flagCode: string; missing: string[]
}
export interface FullSpecialInput { name: string; color: string; missing: string[] }
export interface FullPdfTeamEntry {
  teamName: string; primaryColor: string; flagCode: string; missing: string[]
}
export interface FullPdfGroupEntry { group: string; color: string; teams: FullPdfTeamEntry[] }
export interface FullPdfData {
  title: string; generatedAt: string; totalMissing: number; completedTeams: number
  totalProgress: { collected: number; total: number }
  groups: FullPdfGroupEntry[]
  specialSections: Array<{ name: string; color: string; missing: string[] }>
}

export function buildFullPdfData(
  teams: FullTeamInput[],
  specialSections: FullSpecialInput[],
  totalProgress: { collected: number; total: number },
): FullPdfData {
  let totalMissing = 0
  let completedTeams = 0
  const groupMap = new Map<string, FullPdfTeamEntry[]>()

  for (const team of teams) {
    if (!groupMap.has(team.group)) groupMap.set(team.group, [])
    groupMap.get(team.group)!.push({
      teamName: team.teamName, primaryColor: team.primaryColor,
      flagCode: team.flagCode, missing: team.missing,
    })
    totalMissing += team.missing.length
    if (team.missing.length === 0) completedTeams++
  }

  const groups: FullPdfGroupEntry[] = Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, groupTeams]) => ({ group, color: GROUP_COLORS[group] ?? '#666666', teams: groupTeams }))

  const generatedAt = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return {
    title: 'Álbum Copa 2026', generatedAt, totalMissing, completedTeams, totalProgress,
    groups,
    specialSections: specialSections.map((s) => ({ name: s.name, color: s.color, missing: s.missing })),
  }
}

// ── Helpers internos ─────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '')
  if (c.length !== 6) return [120, 120, 120]
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]
}

function blendWithWhite([r, g, b]: [number, number, number], alpha: number): [number, number, number] {
  return [
    Math.round(r * alpha + 255 * (1 - alpha)),
    Math.round(g * alpha + 255 * (1 - alpha)),
    Math.round(b * alpha + 255 * (1 - alpha)),
  ]
}

async function fetchFlagBase64(flagCode: string): Promise<string | null> {
  try {
    const res = await fetch(`https://flagcdn.com/w20/${flagCode}.png`)
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const arr = new Uint8Array(buf)
    let binary = ''
    for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i])
    return btoa(binary)
  } catch {
    return null
  }
}

// ── Constantes de layout ─────────────────────────────────────────
const FLAG_W = 9, FLAG_H = 6          // bandeira mm
const ROW_MIN = 8                     // altura mínima de linha mm
const ROW_EXTRA = 3.6                 // mm por linha extra de números
const NUM_PER_LINE_EST = 8            // estimativa de números por linha (para pré-cálculo)

function calcRowHeight(missing: string[]): number {
  if (missing.length === 0) return ROW_MIN
  const extraLines = Math.max(0, Math.ceil(missing.length / NUM_PER_LINE_EST) - 1)
  return ROW_MIN + extraLines * ROW_EXTRA
}

// ── Geração do PDF v2 ─────────────────────────────────────────────

export async function generateAndDownloadPdf(data: FullPdfData): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // ── Cores ────────────────────────────────────────────────────
  const W = 210, H = 297, margin = 10, contentW = 190
  const gold: [number, number, number]  = [245, 196, 46]
  const dark: [number, number, number]  = [6, 10, 20]
  const ink: [number, number, number]   = [26, 26, 46]
  const muted: [number, number, number] = [110, 115, 135]
  const green: [number, number, number] = [22, 163, 74]
  const divider: [number, number, number] = [220, 222, 228]

  // ── Pré-busca de bandeiras ───────────────────────────────────
  const allFlagCodesSet = new Set(
    data.groups.flatMap((g) => g.teams.map((t) => t.flagCode).filter((c): c is string => !!c))
  )
  const allFlagCodes = Array.from(allFlagCodesSet)
  const flagCache = new Map<string, string | null>()
  await Promise.all(allFlagCodes.map(async (code) => {
    flagCache.set(code, await fetchFlagBase64(code))
  }))

  // ── Header ────────────────────────────────────────────────────
  const headerH = 20
  doc.setFillColor(...dark)
  doc.rect(0, 0, W, headerH, 'F')
  doc.setFillColor(...gold)
  doc.rect(0, 0, 4, headerH, 'F')

  doc.setTextColor(...gold)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('ÁLBUM COPA 2026', 7, 9)

  doc.setTextColor(200, 205, 220)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('Lista de Figurinhas Faltantes', 7, 14.5)
  doc.text(`Gerado em ${data.generatedAt}`, 7, 18.5)

  // Badge de faltantes
  const badgeW = 36
  doc.setFillColor(...gold)
  doc.roundedRect(W - margin - badgeW, 3, badgeW, 14, 2, 2, 'F')
  doc.setTextColor(...dark)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text(String(data.totalMissing), W - margin - badgeW / 2, 11.5, { align: 'center' })
  doc.setFontSize(5)
  doc.setFont('helvetica', 'normal')
  doc.text('faltantes', W - margin - badgeW / 2, 15, { align: 'center' })

  // Barra de progresso
  const barY = headerH + 1.5
  doc.setFillColor(40, 50, 70)
  doc.rect(margin, barY, contentW, 2, 'F')
  const pct = data.totalProgress.total > 0 ? data.totalProgress.collected / data.totalProgress.total : 0
  doc.setFillColor(...gold)
  doc.rect(margin, barY, contentW * pct, 2, 'F')

  doc.setTextColor(...muted)
  doc.setFontSize(5)
  doc.text(
    `${data.totalProgress.collected}/${data.totalProgress.total} coletadas · ${data.completedTeams} seleções completas`,
    margin, barY + 4,
  )

  // ── Layout de 3 colunas ───────────────────────────────────────
  const gutter = 3
  const colW = (contentW - 2 * gutter) / 3       // ~61mm
  const colXs = [margin, margin + colW + gutter, margin + 2 * (colW + gutter)]
  const startY = barY + 7

  // Área para números: depois da bandeira + nome
  const flagX = 1                                 // offset da borda da coluna
  const nameX = flagX + FLAG_W + 2               // nome começa aqui
  const nameW = 20                                // espaço para nome
  const numX  = nameX + nameW + 1               // números começam aqui
  const numW  = colW - numX - 1                 // espaço restante para números

  // Distribui 12 grupos em 3 colunas (A-D, E-H, I-L)
  const colGroups: FullPdfGroupEntry[][] = [[], [], []]
  data.groups.forEach((g, i) => { colGroups[Math.floor(i / 4)].push(g) })

  const colY = [startY, startY, startY]

  for (let col = 0; col < 3; col++) {
    const cx = colXs[col]

    for (const group of colGroups[col]) {
      const [gr, gg, gb] = hexToRgb(group.color)
      let y = colY[col]

      // ── Cabeçalho do grupo ──────────────────────────────────
      const ghH = 5.5
      doc.setFillColor(...blendWithWhite([gr, gg, gb], 0.2))
      doc.rect(cx, y, colW, ghH, 'F')
      doc.setFillColor(gr, gg, gb)
      doc.rect(cx, y, 2.5, ghH, 'F')
      doc.setTextColor(gr, gg, gb)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text(`GRUPO ${group.group}`, cx + 4, y + 3.8)
      y += ghH

      // ── Times ────────────────────────────────────────────────
      for (const team of group.teams) {
        const rH = calcRowHeight(team.missing)
        const midY = y + rH / 2

        // Bandeira (ou bolinha fallback)
        const flagB64 = flagCache.get(team.flagCode) ?? null
        if (flagB64) {
          try {
            doc.addImage(
              `data:image/png;base64,${flagB64}`,
              'PNG',
              cx + flagX,
              midY - FLAG_H / 2,
              FLAG_W,
              FLAG_H,
            )
          } catch {
            // fallback: bolinha
            const [tr, tg, tb] = hexToRgb(team.primaryColor)
            doc.setFillColor(tr, tg, tb)
            doc.circle(cx + flagX + FLAG_W / 2, midY, 2.2, 'F')
          }
        } else {
          const [tr, tg, tb] = hexToRgb(team.primaryColor)
          doc.setFillColor(tr, tg, tb)
          doc.circle(cx + flagX + FLAG_W / 2, midY, 2.2, 'F')
        }

        // Nome do time (truncado se necessário)
        doc.setTextColor(...ink)
        doc.setFontSize(6.5)
        doc.setFont('helvetica', 'bold')
        const truncName = (doc.splitTextToSize(team.teamName, nameW) as string[])[0]
        doc.text(truncName, cx + nameX, y + 5.2)

        // Completo ou números
        if (team.missing.length === 0) {
          doc.setTextColor(...green)
          doc.setFontSize(5.5)
          doc.setFont('helvetica', 'bold')
          doc.text('✓ Completo', cx + colW - 1, y + 5.2, { align: 'right' })
        } else {
          const numStr = team.missing.join(' · ')
          const lines = doc.splitTextToSize(numStr, numW) as string[]
          doc.setTextColor(...muted)
          doc.setFontSize(5.5)
          doc.setFont('helvetica', 'normal')
          lines.forEach((line, li) => {
            doc.text(line, cx + colW - 1, y + 5.2 + li * ROW_EXTRA, { align: 'right' })
          })
        }

        // Divisória
        doc.setDrawColor(...divider)
        doc.setLineWidth(0.2)
        doc.line(cx, y + rH, cx + colW, y + rH)

        y += rH
      }

      colY[col] = y + 2.5
    }
  }

  // ── Seções especiais ──────────────────────────────────────────
  const specialY = Math.max(...colY) + 4
  const specW = (contentW - gutter) / 2

  data.specialSections.forEach((section, si) => {
    const sx = margin + si * (specW + gutter)
    const [sr, sg, sb] = hexToRgb(section.color)

    // Header da seção
    const ghH = 5.5
    doc.setFillColor(...blendWithWhite([sr, sg, sb], 0.2))
    doc.rect(sx, specialY, specW, ghH, 'F')
    doc.setFillColor(sr, sg, sb)
    doc.rect(sx, specialY, 2.5, ghH, 'F')
    doc.setTextColor(sr, sg, sb)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'bold')
    doc.text(section.name, sx + 4, specialY + 3.8)

    // Conteúdo
    const contentY = specialY + ghH + 3
    if (section.missing.length === 0) {
      doc.setTextColor(...green)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text('✓ Seção completa', sx + 4, contentY)
    } else {
      const numStr = section.missing.join(' · ')
      const lines = doc.splitTextToSize(numStr, specW - 8) as string[]
      doc.setTextColor(...muted)
      doc.setFontSize(5.5)
      doc.setFont('helvetica', 'normal')
      lines.forEach((line, li) => {
        doc.text(line, sx + 4, contentY + li * ROW_EXTRA)
      })
    }
  })

  // ── Footer ───────────────────────────────────────────────────
  doc.setFillColor(235, 236, 240)
  doc.rect(0, H - 7, W, 7, 'F')
  doc.setTextColor(...muted)
  doc.setFontSize(5.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Álbum Copa 2026', margin, H - 3)
  doc.text(
    `${data.totalProgress.collected}/${data.totalProgress.total} figurinhas coletadas`,
    W - margin, H - 3, { align: 'right' },
  )

  doc.save('faltantes-copa2026.pdf')
}
