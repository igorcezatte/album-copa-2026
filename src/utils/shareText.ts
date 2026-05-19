/**
 * Gera texto compartilhável da coleção, formatado pra ler bem em WhatsApp
 * e outros chats. Função pura — fácil de testar.
 */

export interface ShareTextInput {
  collected: number
  total: number
  /** Times com figurinhas faltantes, na ordem que devem aparecer. */
  teamsMissing: Array<{
    teamName: string
    flagEmoji?: string
    missing: string[]
  }>
  /** Seções especiais com faltantes (FWC, CC). */
  specialsMissing: Array<{
    name: string
    icon?: string
    missing: string[]
  }>
  /** Repetidas: { teamName, number, extras (quantidade > 1 — 1 = uma repetida) } */
  duplicates: Array<{
    teamName: string
    number: string
    extras: number
  }>
}

const APP_URL = 'meualbumcopa26.vercel.app'

export function buildShareText(input: ShareTextInput): string {
  const { collected, total, teamsMissing, specialsMissing, duplicates } = input
  const pct = total > 0 ? Math.round((collected / total) * 100) : 0
  const totalMissing =
    teamsMissing.reduce((acc, t) => acc + t.missing.length, 0) +
    specialsMissing.reduce((acc, s) => acc + s.missing.length, 0)
  const totalDuplicates = duplicates.reduce((acc, d) => acc + d.extras, 0)

  const lines: string[] = []

  lines.push('🏆 *Álbum Copa 2026*')
  lines.push(`Minha coleção: ${collected}/${total} (${pct}%)`)
  lines.push('')

  if (totalMissing > 0) {
    lines.push(`❌ *Faltam ${totalMissing}*`)
    for (const t of teamsMissing) {
      if (t.missing.length === 0) continue
      const flag = t.flagEmoji ? `${t.flagEmoji} ` : ''
      lines.push(`• ${flag}${t.teamName}: ${t.missing.join(', ')}`)
    }
    for (const s of specialsMissing) {
      if (s.missing.length === 0) continue
      const icon = s.icon ? `${s.icon} ` : ''
      lines.push(`• ${icon}${s.name}: ${s.missing.join(', ')}`)
    }
    lines.push('')
  } else {
    lines.push('🎉 *Álbum completo!*')
    lines.push('')
  }

  if (totalDuplicates > 0) {
    lines.push(`♻️ *Repetidas ${totalDuplicates}*`)
    for (const d of duplicates) {
      const xLabel = d.extras === 1 ? '' : ` ×${d.extras}`
      lines.push(`• ${d.teamName} #${d.number}${xLabel}`)
    }
    lines.push('')
  }

  lines.push(`📲 ${APP_URL}`)

  return lines.join('\n')
}
