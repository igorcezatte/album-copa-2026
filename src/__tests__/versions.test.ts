import {
  addVersion,
  listVersions,
  getVersion,
  removeVersion,
  clearVersions,
  hashStickers,
  diffStickers,
  reasonLabel,
  VERSIONS_KEY,
  VERSIONS_LIMIT,
} from '@/utils/versions'

describe('versions', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('addVersion', () => {
    it('cria versão e a inclui no topo da lista', () => {
      const stickers = { BRA_5: { quantity: 2 } }
      const v = addVersion(stickers, 'auto-daily')
      expect(v).not.toBeNull()
      expect(v!.size).toBe(1)
      expect(v!.reason).toBe('auto-daily')
      expect(listVersions()).toHaveLength(1)
    })

    it('não cria versão pra estado vazio', () => {
      const v = addVersion({}, 'auto-daily')
      expect(v).toBeNull()
      expect(localStorage.getItem(VERSIONS_KEY)).toBeNull()
    })

    it('dedup: não cria se hash idêntico ao último save', () => {
      const stickers = { BRA_5: { quantity: 1 } }
      addVersion(stickers, 'auto-daily')
      const second = addVersion(stickers, 'sync-replace')
      expect(second).toBeNull()
      expect(listVersions()).toHaveLength(1)
    })

    it('aceita salvar de novo se o estado mudou', () => {
      addVersion({ BRA_5: { quantity: 1 } }, 'auto-daily')
      const v2 = addVersion({ BRA_5: { quantity: 2 } }, 'auto-daily')
      expect(v2).not.toBeNull()
      expect(listVersions()).toHaveLength(2)
    })

    it('decimação: mantém apenas as últimas VERSIONS_LIMIT', () => {
      // Cria VERSIONS_LIMIT + 5 versões com estados diferentes pra evitar dedup
      for (let i = 0; i < VERSIONS_LIMIT + 5; i++) {
        addVersion({ [`BRA_${i}`]: { quantity: 1 } }, 'auto-daily')
      }
      const list = listVersions()
      expect(list).toHaveLength(VERSIONS_LIMIT)
      // A mais antiga deve ser a `i = 5` (índice em base 0)
      expect(list[VERSIONS_LIMIT - 1].stickers).toEqual({ BRA_5: { quantity: 1 } })
    })

    it('mais recente fica no topo da lista', () => {
      addVersion({ BRA_5: { quantity: 1 } }, 'auto-daily')
      addVersion({ BRA_6: { quantity: 1 } }, 'sync-replace')
      const list = listVersions()
      expect(list[0].reason).toBe('sync-replace')
      expect(list[1].reason).toBe('auto-daily')
    })

    it('falha silenciosamente se localStorage lançar', () => {
      const original = Storage.prototype.setItem
      Storage.prototype.setItem = jest.fn(() => {
        throw new DOMException('QuotaExceededError')
      })
      try {
        expect(() =>
          addVersion({ BRA_5: { quantity: 1 } }, 'auto-daily')
        ).not.toThrow()
      } finally {
        Storage.prototype.setItem = original
      }
    })
  })

  describe('listVersions', () => {
    it('retorna array vazio quando não há versões', () => {
      expect(listVersions()).toEqual([])
    })

    it('ignora payload corrompido', () => {
      localStorage.setItem(VERSIONS_KEY, 'not-json{{{')
      expect(listVersions()).toEqual([])
    })

    it('ignora entries inválidas', () => {
      localStorage.setItem(
        VERSIONS_KEY,
        JSON.stringify([{ foo: 'bar' }, null, undefined])
      )
      expect(listVersions()).toEqual([])
    })
  })

  describe('getVersion', () => {
    it('encontra versão por id', () => {
      const v = addVersion({ BRA_5: { quantity: 1 } }, 'auto-daily')!
      expect(getVersion(v.id)).toEqual(v)
    })

    it('retorna null pra id inexistente', () => {
      expect(getVersion('does-not-exist')).toBeNull()
    })
  })

  describe('removeVersion', () => {
    it('remove versão específica', () => {
      const v1 = addVersion({ BRA_5: { quantity: 1 } }, 'auto-daily')!
      addVersion({ BRA_6: { quantity: 1 } }, 'auto-daily')
      removeVersion(v1.id)
      const list = listVersions()
      expect(list).toHaveLength(1)
      expect(list[0].stickers).toEqual({ BRA_6: { quantity: 1 } })
    })
  })

  describe('clearVersions', () => {
    it('limpa todas as versões', () => {
      addVersion({ BRA_5: { quantity: 1 } }, 'auto-daily')
      addVersion({ BRA_6: { quantity: 1 } }, 'auto-daily')
      clearVersions()
      expect(listVersions()).toEqual([])
    })

    it('não falha se já estava limpo', () => {
      expect(() => clearVersions()).not.toThrow()
    })
  })

  describe('hashStickers', () => {
    it('produz hash determinístico independente da ordem das chaves', () => {
      const a = { BRA_5: { quantity: 1 }, CC_1: { quantity: 2 } }
      const b = { CC_1: { quantity: 2 }, BRA_5: { quantity: 1 } }
      expect(hashStickers(a)).toBe(hashStickers(b))
    })

    it('hash muda quando quantidade muda', () => {
      const a = { BRA_5: { quantity: 1 } }
      const b = { BRA_5: { quantity: 2 } }
      expect(hashStickers(a)).not.toBe(hashStickers(b))
    })

    it('hash muda quando sticker é adicionado', () => {
      const a = { BRA_5: { quantity: 1 } }
      const b = { BRA_5: { quantity: 1 }, ARG_3: { quantity: 1 } }
      expect(hashStickers(a)).not.toBe(hashStickers(b))
    })

    it('estado vazio tem hash fixo', () => {
      expect(hashStickers({})).toBe(hashStickers({}))
    })
  })

  describe('diffStickers', () => {
    it('detecta adicionados', () => {
      const from = { BRA_5: { quantity: 1 } }
      const to = { BRA_5: { quantity: 1 }, ARG_3: { quantity: 1 } }
      const d = diffStickers(from, to)
      expect(d.added).toEqual([{ id: 'ARG_3', quantity: 1 }])
      expect(d.removed).toEqual([])
      expect(d.changed).toEqual([])
    })

    it('detecta removidos', () => {
      const from = { BRA_5: { quantity: 1 }, ARG_3: { quantity: 1 } }
      const to = { BRA_5: { quantity: 1 } }
      const d = diffStickers(from, to)
      expect(d.added).toEqual([])
      expect(d.removed).toEqual([{ id: 'ARG_3', quantity: 1 }])
      expect(d.changed).toEqual([])
    })

    it('detecta mudanças de quantidade', () => {
      const from = { BRA_5: { quantity: 1 } }
      const to = { BRA_5: { quantity: 3 } }
      const d = diffStickers(from, to)
      expect(d.added).toEqual([])
      expect(d.removed).toEqual([])
      expect(d.changed).toEqual([{ id: 'BRA_5', before: 1, after: 3 }])
    })

    it('estados iguais resultam em diff vazio', () => {
      const s = { BRA_5: { quantity: 1 } }
      const d = diffStickers(s, s)
      expect(d.added).toEqual([])
      expect(d.removed).toEqual([])
      expect(d.changed).toEqual([])
    })
  })

  describe('reasonLabel', () => {
    it('retorna label humano pra cada razão', () => {
      expect(reasonLabel('auto-daily')).toContain('dia')
      expect(reasonLabel('sync-replace')).toContain('sincronizar')
      expect(reasonLabel('reset-album')).toContain('zerar')
      expect(reasonLabel('restore-backup')).toContain('backup')
    })
  })
})
