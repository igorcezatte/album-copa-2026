import {
  saveSnapshot,
  readSnapshot,
  clearSnapshot,
  SNAPSHOT_KEY,
} from '@/utils/localBackup'

describe('localBackup', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('saveSnapshot', () => {
    it('escreve estado, timestamp e razão no localStorage', () => {
      const stickers = { BRA_5: { quantity: 2 }, CC_1: { quantity: 1 } }
      saveSnapshot(stickers, 'sync-replace')

      const raw = localStorage.getItem(SNAPSHOT_KEY)
      expect(raw).not.toBeNull()
      const parsed = JSON.parse(raw!)
      expect(parsed.stickers).toEqual(stickers)
      expect(parsed.reason).toBe('sync-replace')
      expect(parsed.size).toBe(2)
      expect(typeof parsed.savedAt).toBe('string')
      expect(new Date(parsed.savedAt).getFullYear()).toBeGreaterThanOrEqual(2024)
    })

    it('não salva snapshot quando o estado atual já está vazio', () => {
      // Estado vazio não tem informação a recuperar — evita poluir o slot
      // sobrescrevendo um snapshot anterior útil com lixo
      saveSnapshot({}, 'sync-replace')
      expect(localStorage.getItem(SNAPSHOT_KEY)).toBeNull()
    })

    it('cada chamada sobrescreve o snapshot anterior', () => {
      saveSnapshot({ BRA_5: { quantity: 1 } }, 'sync-replace')
      saveSnapshot({ ARG_3: { quantity: 2 } }, 'reset-album')
      const snap = readSnapshot()
      expect(snap?.stickers).toEqual({ ARG_3: { quantity: 2 } })
      expect(snap?.reason).toBe('reset-album')
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

  describe('readSnapshot', () => {
    it('retorna null quando não existe snapshot', () => {
      expect(readSnapshot()).toBeNull()
    })

    it('retorna o snapshot escrito previamente', () => {
      const stickers = { BRA_5: { quantity: 3 } }
      saveSnapshot(stickers, 'sync-conflict-keep-cloud')
      const snap = readSnapshot()
      expect(snap?.stickers).toEqual(stickers)
      expect(snap?.reason).toBe('sync-conflict-keep-cloud')
    })

    it('retorna null pra JSON corrompido', () => {
      localStorage.setItem(SNAPSHOT_KEY, 'not-json{{{')
      expect(readSnapshot()).toBeNull()
    })

    it('retorna null pra estrutura inválida (falta de stickers)', () => {
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ savedAt: 'x' }))
      expect(readSnapshot()).toBeNull()
    })
  })

  describe('clearSnapshot', () => {
    it('remove o snapshot do localStorage', () => {
      saveSnapshot({ BRA_5: { quantity: 1 } }, 'sync-replace')
      expect(readSnapshot()).not.toBeNull()
      clearSnapshot()
      expect(readSnapshot()).toBeNull()
    })

    it('não falha se o snapshot já não existir', () => {
      expect(() => clearSnapshot()).not.toThrow()
    })
  })
})
