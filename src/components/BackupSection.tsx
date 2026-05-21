'use client'

import { useRef, useState } from 'react'
import { useAlbumStore } from '@/store/albumStore'
import { useHydrated } from '@/hooks/useHydrated'
import {
  buildBackup,
  parseBackup,
  backupFileName,
  type BackupFile,
} from '@/utils/backup'
import { saveSnapshot } from '@/utils/localBackup'

type ImportState =
  | { kind: 'idle' }
  | { kind: 'confirm'; backup: BackupFile; incomingCount: number }
  | { kind: 'error'; message: string }
  | { kind: 'done' }

export function BackupSection() {
  const hydrated = useHydrated()
  const stickers = useAlbumStore((s) => s.stickers)
  const replaceStickers = useAlbumStore((s) => s.replaceStickers)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [downloading, setDownloading] = useState(false)
  const [importState, setImportState] = useState<ImportState>({ kind: 'idle' })

  const currentCount = Object.keys(stickers).length

  const handleDownload = () => {
    if (downloading || !hydrated) return
    setDownloading(true)
    try {
      const backup = buildBackup(stickers)
      const json = JSON.stringify(backup, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = backupFileName()
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      // pequeno delay pra dar feedback visual de "baixando…"
      setTimeout(() => setDownloading(false), 400)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite re-selecionar o mesmo arquivo
    if (!file) return

    try {
      const text = await file.text()
      const result = parseBackup(text)
      if (!result.ok) {
        setImportState({ kind: 'error', message: result.error })
        return
      }
      setImportState({
        kind: 'confirm',
        backup: result.backup,
        incomingCount: result.stickerCount,
      })
    } catch {
      setImportState({
        kind: 'error',
        message: 'Não consegui ler o arquivo. Tente outro.',
      })
    }
  }

  const handleConfirmRestore = () => {
    if (importState.kind !== 'confirm') return
    // Snapshot do estado atual antes de sobrescrever com o backup importado
    saveSnapshot(stickers, 'restore-backup')
    replaceStickers(importState.backup.stickers)
    setImportState({ kind: 'done' })
  }

  const handleCancelImport = () => setImportState({ kind: 'idle' })

  return (
    <section className="mb-6">
      <h2 className="text-xs font-display font-bold text-white/40 uppercase tracking-[0.2em] mb-3 flex items-baseline gap-2">
        <span className="font-mono text-white/25" aria-hidden>—</span>
        Backup
      </h2>
      <div
        className="rounded-2xl border border-white/5 overflow-hidden corner-cut corner-cut-sm"
        style={{
          background: 'var(--copa-card)',
          ['--cut-accent' as string]: 'var(--cut-accent-neutral)',
        } as React.CSSProperties}
      >
        {/* Descrição curta */}
        <div className="p-4 border-b border-white/5">
          <p className="text-[11px] text-white/50 leading-relaxed">
            Baixe um arquivo com suas figurinhas e guarde onde quiser (Drive,
            WhatsApp pra você mesmo, etc). Funciona como backup mesmo sem login.
          </p>
        </div>

        {/* Baixar */}
        <button
          onClick={handleDownload}
          disabled={downloading || !hydrated || currentCount === 0}
          className="w-full p-4 text-[11px] font-mono font-bold tracking-widest uppercase text-white text-left active:bg-white/5 transition-colors flex items-center justify-between disabled:opacity-40"
        >
          <span>
            {downloading ? 'Gerando arquivo…' : 'Baixar backup'}
            {hydrated && currentCount > 0 && !downloading && (
              <span className="text-[10px] font-mono font-normal tracking-wider text-white/40 ml-2 normal-case">
                · {currentCount} figurinha{currentCount === 1 ? '' : 's'}
              </span>
            )}
          </span>
          <svg
            className="w-4 h-4 text-white/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
            />
          </svg>
        </button>

        {/* Restaurar */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Selecionar arquivo de backup"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-4 text-[11px] font-mono font-bold tracking-widest uppercase text-white text-left active:bg-white/5 transition-colors flex items-center justify-between border-t border-white/5"
        >
          <span>Restaurar backup…</span>
          <svg
            className="w-4 h-4 text-white/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M17 14l-5-5-5 5M12 9v12"
            />
          </svg>
        </button>

        {/* Estado: confirm */}
        {importState.kind === 'confirm' && (
          <div className="p-4 border-t border-white/5 space-y-3">
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
              <p className="text-[11px] font-mono font-black tracking-widest uppercase text-amber-300 mb-1.5">
                Confirmar restauração
              </p>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Você está prestes a substituir{' '}
                <span className="font-bold text-white">
                  {currentCount} figurinha{currentCount === 1 ? '' : 's'} atual
                  {currentCount === 1 ? '' : 'is'}
                </span>{' '}
                por{' '}
                <span className="font-bold text-white">
                  {importState.incomingCount} figurinha
                  {importState.incomingCount === 1 ? '' : 's'} do backup
                </span>
                .
              </p>
              <p className="text-[10px] font-mono tracking-wider text-white/50 mt-1.5">
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancelImport}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 text-[10px] font-mono font-bold tracking-widest uppercase active:scale-95 transition-transform"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRestore}
                className="flex-1 py-2.5 rounded-xl bg-copa-gold text-black text-[10px] font-mono font-black tracking-widest uppercase active:scale-95 transition-transform"
              >
                Restaurar
              </button>
            </div>
          </div>
        )}

        {/* Estado: erro */}
        {importState.kind === 'error' && (
          <div className="p-4 border-t border-white/5">
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 flex items-start gap-2">
              <svg
                className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-mono font-black tracking-widest uppercase text-red-400">
                  Não foi possível restaurar
                </p>
                <p className="text-[11px] text-white/50 mt-0.5">
                  {importState.message}
                </p>
              </div>
              <button
                onClick={handleCancelImport}
                aria-label="Fechar"
                className="text-white/30 p-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Estado: done */}
        {importState.kind === 'done' && (
          <div className="p-4 border-t border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-copa-green/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-copa-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-display font-bold tracking-wide uppercase text-white">Backup restaurado</p>
              <p className="text-[10px] font-mono tracking-wider text-white/40 mt-0.5">
                Suas figurinhas foram atualizadas
              </p>
            </div>
            <button
              onClick={handleCancelImport}
              className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/40 px-2 py-1"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
