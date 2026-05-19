import type { Session } from 'next-auth'
import { isAdminEmail, isAdminSession } from '@/lib/admin'

describe('admin whitelist', () => {
  describe('isAdminEmail', () => {
    it('aceita email autorizado', () => {
      expect(isAdminEmail('igorcezatte13@gmail.com')).toBe(true)
    })

    it('case-insensitive', () => {
      expect(isAdminEmail('IgorCezatte13@Gmail.Com')).toBe(true)
    })

    it('rejeita email diferente', () => {
      expect(isAdminEmail('outro@gmail.com')).toBe(false)
    })

    it('rejeita null/undefined/string vazia', () => {
      expect(isAdminEmail(null)).toBe(false)
      expect(isAdminEmail(undefined)).toBe(false)
      expect(isAdminEmail('')).toBe(false)
    })

    it('rejeita email parecido mas diferente', () => {
      expect(isAdminEmail('igorcezatte13@gmail.co')).toBe(false)
      expect(isAdminEmail('igorcezatte13@hotmail.com')).toBe(false)
      expect(isAdminEmail(' igorcezatte13@gmail.com')).toBe(false) // espaço antes
    })
  })

  describe('isAdminSession', () => {
    // Helper pra criar Session sem reclamar do schema estendido
    const session = (user: Partial<Session['user']>): Session =>
      ({ user, expires: 'irrelevante' } as Session)

    it('aceita sessão com email admin', () => {
      expect(isAdminSession(session({ email: 'igorcezatte13@gmail.com' }))).toBe(true)
    })

    it('rejeita sessão sem email', () => {
      expect(isAdminSession(session({ name: 'Igor' }))).toBe(false)
    })

    it('rejeita sessão null/undefined', () => {
      expect(isAdminSession(null)).toBe(false)
      expect(isAdminSession(undefined)).toBe(false)
    })
  })
})
