/**
 * Backup local do álbum em arquivo JSON.
 *
 * Permite que usuários sem login (ou logados também) baixem um arquivo
 * com o estado do álbum e restaurem depois — proteção de baixo custo
 * contra perda de dados via localStorage limpo, troca de celular, etc.
 *
 * Funções puras aqui — o disparo de download/leitura de arquivo fica no
 * componente, pra esse módulo ser facilmente testável.
 */

import type { LocalStickers } from './migration'

export const BACKUP_VERSION = 1
export const BACKUP_APP = 'copa26' as const
export const BACKUP_MAX_SIZE = 1024 * 1024 // 1MB — backup real tem ~50KB

export interface BackupFile {
  version: number
  app: typeof BACKUP_APP
  exportedAt: string
  stickers: LocalStickers
}

export function buildBackup(
  stickers: LocalStickers,
  now: Date = new Date()
): BackupFile {
  return {
    version: BACKUP_VERSION,
    app: BACKUP_APP,
    exportedAt: now.toISOString(),
    stickers,
  }
}

export function backupFileName(now: Date = new Date()): string {
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `album-copa-2026-${yyyy}-${mm}-${dd}.json`
}

export type ParseResult =
  | { ok: true; backup: BackupFile; stickerCount: number }
  | { ok: false; error: string }

export function parseBackup(raw: string): ParseResult {
  if (raw.length > BACKUP_MAX_SIZE) {
    return { ok: false, error: 'Arquivo muito grande para ser um backup válido' }
  }

  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'Arquivo não é um JSON válido' }
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, error: 'Formato de backup desconhecido' }
  }

  const obj = data as Record<string, unknown>

  if (obj.app !== BACKUP_APP) {
    return {
      ok: false,
      error: 'Este arquivo não é um backup do Álbum Copa 2026',
    }
  }

  if (typeof obj.version !== 'number' || obj.version > BACKUP_VERSION) {
    return {
      ok: false,
      error: 'Versão do backup não suportada. Atualize o app e tente de novo.',
    }
  }

  if (!obj.stickers || typeof obj.stickers !== 'object' || Array.isArray(obj.stickers)) {
    return { ok: false, error: 'Backup sem figurinhas válidas' }
  }

  const stickers: LocalStickers = {}
  let count = 0
  for (const [id, entry] of Object.entries(obj.stickers)) {
    if (typeof id !== 'string' || !/^[A-Z]+_[A-Z0-9]+$/i.test(id)) {
      return { ok: false, error: `Backup contém ID de figurinha inválido: "${id}"` }
    }
    if (!entry || typeof entry !== 'object') {
      return { ok: false, error: `Backup contém entrada inválida para "${id}"` }
    }
    const qty = (entry as Record<string, unknown>).quantity
    if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1) {
      return { ok: false, error: `Backup contém quantidade inválida para "${id}"` }
    }
    stickers[id] = { quantity: qty }
    count++
  }

  return {
    ok: true,
    backup: {
      version: obj.version,
      app: BACKUP_APP,
      exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : '',
      stickers,
    },
    stickerCount: count,
  }
}
