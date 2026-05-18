import {
  buildBackup,
  parseBackup,
  backupFileName,
  BACKUP_VERSION,
} from '@/utils/backup'

describe('buildBackup', () => {
  it('inclui versão, app e timestamp ISO', () => {
    const fixed = new Date('2026-05-18T22:00:00Z')
    const backup = buildBackup({ BRA_3: { quantity: 2 } }, fixed)
    expect(backup.version).toBe(BACKUP_VERSION)
    expect(backup.app).toBe('copa26')
    expect(backup.exportedAt).toBe('2026-05-18T22:00:00.000Z')
    expect(backup.stickers).toEqual({ BRA_3: { quantity: 2 } })
  })

  it('preserva stickers vazios', () => {
    const backup = buildBackup({})
    expect(backup.stickers).toEqual({})
  })
})

describe('backupFileName', () => {
  it('formata data como YYYY-MM-DD', () => {
    const name = backupFileName(new Date('2026-05-18T10:00:00Z'))
    expect(name).toBe('album-copa-2026-2026-05-18.json')
  })

  it('preenche mês e dia com zero', () => {
    const name = backupFileName(new Date(2026, 0, 7)) // 7 jan 2026
    expect(name).toBe('album-copa-2026-2026-01-07.json')
  })
})

describe('parseBackup', () => {
  const validBackup = JSON.stringify({
    version: 1,
    app: 'copa26',
    exportedAt: '2026-05-18T22:00:00.000Z',
    stickers: {
      BRA_3: { quantity: 2 },
      ARG_5: { quantity: 1 },
      FWC_1: { quantity: 1 },
    },
  })

  it('aceita backup válido', () => {
    const result = parseBackup(validBackup)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.stickerCount).toBe(3)
      expect(result.backup.stickers.BRA_3.quantity).toBe(2)
    }
  })

  it('rejeita JSON inválido', () => {
    const result = parseBackup('{ invalid json }')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/JSON/i)
  })

  it('rejeita arquivo que não é do app', () => {
    const wrong = JSON.stringify({ version: 1, app: 'other', stickers: {} })
    const result = parseBackup(wrong)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/Álbum Copa 2026/i)
  })

  it('rejeita versão futura desconhecida', () => {
    const future = JSON.stringify({
      version: 99,
      app: 'copa26',
      stickers: {},
    })
    const result = parseBackup(future)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/versão/i)
  })

  it('rejeita stickers ausentes', () => {
    const missing = JSON.stringify({ version: 1, app: 'copa26' })
    expect(parseBackup(missing).ok).toBe(false)
  })

  it('rejeita ID de figurinha com formato inválido', () => {
    const bad = JSON.stringify({
      version: 1,
      app: 'copa26',
      stickers: { 'invalid id with spaces': { quantity: 1 } },
    })
    const result = parseBackup(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/inválido/i)
  })

  it('rejeita quantity 0', () => {
    const bad = JSON.stringify({
      version: 1,
      app: 'copa26',
      stickers: { BRA_3: { quantity: 0 } },
    })
    expect(parseBackup(bad).ok).toBe(false)
  })

  it('rejeita quantity negativa', () => {
    const bad = JSON.stringify({
      version: 1,
      app: 'copa26',
      stickers: { BRA_3: { quantity: -1 } },
    })
    expect(parseBackup(bad).ok).toBe(false)
  })

  it('rejeita quantity não inteira', () => {
    const bad = JSON.stringify({
      version: 1,
      app: 'copa26',
      stickers: { BRA_3: { quantity: 1.5 } },
    })
    expect(parseBackup(bad).ok).toBe(false)
  })

  it('rejeita array no lugar de objeto', () => {
    expect(parseBackup('[]').ok).toBe(false)
  })

  it('rejeita arquivo gigante (>1MB) sem tentar parsear', () => {
    const huge = '"x"'.repeat(500000) // ~1.5MB de string
    const result = parseBackup(huge)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/grande/i)
  })

  it('aceita backup com zero figurinhas (álbum zerado)', () => {
    const empty = JSON.stringify({
      version: 1,
      app: 'copa26',
      stickers: {},
    })
    const result = parseBackup(empty)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.stickerCount).toBe(0)
  })

  it('aceita IDs de seções especiais (FWC, CC) e times', () => {
    const ok = JSON.stringify({
      version: 1,
      app: 'copa26',
      stickers: {
        BRA_3: { quantity: 1 },
        FWC_19: { quantity: 1 },
        CC_14: { quantity: 1 },
      },
    })
    expect(parseBackup(ok).ok).toBe(true)
  })
})
