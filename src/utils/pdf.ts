import { GROUP_COLORS } from '@/data/teams'

export interface PdfTeamEntry {
  teamName: string
  missing: string[]
}

export interface PdfGroupEntry {
  group: string
  color: string
  teams: PdfTeamEntry[]
}

export interface PdfData {
  title: string
  generatedAt: string
  totalMissing: number
  groups: PdfGroupEntry[]
}

export interface MissingTeamInput {
  teamName: string
  group: string
  missing: string[]
}

export function buildPdfData(teams: MissingTeamInput[]): PdfData {
  const totalMissing = teams.reduce((sum, t) => sum + t.missing.length, 0)

  const groupMap = new Map<string, PdfTeamEntry[]>()
  for (const team of teams) {
    if (!groupMap.has(team.group)) groupMap.set(team.group, [])
    groupMap.get(team.group)!.push({ teamName: team.teamName, missing: team.missing })
  }

  const groups: PdfGroupEntry[] = Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, groupTeams]) => ({
      group,
      color: GROUP_COLORS[group] ?? '#666666',
      teams: groupTeams,
    }))

  const now = new Date()
  const generatedAt = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return {
    title: 'Álbum Copa 2026 — Lista de Faltantes',
    generatedAt,
    totalMissing,
    groups,
  }
}

export async function generateAndDownloadPdf(data: PdfData): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const W = 210
  const margin = 14
  const colW = W - margin * 2
  let y = 0

  // ── Header ────────────────────────────────────────────────
  doc.setFillColor(6, 10, 20) // #060a14
  doc.rect(0, 0, W, 28, 'F')

  // Gold accent bar
  doc.setFillColor(245, 196, 46) // copa-gold
  doc.rect(0, 0, 4, 28, 'F')

  doc.setTextColor(245, 196, 46)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('ÁLBUM COPA 2026', margin + 4, 12)

  doc.setTextColor(180, 180, 180)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Lista de Figurinhas Faltantes', margin + 4, 18)
  doc.text(`Gerado em ${data.generatedAt}`, margin + 4, 23)

  // Total badge
  doc.setFillColor(245, 196, 46)
  doc.roundedRect(W - margin - 30, 6, 30, 16, 3, 3, 'F')
  doc.setTextColor(6, 10, 20)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(String(data.totalMissing), W - margin - 15, 16, { align: 'center' })
  doc.setFontSize(6)
  doc.setFont('helvetica', 'normal')
  doc.text('faltantes', W - margin - 15, 21, { align: 'center' })

  y = 34

  // ── Groups ────────────────────────────────────────────────
  for (const group of data.groups) {
    // Check page space
    if (y > 270) {
      doc.addPage()
      y = 14
    }

    // Group header
    const hex = group.color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    doc.setFillColor(r, g, b)
    doc.setDrawColor(r, g, b)
    doc.roundedRect(margin, y, colW, 7, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(`GRUPO ${group.group}`, margin + 3, y + 4.8)
    y += 10

    // Teams in group
    for (const team of group.teams) {
      if (y > 275) {
        doc.addPage()
        y = 14
      }

      // Team row background
      doc.setFillColor(240, 242, 246)
      doc.roundedRect(margin, y, colW, 6, 1, 1, 'F')

      // Team name
      doc.setTextColor(20, 20, 40)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      doc.text(team.teamName, margin + 2, y + 4.2)

      // Missing numbers as pill-like text
      const numbersText = team.missing.join('  ')
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 100)
      doc.setFontSize(7)

      const nameWidth = doc.getTextWidth(team.teamName) + 6
      const maxW = colW - nameWidth - 4
      const lines = doc.splitTextToSize(numbersText, maxW)
      doc.text(lines[0] ?? '', margin + nameWidth + 2, y + 4.2)

      y += 7.5
    }

    y += 4
  }

  // ── Footer on each page ───────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(230, 232, 236)
    doc.rect(0, 291, W, 6, 'F')
    doc.setTextColor(120, 120, 140)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.text('Álbum Copa 2026', margin, 295)
    doc.text(`Página ${i} de ${pageCount}`, W - margin, 295, { align: 'right' })
  }

  doc.save('faltantes-copa2026.pdf')
}
