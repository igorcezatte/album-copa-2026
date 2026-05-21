'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSyncState } from '@/store/syncState'

/**
 * Indicador visual de status do sync. Crítico pra o user perceber quando
 * algo não está salvando — antes desse componente o sync era invisível e
 * usuários perdiam coletas sem saber até logar de novo.
 *
 * Estados:
 * - 'syncing': pequena bolinha laranja girando (só mostra se demora >2s)
 * - 'error': bolinha vermelha + texto, clicável pra reload
 * - 'ok'/'idle': invisível
 * - 'conflict' / 'account-choice': invisível (modais cobrem)
 */
export function SyncStatusIndicator() {
  const { data: session } = useSession()
  const status = useSyncState((s) => s.status)
  const [showSyncing, setShowSyncing] = useState(false)

  // 'syncing' só vira visível se durar mais que 2s — evita flicker em PUTs rápidos
  useEffect(() => {
    if (status !== 'syncing') {
      setShowSyncing(false)
      return
    }
    const t = setTimeout(() => setShowSyncing(true), 2000)
    return () => clearTimeout(t)
  }, [status])

  // Sem usuário logado, sem sync, sem indicador
  if (!session?.user) return null
  if (status === 'ok' || status === 'idle') return null
  if (status === 'conflict' || status === 'account-choice') return null

  if (status === 'syncing') {
    if (!showSyncing) return null
    return (
      <div
        className="fixed top-3 right-3 z-40 flex items-center gap-2 rounded-full bg-black/80 border border-white/10 px-3 py-1.5 backdrop-blur-sm shadow-lg animate-fade-in"
        role="status"
        aria-live="polite"
      >
        <span className="w-2 h-2 rounded-full bg-copa-gold animate-pulse" />
        <span className="text-[11px] font-display font-bold tracking-wider uppercase text-white/70">
          Salvando…
        </span>
      </div>
    )
  }

  // status === 'error'
  return (
    <button
      onClick={() => window.location.reload()}
      className="fixed top-3 right-3 z-40 flex items-center gap-2 rounded-full bg-red-500/15 border border-red-500/40 px-3 py-1.5 backdrop-blur-sm shadow-lg animate-fade-in active:scale-95 transition-transform"
      role="alert"
      aria-label="Erro ao sincronizar. Toque para recarregar."
    >
      <span className="w-2 h-2 rounded-full bg-red-400" />
      <span className="text-[11px] font-display font-black tracking-wider uppercase text-red-300">
        Erro ao salvar · recarregar
      </span>
    </button>
  )
}
