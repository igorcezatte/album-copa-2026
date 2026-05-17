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

// ── Helpers ──────────────────────────────────────────────────────

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

// ── Rendering interno (compartilhado entre download e share) ─────

async function renderPdfDoc(data: FullPdfData): Promise<import('jspdf').jsPDF> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // ── Cores ─────────────────────────────────────────────────────
  const W = 210, H = 297, margin = 10, contentW = 190
  const gold:   [number, number, number] = [245, 196, 46]
  const dark:   [number, number, number] = [6, 10, 20]
  const ink:    [number, number, number] = [26, 26, 46]
  const muted:  [number, number, number] = [110, 115, 135]
  const green:  [number, number, number] = [22, 163, 74]
  const divCol: [number, number, number] = [220, 222, 228]

  // ── Dimensões ─────────────────────────────────────────────────
  const gutter  = 3
  const colW    = (contentW - 2 * gutter) / 3   // ~61 mm
  const colXs   = [
    margin,
    margin + colW + gutter,
    margin + 2 * (colW + gutter),
  ]

  const FLAG_W  = 8.5, FLAG_H = 5.5    // bandeira
  const flagGap = 1.5                   // gap entre bandeira e nome
  const nameX   = FLAG_W + flagGap + 1  // offset desde cx até início do nome
  const nameW   = 18                    // largura máx do nome
  const numW    = colW - nameX - nameW - 1.5  // espaço para números (right-aligned)
  const GH      = 5.5                   // altura do cabeçalho de grupo
  const ROW_MIN = 8                     // altura mínima de linha
  const LINE_H  = 3.4                   // altura por linha extra de números
  const MAX_LINES = 2                   // máx linhas de números por time
  const BAND_GAP = 2.5                  // espaço entre bandas

  // Calcula a altura de uma linha dada a quantidade de números
  function teamRowH(missing: string[]): number {
    if (missing.length === 0) return ROW_MIN
    const numStr = missing.join(' · ')
    const lines = doc.splitTextToSize(numStr, numW) as string[]
    const visible = Math.min(lines.length, MAX_LINES)
    return ROW_MIN + (visible - 1) * LINE_H
  }

  // ── Pré-busca de bandeiras ────────────────────────────────────
  const flagCodesArr = Array.from(new Set(
    data.groups.flatMap((g) => g.teams.map((t) => t.flagCode).filter((c): c is string => !!c))
  ))
  const flagCache = new Map<string, string | null>()
  await Promise.all(flagCodesArr.map(async (code) => {
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
    `${data.totalProgress.collected}/${data.totalProgress.total} coletadas  ·  ${data.completedTeams} seleções completas`,
    margin, barY + 4,
  )

  // ── Renderização em bandas ────────────────────────────────────
  //
  // 3 colunas: col0 = grupos [0..3] (A,B,C,D)
  //            col1 = grupos [4..7] (E,F,G,H)
  //            col2 = grupos [8..11] (I,J,K,L)
  //
  // Banda 0 = posição 0 de cada coluna = A, E, I  (todos na mesma faixa Y)
  // Banda 1 = posição 1 de cada coluna = B, F, J
  // ...
  //
  // Dentro de cada banda, o slot 0 (1º time) de cada coluna compartilha
  // a mesma altura de linha, garantindo alinhamento horizontal perfeito.

  const colGroups: FullPdfGroupEntry[][] = [[], [], []]
  data.groups.forEach((g, i) => { colGroups[Math.floor(i / 4)].push(g) })

  const BANDS = 4   // 4 grupos por coluna
  let bandY = barY + 7

  for (let band = 0; band < BANDS; band++) {
    const bandGroups = [colGroups[0][band], colGroups[1][band], colGroups[2][band]]

    // Pre-calcula a altura de cada slot (max entre as 3 colunas)
    const slotHeights: number[] = [0, 1, 2, 3].map((slot) => {
      const heights = bandGroups.map((grp) =>
        grp && grp.teams[slot] ? teamRowH(grp.teams[slot].missing) : ROW_MIN,
      )
      return Math.max(...heights)
    })

    const bandH = GH + slotHeights.reduce((a, b) => a + b, 0)

    // Renderiza cada coluna para esta banda
    for (let col = 0; col < 3; col++) {
      const group = bandGroups[col]
      if (!group) continue

      const cx = colXs[col]
      let y = bandY

      // ── Cabeçalho do grupo ──────────────────────────────────
      const [gr, gg, gb] = hexToRgb(group.color)
      doc.setFillColor(...blendWithWhite([gr, gg, gb], 0.2))
      doc.rect(cx, y, colW, GH, 'F')
      doc.setFillColor(gr, gg, gb)
      doc.rect(cx, y, 2.5, GH, 'F')
      doc.setTextColor(gr, gg, gb)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text(`GRUPO ${group.group}`, cx + 4, y + 3.8)
      y += GH

      // ── Times ────────────────────────────────────────────────
      group.teams.forEach((team, slot) => {
        const rH = slotHeights[slot]
        const midY = y + rH / 2

        // Fundo alternado suave
        if (slot % 2 === 1) {
          doc.setFillColor(248, 249, 251)
          doc.rect(cx, y, colW, rH, 'F')
        }

        // Bandeira ou bolinha
        const flagB64 = flagCache.get(team.flagCode) ?? null
        if (flagB64) {
          try {
            doc.addImage(
              `data:image/png;base64,${flagB64}`, 'PNG',
              cx + 1, midY - FLAG_H / 2, FLAG_W, FLAG_H,
            )
          } catch {
            const [tr, tg, tb] = hexToRgb(team.primaryColor)
            doc.setFillColor(tr, tg, tb)
            doc.circle(cx + 1 + FLAG_W / 2, midY, 2, 'F')
          }
        } else {
          const [tr, tg, tb] = hexToRgb(team.primaryColor)
          doc.setFillColor(tr, tg, tb)
          doc.circle(cx + 1 + FLAG_W / 2, midY, 2, 'F')
        }

        // Nome
        doc.setTextColor(...ink)
        doc.setFontSize(6.5)
        doc.setFont('helvetica', 'bold')
        const truncName = (doc.splitTextToSize(team.teamName, nameW) as string[])[0]
        doc.text(truncName, cx + nameX, midY + 2.2)

        // Completo ou números
        if (team.missing.length === 0) {
          // Bolinha verde + "Completo" logo após o nome (evita char ✓ que corrompe jsPDF)
          const nameEndX = cx + nameX + doc.getTextWidth(truncName)
          doc.setFillColor(...green)
          doc.circle(nameEndX + 2.8, midY + 0.8, 1.4, 'F')
          doc.setTextColor(...green)
          doc.setFontSize(5.5)
          doc.setFont('helvetica', 'bold')
          doc.text('Completo', nameEndX + 5.5, midY + 2.2)
        } else {
          // Números separados por espaço (seguro em todas as codificações)
          const numStr = team.missing.join(' ')
          const allLines = doc.splitTextToSize(numStr, numW) as string[]
          const lines = allLines.slice(0, MAX_LINES)
          if (allLines.length > MAX_LINES) {
            lines[MAX_LINES - 1] = (lines[MAX_LINES - 1] as string).trimEnd() + '...'
          }

          doc.setTextColor(...muted)
          doc.setFontSize(5.5)
          doc.setFont('helvetica', 'normal')

          const textBlockH = lines.length * LINE_H
          const textStartY = midY - textBlockH / 2 + 2.2

          lines.forEach((line, li) => {
            doc.text(line, cx + colW - 1, textStartY + li * LINE_H, { align: 'right' })
          })
        }

        // Divisória na base da linha
        doc.setDrawColor(...divCol)
        doc.setLineWidth(0.15)
        doc.line(cx, y + rH, cx + colW, y + rH)

        y += rH
      })
    }

    bandY += bandH + BAND_GAP
  }

  // ── Seções especiais ──────────────────────────────────────────
  const specY = bandY + 1
  const specW = (contentW - gutter) / 2

  data.specialSections.forEach((section, si) => {
    const sx = margin + si * (specW + gutter)
    const [sr, sg, sb] = hexToRgb(section.color)

    doc.setFillColor(...blendWithWhite([sr, sg, sb], 0.2))
    doc.rect(sx, specY, specW, GH, 'F')
    doc.setFillColor(sr, sg, sb)
    doc.rect(sx, specY, 2.5, GH, 'F')
    doc.setTextColor(sr, sg, sb)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'bold')
    doc.text(section.name, sx + 4, specY + 3.8)

    const contentY = specY + GH + 3

    if (section.missing.length === 0) {
      doc.setFillColor(...green)
      doc.circle(sx + 6, contentY - 1, 1.6, 'F')
      doc.setTextColor(...green)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text('Secao completa', sx + 9.5, contentY)
    } else {
      const numStr = section.missing.join(' ')
      const lines = doc.splitTextToSize(numStr, specW - 8) as string[]
      doc.setTextColor(...muted)
      doc.setFontSize(5.5)
      doc.setFont('helvetica', 'normal')
      lines.forEach((line, li) => {
        doc.text(line, sx + 4, contentY + li * LINE_H)
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

  return doc
}

export async function generateAndDownloadPdf(data: FullPdfData): Promise<void> {
  const doc = await renderPdfDoc(data)
  doc.save('faltantes-copa2026.pdf')
}

export async function generatePdfBlob(data: FullPdfData): Promise<Blob> {
  const doc = await renderPdfDoc(data)
  return doc.output('blob') as Blob
}
