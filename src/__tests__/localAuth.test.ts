import {
  validateUsername,
  validatePassword,
} from '@/lib/localAuth'

describe('validateUsername', () => {
  it('aceita apelidos válidos', () => {
    expect(validateUsername('joao')).toEqual({
      ok: true,
      normalized: 'joao',
      display: 'joao',
    })
    expect(validateUsername('Joao-Da-Silva')).toEqual({
      ok: true,
      normalized: 'joao-da-silva',
      display: 'Joao-Da-Silva',
    })
    expect(validateUsername('user_123')).toEqual({
      ok: true,
      normalized: 'user_123',
      display: 'user_123',
    })
    expect(validateUsername('a1b')).toMatchObject({ ok: true })
    expect(validateUsername('abcdefghij1234567890')).toMatchObject({ ok: true }) // 20 chars
  })

  it('normaliza pra lowercase mas preserva display', () => {
    const r = validateUsername('JOAO')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.normalized).toBe('joao')
      expect(r.display).toBe('JOAO')
    }
  })

  it('trima espaços no display', () => {
    const r = validateUsername('  joao  ')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.display).toBe('joao')
      expect(r.normalized).toBe('joao')
    }
  })

  it('rejeita curtos demais', () => {
    expect(validateUsername('ab')).toEqual({ ok: false, error: 'too_short' })
    expect(validateUsername('')).toEqual({ ok: false, error: 'too_short' })
  })

  it('rejeita longos demais', () => {
    expect(validateUsername('a'.repeat(21))).toEqual({
      ok: false,
      error: 'too_long',
    })
  })

  it('rejeita chars inválidos', () => {
    expect(validateUsername('joao silva')).toEqual({
      ok: false,
      error: 'invalid_chars',
    })
    expect(validateUsername('joao@gmail')).toEqual({
      ok: false,
      error: 'invalid_chars',
    })
    expect(validateUsername('joão')).toEqual({
      ok: false,
      error: 'invalid_chars',
    })
    expect(validateUsername('joao.silva')).toEqual({
      ok: false,
      error: 'invalid_chars',
    })
  })

  it('rejeita reservados', () => {
    expect(validateUsername('admin')).toEqual({ ok: false, error: 'reserved' })
    expect(validateUsername('ADMIN')).toEqual({ ok: false, error: 'reserved' })
    expect(validateUsername('root')).toEqual({ ok: false, error: 'reserved' })
    expect(validateUsername('panini')).toEqual({ ok: false, error: 'reserved' })
  })
})

describe('validatePassword', () => {
  it('aceita senhas com pelo menos 5 chars', () => {
    expect(validatePassword('abcde')).toEqual({ ok: true })
    expect(validatePassword('1234567890')).toEqual({ ok: true })
    expect(validatePassword('p@ssw0rd!')).toEqual({ ok: true })
  })

  it('rejeita senhas curtas demais', () => {
    expect(validatePassword('')).toEqual({ ok: false, error: 'too_short' })
    expect(validatePassword('1234')).toEqual({ ok: false, error: 'too_short' })
  })

  it('rejeita senhas longas demais (>100)', () => {
    expect(validatePassword('a'.repeat(101))).toEqual({
      ok: false,
      error: 'too_long',
    })
  })

  it('aceita exatamente 5 e 100 chars', () => {
    expect(validatePassword('a'.repeat(5))).toEqual({ ok: true })
    expect(validatePassword('a'.repeat(100))).toEqual({ ok: true })
  })

  it('rejeita inputs não-string', () => {
    // @ts-expect-error testando defesa de runtime
    expect(validatePassword(null)).toEqual({ ok: false, error: 'too_short' })
    // @ts-expect-error testando defesa de runtime
    expect(validatePassword(undefined)).toEqual({ ok: false, error: 'too_short' })
  })
})
