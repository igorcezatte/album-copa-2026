'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAlbumStore } from '@/store/albumStore'
import { useHydrated } from '@/hooks/useHydrated'
import { TEAMS, FWC_SECTION, CC_SECTION } from '@/data/teams'
import { parsePackInput, itemsToCounts } from '@/utils/quickAdd'

interface Props {
  open: boolean
  onClose: () => void
}

// Lookup display name por código
const NAME_BY_CODE: Record<string, string> = (() => {
  const m: Record<string, string> = {}
  for (const t of TEAMS) m[t.code] = t.name
  m['FWC'] = FWC_SECTION.name
  m['CC'] = CC_SECTION.name
  return m
})()

/**
 * Sheet global "Abri um pacote": permite digitar várias figurinhas de times
 * diferentes em um único input livre. Útil quando o usuário abriu um
 * pacotinho com figurinhas espalhadas e quer registrar todas de uma vez.
 */
export function PackAddSheet({ open, onClose }: Props) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const hydrated = useHydrated()
  const stickers = useAlbumStore((s) => s.stickers)
  const addDuplicate = useAlbumStore((s) => s.addDuplicate)

  const result = useMemo(() => parsePackInput(input), [input])
  const counts = useMemo(() => itemsToCounts(result.items), [result.items])

  // Agrupa items por time pra exibição
  const byTeam = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const item of result.items) {
      if (!m.has(item.teamCode)) m.set(item.teamCode, [])
      m.get(item.teamCode)!.push(item.number)
    }
    return m
  }, [result.items])

  // Preview: quantas novas vs repetidas
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
  // Guard de hidratação: igual ao StickerCard/QuickAddSheet
  const canConfirm = total > 0 && hydrated

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (!open) setInput('')
  }, [open])

  if (!open || !mounted) return null

  const handleConfirm = () => {
    if (!canConfirm || !hydrated) return
    counts.forEach((count, id) => {
      for (let i = 0; i < count; i++) addDuplicate(id)
    })
    setInput('')
    onClose()
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="packadd-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        style={{ background: 'var(--copa-card)' }}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-start gap-3 flex-shrink-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-copa-gold/15 flex items-center justify-center text-xl">
            ⚡
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="packadd-title" className="text-base font-black text-white">
              Adicionar rapidamente
            </h2>
            <p className="text-[11px] text-white/40">
              Várias figurinhas de uma vez
            </p>
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
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          <p className="text-[12px] text-white/50 leading-relaxed">
            Digite o nome ou código do time seguido dos números. Pode usar
            código (BRA, MEX), nome em português (Alemanha, Coreia do Sul),
            misturar times e separar por vírgula, espaço ou nova linha.
            Repetir o mesmo número vira repetida.
          </p>

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'Ex: Alemanha 12, BRA 5, 7, 13\nMéxico 8'}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-white/30 font-mono resize-none"
            aria-label="Nomes ou códigos e números das figurinhas"
          />

          {/* Preview agrupado por time */}
          {total > 0 && (
            <div className="rounded-xl bg-copa-gold/5 border border-copa-gold/20 p-3 space-y-2">
              <div className="flex items-baseline justify-between">
                <p className="text-[13px] font-bold text-white">
                  {total} figurinha{total === 1 ? '' : 's'}
                </p>
                <p className="text-[11px] text-white/50">
                  {novas} nova{novas === 1 ? '' : 's'} · {repetidas} rep.
                </p>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {Array.from(byTeam.entries()).map(([code, nums]) => (
                  <div
                    key={code}
                    className="text-[11px] flex items-baseline gap-2"
                  >
                    <span className="font-mono font-bold text-copa-gold w-10 flex-shrink-0">
                      {code}
                    </span>
                    <span className="text-white/60 truncate flex-1">
                      #{nums.join(', #')}
                    </span>
                    <span className="text-white/30 font-mono">
                      ({nums.length})
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-white/30 mt-1 truncate">
                {Array.from(byTeam.keys())
                  .map((c) => NAME_BY_CODE[c] ?? c)
                  .join(' · ')}
              </p>
            </div>
          )}

          {/* Erros */}
          {result.errors.length > 0 && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
              <p className="text-[11px] font-bold text-amber-300 mb-1">
                {result.errors.length === 1
                  ? '1 entrada ignorada'
                  : `${result.errors.length} entradas ignoradas`}
              </p>
              <ul className="text-[10px] text-white/50 space-y-0.5">
                {result.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
                {result.errors.length > 5 && (
                  <li className="text-white/30">
                    +{result.errors.length - 5} outras
                  </li>
                )}
              </ul>
            </div>
          )}

          {total === 0 && result.errors.length === 0 && input.trim() === '' && (
            <div className="rounded-xl bg-white/3 border border-white/5 p-3">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                Exemplos que funcionam
              </p>
              <ul className="text-[11px] text-white/50 space-y-1 font-mono">
                <li>BRA 5, 7, 13</li>
                <li>Alemanha 12, México 8</li>
                <li>coreia do sul 5, fwc 19</li>
                <li>BRA 5, BRA 5 (= 1 repetida)</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex gap-2 border-t border-white/5 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 text-sm font-bold active:scale-95 transition-transform"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 py-3 rounded-xl bg-copa-gold text-black text-sm font-black active:scale-95 transition-all disabled:opacity-30 disabled:bg-white/5 disabled:text-white/30"
          >
            {canConfirm ? `Adicionar ${total}` : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
