import {
  saveSnapshot,
  getLastUserId,
  setLastUserId,
  clearLastUserId,
  LAST_USER_ID_KEY,
} from '@/utils/localBackup'
import { listVersions, VERSIONS_KEY } from '@/utils/versions'

describe('localBackup', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('saveSnapshot (shim que delega pra versions.addVersion)', () => {
    it('insere uma entrada na linha do tempo', () => {
      const stickers = { BRA_5: { quantity: 2 }, CC_1: { quantity: 1 } }
      saveSnapshot(stickers, 'sync-replace')

      const versions = listVersions()
      expect(versions).toHaveLength(1)
      expect(versions[0].stickers).toEqual(stickers)
      expect(versions[0].reason).toBe('sync-replace')
      expect(versions[0].size).toBe(2)
    })

    it('não cria entrada se estado está vazio', () => {
      saveSnapshot({}, 'sync-replace')
      expect(localStorage.getItem(VERSIONS_KEY)).toBeNull()
    })

    it('múltiplas razões diferentes acumulam na lista', () => {
      saveSnapshot({ BRA_5: { quantity: 1 } }, 'sync-replace')
      saveSnapshot({ ARG_3: { quantity: 2 } }, 'reset-album')
      const versions = listVersions()
      expect(versions).toHaveLength(2)
      // Mais recente primeiro
      expect(versions[0].reason).toBe('reset-album')
      expect(versions[1].reason).toBe('sync-replace')
    })

    it('falha silenciosamente se localStorage lançar (quota cheia)', () => {
      const original = Storage.prototype.setItem
      Storage.prototype.setItem = jest.fn(() => {
        throw new DOMException('QuotaExceededError')
      })
      try {
        expect(() =>
          saveSnapshot({ BRA_5: { quantity: 1 } }, 'sync-replace')
        ).not.toThrow()
      } finally {
        Storage.prototype.setItem = original
      }
    })
  })

  describe('last user id helpers', () => {
    it('getLastUserId retorna null antes de qualquer set', () => {
      expect(getLastUserId()).toBeNull()
    })

    it('setLastUserId persiste e getLastUserId lê', () => {
      setLastUserId('user-abc')
      expect(getLastUserId()).toBe('user-abc')
      // Verifica usando a chave exposta também
      expect(localStorage.getItem(LAST_USER_ID_KEY)).toBe('user-abc')
    })

    it('setLastUserId sobrescreve valor anterior', () => {
      setLastUserId('user-abc')
      setLastUserId('user-xyz')
      expect(getLastUserId()).toBe('user-xyz')
    })

    it('clearLastUserId remove a marca', () => {
      setLastUserId('user-abc')
      clearLastUserId()
      expect(getLastUserId()).toBeNull()
    })

    it('clearLastUserId não falha quando não há valor', () => {
      expect(() => clearLastUserId()).not.toThrow()
    })

    it('helpers falham silenciosamente se localStorage lançar', () => {
      const original = Storage.prototype.setItem
      Storage.prototype.setItem = jest.fn(() => {
        throw new DOMException('QuotaExceededError')
      })
      try {
        expect(() => setLastUserId('user-abc')).not.toThrow()
      } finally {
        Storage.prototype.setItem = original
      }
    })
  })
})
