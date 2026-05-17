export interface TeamMissing {
  teamName: string
  missing: string[]
}

export function generateShareText(teamsWithMissing: TeamMissing[]): string {
  if (teamsWithMissing.length === 0) {
    return '🏆 Álbum da Copa 2026 completo! Consegui todas as figurinhas!'
  }

  const total = teamsWithMissing.reduce((acc, t) => acc + t.missing.length, 0)
  const lines: string[] = [
    `📒 Álbum Copa 2026 — Preciso de ${total} figurinha${total !== 1 ? 's' : ''}:`,
    '',
  ]

  for (const { teamName, missing } of teamsWithMissing) {
    lines.push(`${teamName}: ${missing.join(', ')}`)
  }

  lines.push('')
  lines.push('Alguém tem repetidas? 🤝')

  return lines.join('\n')
}

export async function shareAlbum(text: string): Promise<boolean> {
  if (navigator.share) {
    await navigator.share({ title: 'Álbum Copa 2026', text })
    return true
  }
  await navigator.clipboard.writeText(text)
  return false
}
