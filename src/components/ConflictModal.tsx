'use client'

import { useState } from 'react'
import { useSyncState, type ConflictResolution } from '@/store/syncState'

export function ConflictModal() {
  const conflict = useSyncState((s) => s.conflict)
  const resolveConflict = useSyncState((s) => s.resolveConflict)
  const [busy, setBusy] = useState<ConflictResolution | null>(null)

  if (!conflict || !resolveConflict) return null

  const { localSize, remoteSize } = conflict

  const handle = async (resolution: ConflictResolution) => {
    if (busy) return
    setBusy(resolution)
    try {
      await resolveConflict(resolution)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflict-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
        style={{ background: 'var(--copa-card)' }}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.74-3l-7-12a2 2 0 00-3.48 0l-7 12A2 2 0 005 19z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2
                id="conflict-title"
                className="text-base font-black text-white"
              >
                Detectamos uma divergência
              </h2>
              <p className="text-[12px] text-white/50 leading-relaxed mt-1">
                As figurinhas deste dispositivo e da sua conta Google não estão
                iguais. Escolha qual versão manter pra evitar perda de dados.
              </p>
            </div>
          </div>
        </div>

        {/* Comparativo */}
        <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-white/5">
          <div className="rounded-2xl bg-white/5 p-3 text-center">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
              Este dispositivo
            </p>
            <p className="text-2xl font-black text-white">{localSize}</p>
            <p className="text-[10px] text-white/40 mt-0.5">figurinhas</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-3 text-center">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
              Conta Google
            </p>
            <p className="text-2xl font-black text-copa-gold">{remoteSize}</p>
            <p className="text-[10px] text-white/40 mt-0.5">figurinhas</p>
          </div>
        </div>

        {/* Ações */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => handle('merge')}
            disabled={!!busy}
            className="w-full p-4 rounded-2xl bg-copa-green text-white font-black text-sm active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-between"
          >
            <span className="flex flex-col items-start">
              <span>Juntar tudo</span>
              <span className="text-[10px] font-bold text-white/70 mt-0.5">
                Mantém o máximo de figurinhas dos dois lados
              </span>
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full font-black">
              {busy === 'merge' ? '…' : 'RECOMENDADO'}
            </span>
          </button>

          <button
            onClick={() => handle('keep-cloud')}
            disabled={!!busy}
            className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 text-left"
          >
            <span className="block">Manter conta Google ({remoteSize})</span>
            <span className="block text-[11px] font-normal text-white/40 mt-0.5">
              Sobrescreve este dispositivo com os dados da sua conta
              {busy === 'keep-cloud' ? ' …' : ''}
            </span>
          </button>

          <button
            onClick={() => handle('keep-local')}
            disabled={!!busy}
            className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 text-left"
          >
            <span className="block">
              Manter este dispositivo ({localSize})
            </span>
            <span className="block text-[11px] font-normal text-white/40 mt-0.5">
              Sobrescreve a conta Google com os dados deste dispositivo
              {busy === 'keep-local' ? ' …' : ''}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
