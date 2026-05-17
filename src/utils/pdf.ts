import { GROUP_COLORS } from '@/data/teams'

// ── Tipos v1 (mantidos para compatibilidade) ────────────────────

export interface PdfTeamEntry { teamName: string; missing: string[] }
export interface PdfGroupEntry { group: string; color: string; teams: PdfTeamEntry[] }
export interface PdfData {
  title: string
  generatedAt: string
  totalMissing: number
  groups: PdfGroupEntry[]
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

// ── Tipos v2 (layout de uma página) ─────────────────────────────

export interface FullTeamInput { teamName: string; group: string; primaryColor: string; missing: string[] }
export interface FullSpecialInput { name: string; color: string; missing: string[] }

export interface FullPdfTeamEntry { teamName: string; primaryColor: string; missing: string[] }
export interface FullPdfGroupEntry { group: string; color: string; teams: FullPdfTeamEntry[] }
export interface FullPdfData {
  title: string
  generatedAt: string
  totalMissing: number
  completedTeams: number
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
      teamName: team.teamName,
      primaryColor: team.primaryColor,
      missing: team.missing,
    })
    totalMissing += team.missing.length
    if (team.missing.length === 0) completedTeams++
  }

  const groups: FullPdfGroupEntry[] = Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, groupTeams]) => ({
      group,
      color: GROUP_COLORS[group] ?? '#666666',
      teams: groupTeams,
    }))

  const generatedAt = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return {
    title: 'Álbum Copa 2026',
    generatedAt,
    totalMissing,
    completedTeams,
    totalProgress,
    groups,
    specialSections: specialSections.map((s) => ({ name: s.name, color: s.color, missing: s.missing })),
  }
}

// ── Helpers ──────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '')
  if (c.length !== 6) return [100, 100, 100]
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]
}

// Mistura uma cor com branco para simular opacidade
function blendWithWhite([r, g, b]: [number, number, number], alpha: number): [number, number, number] {
  return [
    Math.round(r * alpha + 255 * (1 - alpha)),
    Math.round(g * alpha + 255 * (1 - alpha)),
    Math.round(b * alpha + 255 * (1 - alpha)),
  ]
}

function linesForNumbers(missing: string[], doc: import('jspdf').jsPDF, availW: number): string[] {
  if (missing.length === 0) return []
  return doc.splitTextToSize(missing.join(' · '), availW) as string[]
}

function rowHeight(lines: string[]): number {
  if (lines.length === 0) return 6.5   // complete team
  return 4.5 + lines.length * 3.2      // name + lines
}

// ── Geração do PDF v2 (uma página) ───────────────────────────────

export async function generateAndDownloadPdf(data: FullPdfData): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const W = 210, H = 297
  const margin = 10
  const contentW = W - margin * 2          // 190mm
  const gold: [number, number, number] = [245, 196, 46]
  const dark: [number, number, number] = [6, 10, 20]
  const ink: [number, number, number] = [26, 26, 46]
  const inkMuted: [number, number, number] = [100, 105, 130]
  const green: [number, number, number] = [34, 197, 94]

  // ── Header ────────────────────────────────────────────────────
  const headerH = 20
  doc.setFillColor(...dark)
  doc.rect(0, 0, W, headerH, 'F')
  doc.setFillColor(...gold)
  doc.rect(0, 0, 4, headerH, 'F')

  // Title
  doc.setTextColor(...gold)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('ÁLBUM COPA 2026', 7, 9)

  // Subtitle + date
  doc.setTextColor(200, 205, 220)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('Lista de Figurinhas Faltantes', 7, 14.5)
  doc.text(`Gerado em ${data.generatedAt}`, 7, 18.5)

  // Stats badge (right)
  const badgeW = 38, badgeH = 14
  doc.setFillColor(...gold)
  doc.roundedRect(W - margin - badgeW, 3, badgeW, badgeH, 2, 2, 'F')
  doc.setTextColor(...dark)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(String(data.totalMissing), W - margin - badgeW / 2, 12, { align: 'center' })
  doc.setFontSize(5.5)
  doc.setFont('helvetica', 'normal')
  doc.text('faltantes', W - margin - badgeW / 2, 15.5, { align: 'center' })

  // Progress bar
  const barY = headerH + 1.5, barH = 2
  doc.setFillColor(40, 50, 70)
  doc.rect(margin, barY, contentW, barH, 'F')
  const pct = data.totalProgress.total > 0
    ? (data.totalProgress.collected / data.totalProgress.total)
    : 0
  doc.setFillColor(...gold)
  doc.rect(margin, barY, contentW * pct, barH, 'F')

  // Progress text
  doc.setTextColor(...inkMuted)
  doc.setFontSize(5.5)
  doc.text(
    `${data.totalProgress.collected}/${data.totalProgress.total} coletadas · ${data.completedTeams} seleções completas`,
    margin, barY + barH + 2.5
  )

  // ── Layout de 3 colunas ────────────────────────────────────────
  const gutter = 3
  const colW = (contentW - 2 * gutter) / 3               // ~61mm
  const colXs = [margin, margin + colW + gutter, margin + 2 * (colW + gutter)]
  const numW = colW - 22                                   // espaço para números
  const nameW = 20                                         // espaço para nome
  const startY = barY + barH + 6

  // Distribui 12 grupos em 3 colunas (4 grupos cada)
  const colGroups: FullPdfGroupEntry[][] = [[], [], []]
  data.groups.forEach((g, i) => { colGroups[Math.floor(i / 4)].push(g) })

  const colY = [startY, startY, startY]

  for (let col = 0; col < 3; col++) {
    const cx = colXs[col]

    for (const group of colGroups[col]) {
      const [gr, gg, gb] = hexToRgb(group.color)
      let y = colY[col]

      // Group header
      const ghH = 5
      doc.setFillColor(...blendWithWhite([gr, gg, gb], 0.18))
      doc.rect(cx, y, colW, ghH, 'F')
      doc.setFillColor(gr, gg, gb)
      doc.rect(cx, y, 2.5, ghH, 'F')
      doc.setTextColor(gr, gg, gb)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text(`GRUPO ${group.group}`, cx + 4.5, y + 3.5)
      y += ghH + 1

      // Teams
      for (const team of group.teams) {
        const [tr, tg, tb] = hexToRgb(team.primaryColor)
        const lines = linesForNumbers(team.missing, doc, numW)
        const rH = rowHeight(lines)

        // Color dot
        doc.setFillColor(tr, tg, tb)
        doc.circle(cx + 3, y + rH / 2, 1.6, 'F')

        // Team name
        doc.setTextColor(...ink)
        doc.setFontSize(6.5)
        doc.setFont('helvetica', 'bold')
        const truncName = doc.splitTextToSize(team.teamName, nameW)[0] as string
        doc.text(truncName, cx + 6.5, y + 4)

        // Complete or numbers
        if (team.missing.length === 0) {
          doc.setTextColor(...green)
          doc.setFontSize(5.5)
          doc.setFont('helvetica', 'bold')
          doc.text('✓ Completo', cx + colW - 1, y + 4, { align: 'right' })
        } else {
          doc.setTextColor(...inkMuted)
          doc.setFontSize(5.5)
          doc.setFont('helvetica', 'normal')
          lines.forEach((line, li) => {
            doc.text(line as string, cx + colW - 1, y + 4 + li * 3.2, { align: 'right' })
          })
        }

        // Thin separator
        doc.setDrawColor(220, 220, 225)
        doc.setLineWidth(0.2)
        doc.line(cx + 0.5, y + rH, cx + colW - 0.5, y + rH)

        y += rH + 0.5
      }

      colY[col] = y + 2
    }
  }

  // ── Seções especiais (abaixo das colunas) ────────────────────
  const specialY = Math.max(...colY) + 3
  const specW = (contentW - gutter) / 2

  data.specialSections.forEach((section, si) => {
    const sx = margin + si * (specW + gutter)
    const [sr, sg, sb] = hexToRgb(section.color)

    // Header
    doc.setFillColor(...blendWithWhite([sr, sg, sb], 0.18))
    doc.rect(sx, specialY, specW, 5, 'F')
    doc.setFillColor(sr, sg, sb)
    doc.rect(sx, specialY, 2.5, 5, 'F')
    doc.setTextColor(sr, sg, sb)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'bold')
    doc.text(section.name, sx + 4.5, specialY + 3.5)

    // Content
    const lines = linesForNumbers(section.missing, doc, specW - 8)
    if (section.missing.length === 0) {
      doc.setTextColor(...green)
      doc.setFontSize(5.5)
      doc.setFont('helvetica', 'bold')
      doc.text('✓ Seção completa', sx + 4.5, specialY + 9)
    } else {
      doc.setTextColor(...inkMuted)
      doc.setFontSize(5.5)
      doc.setFont('helvetica', 'normal')
      lines.forEach((line, li) => {
        doc.text(line as string, sx + 4.5, specialY + 9 + li * 3.2)
      })
    }
  })

  // ── Footer ────────────────────────────────────────────────────
  doc.setFillColor(235, 235, 240)
  doc.rect(0, H - 7, W, 7, 'F')
  doc.setTextColor(...inkMuted)
  doc.setFontSize(5.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Álbum Copa 2026', margin, H - 3)
  doc.text(`${data.totalProgress.collected}/${data.totalProgress.total} figurinhas coletadas`, W - margin, H - 3, { align: 'right' })

  doc.save('faltantes-copa2026.pdf')
}
