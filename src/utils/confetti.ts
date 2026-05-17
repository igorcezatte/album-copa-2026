export function shouldTriggerConfetti(
  prevCollected: number,
  nextCollected: number,
  total: number,
): boolean {
  if (total === 0) return false
  return prevCollected < total && nextCollected >= total
}

export async function fireConfetti(): Promise<void> {
  const confetti = (await import('canvas-confetti')).default
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#FFD700', '#009C3B', '#FFFFFF', '#3399FF', '#FF3333'],
  })
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 },
      angle: 60,
      colors: ['#FFD700', '#FFFFFF'],
    })
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 },
      angle: 120,
      colors: ['#FFD700', '#FFFFFF'],
    })
  }, 200)
}
