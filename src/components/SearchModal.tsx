'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { searchStickers, type SearchResult } from '@/utils/search'
import { useAlbumStore, stickerId } from '@/store/albumStore'
import { Flag } from './Flag'
import { cn } from '@/lib/utils'

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

function ResultRow({ result, onClose }: { result: SearchResult; onClose: () => void }) {
  const router = useRouter()
  const id = stickerId(result.teamCode, result.sticker.number)
  const collected = useAlbumStore((s) => s.isCollected(id))

  const href =
    result.teamCode === 'FWC' || result.teamCode === 'CC'
      ? `/especial/${result.teamCode.toLowerCase()}`
      : `/selecao/${result.teamCode.toLowerCase()}`

  return (
    <button
      className="w-full flex items-center gap-3 px-4 py-3 active:bg-white/5 transition-colors text-left"
      onClick={() => { router.push(href); onClose() }}
    >
      <Flag code={result.flagCode} size="sm" grayscale={!collected} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-white/40 font-medium">{result.teamName}</p>
        <p className={cn('text-sm font-bold truncate', collected ? 'text-white' : 'text-white/50')}>
          {result.sticker.label}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] font-mono text-white/30">#{result.sticker.number}</span>
        {collected && (
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: result.primaryColor }}
          >
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </button>
  )
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const results = searchStickers(query)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel slides from top */}
      <div
        className="relative z-10 bg-copa-bg border-b border-white/10 flex flex-col max-h-[75vh] mt-0 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <svg className="w-5 h-5 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            placeholder="Buscar jogador, seleção ou número..."
            className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button className="text-white/40 p-1" onClick={() => setQuery('')}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1">
          {!query && (
            <p className="text-center text-white/25 text-sm py-10">
              Digite para buscar figurinhas
            </p>
          )}
          {query && results.length === 0 && (
            <p className="text-center text-white/25 text-sm py-10">
              Nenhuma figurinha encontrada
            </p>
          )}
          {results.map((result) => (
            <ResultRow
              key={`${result.teamCode}_${result.sticker.number}`}
              result={result}
              onClose={onClose}
            />
          ))}
          {results.length === 50 && (
            <p className="text-center text-white/20 text-[10px] py-3">
              Mostrando os primeiros 50 resultados
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
