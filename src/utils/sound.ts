export const SOUND_KEY = 'copa26-sound-enabled'

export function getSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true
  const stored = localStorage.getItem(SOUND_KEY)
  return stored === null ? true : stored === 'true'
}

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem(SOUND_KEY, String(enabled))
}

export function toggleSound(): void {
  setSoundEnabled(!getSoundEnabled())
}

export function playCollectSound(): void {
  if (typeof window === 'undefined') return
  if (!getSoundEnabled()) return

  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    // "Pop" curto e agradável: desce de 700→350 Hz em 120ms
    osc.type = 'sine'
    osc.frequency.setValueAtTime(700, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.12)

    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)

    osc.onended = () => ctx.close()
  } catch {
    // Browser sem suporte a Web Audio — silêncio
  }
}
