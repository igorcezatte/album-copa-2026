'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { TrocarNaHora } from './TrocarNaHora'
import { TrocarCodigo } from './TrocarCodigo'

type Mode = 'nahora' | 'codigo'

function TrocarHub() {
  const params = useSearchParams()
  const hasCode = !!params.get('c')
  // Link compartilhado (?c=) cai direto no modo por código.
  const [mode, setMode] = useState<Mode>(hasCode ? 'codigo' : 'nahora')

  return (
    <div className="px-4 md:px-6 pt-6 animate-fade-in md:max-w-3xl md:mx-auto">
      <Link
        href="/colecao"
        className="md:hidden inline-flex items-center gap-1 text-white/40 text-[11px] font-mono font-bold tracking-widest uppercase mb-4 -ml-1 hover:text-white/60 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Coleção
      </Link>

      <p className="text-[10px] text-white/30 font-mono tracking-[0.22em] uppercase">Trocar figurinhas</p>
      <h1 className="text-2xl font-display font-black text-white tracking-tight uppercase leading-none mt-0.5 mb-4">
        Trocar
      </h1>

      {/* Segmented control */}
      <div className="flex gap-2 mb-5 md:max-w-md">
        {([
          ['nahora', 'Na hora'],
          ['codigo', 'Por código'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setMode(value)}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-xs font-display font-bold tracking-widest uppercase active:scale-95 transition-all',
              mode === value ? 'bg-white text-black' : 'bg-white/5 text-white/50 hover:text-white/70',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'nahora' ? <TrocarNaHora /> : <TrocarCodigo />}
    </div>
  )
}

export default function TrocarPage() {
  return (
    <Suspense fallback={<div className="px-4 pt-6 text-white/40 text-[11px] font-mono uppercase tracking-widest">Carregando…</div>}>
      <TrocarHub />
    </Suspense>
  )
}
