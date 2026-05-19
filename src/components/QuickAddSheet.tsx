'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useAlbumStore } from '@/store/albumStore'
import {
  parseQuickNumbers,
  itemsToCounts,
  getMaxNumber,
} from '@/utils/quickAdd'

interface Props {
  open: boolean
  onClose: () => void
  teamCode: string
  teamName: string
  accentColor: string
}

/**
 * Sheet de entrada rápida por time. Digita uma lista de números
 * (separados por espaço/vírgula/nova linha) e marca todos de uma vez.
 * Mesmo número repetido vira figurinha repetida.
 */
export function QuickAddSheet({
  open,
  onClose,
  teamCode,
  teamName,
  accentColor,
}: Props) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const stickers = useAlbumStore((s) => s.stickers)
  const addDuplicate = useAlbumStore((s) => s.addDuplicate)

  const max = getMaxNumber(teamCode) ?? 20

  const result = useMemo(
    () => parseQuickNumbers(input, teamCode),
    [input, teamCode]
  )
  const counts = useMemo(() => itemsToCounts(result.items), [result.items])

  // Preview: quantas serão novas (qty 0 → 1) vs repetidas
  let novas = 0
  let repetidas = 0
  counts.forEach((count, id) => {
    const startQty = stickers[id]?.quantity ?? 0
    if (startQty === 0) {
      novas += 1
      repetidas += count - 1
    } else {
      repetidas += count
    }
  })

  const total = result.items.length
  const canConfirm = total > 0

  // Foca o input quando abre
  useEffect(() => {
    if (open) {
      // small delay para garantir que o modal já renderizou
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  // Limpa input ao fechar
  useEffect(() => {
    if (!open) setInput('')
  }, [open])

  if (!open) return null

  const handleConfirm = () => {
    if (!canConfirm) return
    counts.forEach((count, id) => {
      for (let i = 0; i < count; i++) addDuplicate(id)
    })
    setInput('')
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quickadd-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
        style={{ background: 'var(--copa-card)' }}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-start gap-3">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: `${accentColor}20` }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke={accentColor}
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="quickadd-title" className="text-base font-black text-white">
              Adicionar várias
            </h2>
            <p className="text-[11px] text-white/40">{teamName}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-white/30 p-1 active:scale-90 transition-transform"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-[12px] text-white/50 leading-relaxed">
            Digite os números separados por espaço ou vírgula. Repetir o número
            vira figurinha repetida.
          </p>

          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canConfirm) {
                e.preventDefault()
                handleConfirm()
              }
            }}
            placeholder={`Ex: 5, 7, 13, 5 (1-${max})`}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder-white/25 outline-none focus:border-white/30 font-mono tracking-wide"
            aria-label="Números das figurinhas"
          />

          {/* Preview */}
          {total > 0 && (
            <div
              className="rounded-xl p-3"
              style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}30` }}
            >
              <p className="text-[13px] font-bold text-white">
                {total} figurinha{total === 1 ? '' : 's'}
              </p>
              <p className="text-[11px] text-white/50 mt-0.5">
                {novas} nova{novas === 1 ? '' : 's'}
                {' • '}
                {repetidas} repetida{repetidas === 1 ? '' : 's'}
              </p>
            </div>
          )}

          {/* Erros */}
          {result.errors.length > 0 && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
              <p className="text-[11px] font-bold text-amber-300 mb-1">
                {result.errors.length === 1
                  ? '1 número ignorado'
                  : `${result.errors.length} números ignorados`}
              </p>
              <ul className="text-[10px] text-white/50 space-y-0.5">
                {result.errors.slice(0, 4).map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
                {result.errors.length > 4 && (
                  <li className="text-white/30">
                    +{result.errors.length - 4} outros
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex gap-2 border-t border-white/5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 text-sm font-bold active:scale-95 transition-transform"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-black active:scale-95 transition-all disabled:opacity-30"
            style={{
              background: canConfirm ? accentColor : 'rgba(255,255,255,0.05)',
              color: canConfirm ? '#000' : 'rgba(255,255,255,0.3)',
            }}
          >
            {canConfirm
              ? `Adicionar ${total}`
              : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  )
}
