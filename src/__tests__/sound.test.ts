import { getSoundEnabled, setSoundEnabled, toggleSound, SOUND_KEY, nextCollectTone } from '@/utils/sound'

beforeEach(() => {
  localStorage.clear()
})

describe('sound preference', () => {
  it('defaults to true when no preference saved', () => {
    expect(getSoundEnabled()).toBe(true)
  })

  it('setSoundEnabled persists to localStorage', () => {
    setSoundEnabled(false)
    expect(localStorage.getItem(SOUND_KEY)).toBe('false')
  })

  it('getSoundEnabled reads from localStorage', () => {
    localStorage.setItem(SOUND_KEY, 'false')
    expect(getSoundEnabled()).toBe(false)
  })

  it('toggleSound flips true → false', () => {
    setSoundEnabled(true)
    toggleSound()
    expect(getSoundEnabled()).toBe(false)
  })

  it('toggleSound flips false → true', () => {
    setSoundEnabled(false)
    toggleSound()
    expect(getSoundEnabled()).toBe(true)
  })
})

describe('nextCollectTone (combo do pop)', () => {
  const fresh = { lastCollectAt: -Infinity, comboCount: 0 }

  it('começa do degrau base quando não há combo prévio', () => {
    const { tone, state } = nextCollectTone(1000, fresh)
    expect(tone.comboCount).toBe(0)
    expect(state.comboCount).toBe(0)
    expect(tone.endFreq).toBeCloseTo(tone.startFreq * 0.5)
  })

  it('sobe o pitch quando coletas vêm dentro da janela', () => {
    const a = nextCollectTone(1000, fresh)
    const b = nextCollectTone(1500, a.state) // 500ms depois → dentro de 1200ms
    expect(b.tone.comboCount).toBe(1)
    expect(b.tone.startFreq).toBeGreaterThan(a.tone.startFreq)
  })

  it('reseta o combo após o gap', () => {
    const a = nextCollectTone(1000, fresh)
    const b = nextCollectTone(1500, a.state)
    const c = nextCollectTone(5000, b.state) // 3.5s depois → fora da janela
    expect(c.tone.comboCount).toBe(0)
    expect(c.tone.startFreq).toBe(a.tone.startFreq)
  })

  it('satura o pitch no topo da escala (não sobe pra sempre)', () => {
    let state = fresh
    let last = 0
    for (let i = 0; i < 20; i++) {
      const r = nextCollectTone(1000 + i * 100, state) // todas dentro da janela
      state = r.state
      last = r.tone.startFreq
    }
    const again = nextCollectTone(1000 + 20 * 100, state)
    expect(again.tone.startFreq).toBe(last) // já no teto
  })

  it('emite sparkle a cada 5 do combo', () => {
    let state = fresh
    const sparkles: boolean[] = []
    for (let i = 0; i < 6; i++) {
      const r = nextCollectTone(1000 + i * 100, state)
      state = r.state
      sparkles.push(r.tone.sparkle)
    }
    // combo: 0,1,2,3,4,5 → sparkle só no índice 5
    expect(sparkles).toEqual([false, false, false, false, false, true])
  })
})
