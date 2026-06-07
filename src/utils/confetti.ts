export function shouldTriggerConfetti(
  prevCollected: number,
  nextCollected: number,
  total: number,
): boolean {
  if (total === 0) return false
  return prevCollected < total && nextCollected >= total
}

const BRAZIL_PALETTE = ['#FFD700', '#009C3B', '#FFFFFF', '#3399FF', '#FF3333']

/**
 * Confete da conquista. Quando recebe uma cor de destaque (cor do time/seção),
 * ela domina a paleta — o confete vira textura do momento desenhado em vez de
 * efeito genérico. Sem cor, mantém a paleta Brasil (retrocompat).
 */
export async function fireConfetti(accent?: string): Promise<void> {
  const confetti = (await import('canvas-confetti')).default
  const palette = accent
    ? [accent, accent, '#FFFFFF', '#FFD700']
    : BRAZIL_PALETTE
  const accentPair = accent ? [accent, '#FFFFFF'] : ['#FFD700', '#FFFFFF']

  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: palette,
  })
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 },
      angle: 60,
      colors: accentPair,
    })
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 },
      angle: 120,
      colors: accentPair,
    })
  }, 200)
}
