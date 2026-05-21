import {
  hit,
  reset,
  _clearAllForTests,
  RATE_LIMIT_MAX_HITS,
  RATE_LIMIT_WINDOW_MS,
} from '@/lib/rateLimit'

describe('rateLimit', () => {
  beforeEach(() => {
    _clearAllForTests()
  })

  it('permite até MAX_HITS dentro da janela', () => {
    const now = 1_000_000
    for (let i = 0; i < RATE_LIMIT_MAX_HITS; i++) {
      const r = hit('user-x', now + i * 100)
      expect(r.allowed).toBe(true)
      expect(r.remaining).toBe(RATE_LIMIT_MAX_HITS - i - 1)
    }
  })

  it('bloqueia a partir do hit MAX_HITS + 1', () => {
    const now = 1_000_000
    for (let i = 0; i < RATE_LIMIT_MAX_HITS; i++) {
      hit('user-y', now)
    }
    const r = hit('user-y', now)
    expect(r.allowed).toBe(false)
    expect(r.remaining).toBe(0)
    expect(r.retryAfterMs).toBeGreaterThan(0)
  })

  it('reseta a janela após RATE_LIMIT_WINDOW_MS', () => {
    const now = 1_000_000
    for (let i = 0; i < RATE_LIMIT_MAX_HITS; i++) {
      hit('user-z', now)
    }
    expect(hit('user-z', now).allowed).toBe(false)

    const later = now + RATE_LIMIT_WINDOW_MS + 1
    const r = hit('user-z', later)
    expect(r.allowed).toBe(true)
    expect(r.remaining).toBe(RATE_LIMIT_MAX_HITS - 1)
  })

  it('chaves diferentes não interferem', () => {
    const now = 1_000_000
    for (let i = 0; i < RATE_LIMIT_MAX_HITS; i++) {
      hit('a', now)
    }
    expect(hit('a', now).allowed).toBe(false)
    expect(hit('b', now).allowed).toBe(true)
  })

  it('reset libera uma chave bloqueada', () => {
    const now = 1_000_000
    for (let i = 0; i < RATE_LIMIT_MAX_HITS; i++) {
      hit('user-reset', now)
    }
    expect(hit('user-reset', now).allowed).toBe(false)
    reset('user-reset')
    expect(hit('user-reset', now).allowed).toBe(true)
  })

  it('retryAfterMs decai com o tempo', () => {
    const start = 1_000_000
    for (let i = 0; i < RATE_LIMIT_MAX_HITS; i++) {
      hit('decay', start)
    }
    const r1 = hit('decay', start)
    const r2 = hit('decay', start + 10_000)
    expect(r1.retryAfterMs).toBeGreaterThan(r2.retryAfterMs)
  })
})
