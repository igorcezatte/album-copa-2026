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

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return null
  return new AudioCtx()
}

// ── Combo de coleta ────────────────────────────────────────────
// Marcar figurinhas em sequência (abrir um pacote) faz o "pop" subir uma
// escala — recompensa rítmica em vez do mesmo beep 20× seguidas. A regra é
// pura (nextCollectTone) pra ser testável; o áudio em si é side-effect.

const COMBO_WINDOW_MS = 1200
// Escala pentatônica ascendente (Hz) — soa musical conforme o combo sobe.
const COLLECT_LADDER = [660, 740, 880, 990, 1110, 1320, 1480]
const SPARKLE_EVERY = 5

export interface ComboState {
  lastCollectAt: number
  comboCount: number
}

export interface CollectTone {
  startFreq: number
  endFreq: number
  comboCount: number
  sparkle: boolean
}

/**
 * Dado o instante atual e o estado anterior do combo, decide o tom do próximo
 * "pop": sobe a escala enquanto as coletas vierem dentro da janela; reseta no
 * gap. Pura — sem Web Audio, sem Date.now() interno.
 */
export function nextCollectTone(now: number, prev: ComboState): { tone: CollectTone; state: ComboState } {
  const withinWindow = now - prev.lastCollectAt <= COMBO_WINDOW_MS
  const comboCount = withinWindow ? prev.comboCount + 1 : 0
  const idx = Math.min(comboCount, COLLECT_LADDER.length - 1)
  const startFreq = COLLECT_LADDER[idx]
  const sparkle = comboCount > 0 && comboCount % SPARKLE_EVERY === 0
  return {
    tone: { startFreq, endFreq: startFreq * 0.5, comboCount, sparkle },
    state: { lastCollectAt: now, comboCount },
  }
}

let comboState: ComboState = { lastCollectAt: -Infinity, comboCount: 0 }

export function playCollectSound(): void {
  if (typeof window === 'undefined') return
  if (!getSoundEnabled()) return

  const { tone, state } = nextCollectTone(Date.now(), comboState)
  comboState = state

  try {
    const ctx = getAudioCtx()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    // "Pop" curto que desce; a nota inicial sobe a escala conforme o combo.
    osc.type = 'sine'
    osc.frequency.setValueAtTime(tone.startFreq, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(tone.endFreq, ctx.currentTime + 0.12)

    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)

    // Sparkle a cada N do combo: um harmônico agudo e breve por cima.
    if (tone.sparkle) {
      const spark = ctx.createOscillator()
      const sparkGain = ctx.createGain()
      spark.connect(sparkGain)
      sparkGain.connect(ctx.destination)
      spark.type = 'triangle'
      spark.frequency.setValueAtTime(tone.startFreq * 2, ctx.currentTime)
      sparkGain.gain.setValueAtTime(0.08, ctx.currentTime)
      sparkGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
      spark.start(ctx.currentTime)
      spark.stop(ctx.currentTime + 0.18)
    }

    osc.onended = () => ctx.close()
  } catch {
    // Browser sem suporte a Web Audio — silêncio
  }
}

/**
 * Rugido de estádio ao completar um time/seção — substitui a fanfarra genérica.
 * Tudo sintetizado, sem assets: apito de juiz (início) + rugido de torcida
 * (ruído branco filtrado que incha e decai) + corneta (notas ascendentes).
 */
export function playGoalRoar(): void {
  if (typeof window === 'undefined') return
  if (!getSoundEnabled()) return

  try {
    const ctx = getAudioCtx()
    if (!ctx) return
    const t0 = ctx.currentTime

    // 1) Apito do juiz — dá o "pontapé" do momento.
    const whistle = ctx.createOscillator()
    const whistleGain = ctx.createGain()
    whistle.connect(whistleGain)
    whistleGain.connect(ctx.destination)
    whistle.type = 'square'
    whistle.frequency.setValueAtTime(2100, t0)
    whistle.frequency.linearRampToValueAtTime(2400, t0 + 0.12)
    whistleGain.gain.setValueAtTime(0, t0)
    whistleGain.gain.linearRampToValueAtTime(0.06, t0 + 0.02)
    whistleGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16)
    whistle.start(t0)
    whistle.stop(t0 + 0.18)

    // 2) Rugido da torcida — ruído branco filtrado que incha e sustenta.
    const roarStart = t0 + 0.12
    const roarDur = 1.9
    const bufferSize = Math.floor(ctx.sampleRate * roarDur)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.setValueAtTime(500, roarStart)
    lowpass.frequency.linearRampToValueAtTime(1400, roarStart + 0.5)
    lowpass.frequency.linearRampToValueAtTime(700, roarStart + roarDur)

    const roarGain = ctx.createGain()
    roarGain.gain.setValueAtTime(0.0001, roarStart)
    roarGain.gain.linearRampToValueAtTime(0.32, roarStart + 0.45) // swell
    roarGain.gain.setValueAtTime(0.32, roarStart + 1.0) // sustain
    roarGain.gain.exponentialRampToValueAtTime(0.001, roarStart + roarDur)

    noise.connect(lowpass)
    lowpass.connect(roarGain)
    roarGain.connect(ctx.destination)
    noise.start(roarStart)
    noise.stop(roarStart + roarDur)

    // 3) Corneta — fanfarra ascendente por cima do rugido.
    const notes = [523, 659, 784, 1047]
    const noteGap = 0.13
    const hornStart = t0 + 0.18
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      const start = hornStart + i * noteGap
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, start)
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16)
      osc.start(start)
      osc.stop(start + 0.17)
    })

    noise.onended = () => ctx.close()
  } catch {
    // Browser sem suporte a Web Audio — silêncio
  }
}
