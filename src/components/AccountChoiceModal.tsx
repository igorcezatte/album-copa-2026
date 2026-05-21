'use client'

import { useState } from 'react'
import {
  useSyncState,
  type AccountChoiceResolution,
} from '@/store/syncState'

/**
 * Modal apresentado no PRIMEIRO sync de uma conta neste browser.
 *
 * Dois modos:
 *  - welcome (caso B): usuário anônimo coletou X figurinhas e está logando
 *    pela primeira vez aqui. Oferecemos vincular ou começar do zero.
 *  - mismatch (caso D): outra conta Google já passou neste browser. Alertamos
 *    pra que dados de outra pessoa não sejam misturados/escritos na nuvem
 *    desta conta. Aqui adicionamos a opção "sair" pra não forçar nenhuma das
 *    ações destrutivas.
 *
 * Nenhuma opção rotula a conta anterior por privacidade — basta sinalizar
 * "outra conta neste dispositivo".
 */
export function AccountChoiceModal() {
  const accountChoice = useSyncState((s) => s.accountChoice)
  const resolveAccountChoice = useSyncState((s) => s.resolveAccountChoice)
  const [busy, setBusy] = useState<AccountChoiceResolution | null>(null)

  if (!accountChoice || !resolveAccountChoice) return null

  const { kind, localSize } = accountChoice
  const isMismatch = kind === 'mismatch'

  const handle = async (resolution: AccountChoiceResolution) => {
    if (busy) return
    setBusy(resolution)
    try {
      await resolveAccountChoice(resolution)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-choice-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
        style={{ background: 'var(--copa-card)' }}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${
                isMismatch ? 'bg-red-500/10' : 'bg-copa-gold/10'
              }`}
            >
              {isMismatch ? (
                <svg
                  className="w-5 h-5 text-red-400"
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
              ) : (
                <svg
                  className="w-5 h-5 text-copa-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] font-mono tracking-[0.22em] uppercase ${isMismatch ? 'text-red-400/70' : 'text-white/30'}`}>
                {isMismatch ? 'Atenção' : 'Bem-vindo'}
              </p>
              <h2
                id="account-choice-title"
                className="text-base font-display font-black text-white tracking-tight uppercase leading-none mt-0.5"
              >
                {isMismatch
                  ? 'Conta diferente detectada'
                  : 'Sua conta está aqui'}
              </h2>
              <p className="text-[12px] text-white/50 leading-relaxed mt-2">
                {isMismatch ? (
                  <>
                    Encontramos{' '}
                    <span className="font-display font-black tracking-tight text-white">
                      {localSize} figurinha{localSize === 1 ? '' : 's'}
                    </span>{' '}
                    neste dispositivo de outra conta Google. Pra evitar misturar
                    coleções, escolha como continuar:
                  </>
                ) : (
                  <>
                    Você já tinha{' '}
                    <span className="font-display font-black tracking-tight text-white">
                      {localSize} figurinha{localSize === 1 ? '' : 's'}
                    </span>{' '}
                    coletadas neste dispositivo. O que deseja fazer com elas?
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="p-4 space-y-2">
          {/* Vincular local → conta (merge) */}
          <button
            onClick={() => handle('link-local')}
            disabled={!!busy}
            className={`w-full p-4 rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-between ${
              isMismatch
                ? 'bg-white/5 border border-white/10 text-left'
                : 'bg-copa-green text-white'
            }`}
          >
            <span className="flex flex-col items-start text-left">
              <span className="text-sm font-display font-black tracking-tight uppercase text-white">
                {isMismatch
                  ? 'Mover essas figurinhas pra esta conta'
                  : 'Vincular figurinhas a esta conta'}
              </span>
              <span
                className={`text-[10px] font-mono font-bold tracking-wider mt-1 ${
                  isMismatch ? 'text-amber-300' : 'text-white/80'
                }`}
              >
                {isMismatch
                  ? '⚠️ Sobrescreve o álbum da nuvem desta conta'
                  : 'Junta o que está aqui ao álbum da conta'}
              </span>
            </span>
            {!isMismatch && (
              <span className="text-[9px] font-mono font-black tracking-widest uppercase bg-white/20 px-2 py-1 rounded-full">
                {busy === 'link-local' ? '…' : 'Recom.'}
              </span>
            )}
          </button>

          {/* Começar do zero / carregar álbum da conta */}
          <button
            onClick={() => handle('start-fresh')}
            disabled={!!busy}
            className={`w-full p-4 rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-50 text-left ${
              isMismatch
                ? 'bg-copa-green text-white'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            <span className="block text-sm font-display font-black tracking-tight uppercase text-white">
              {isMismatch
                ? 'Carregar o álbum desta conta'
                : 'Começar do zero nesta conta'}
            </span>
            <span
              className={`block text-[10px] font-mono tracking-wider mt-1 ${
                isMismatch ? 'text-white/80' : 'text-white/40'
              }`}
            >
              {isMismatch
                ? 'Substitui as figurinhas locais pela coleção da sua conta'
                : 'Descarta as figurinhas locais e usa as da conta (se existirem)'}
              {busy === 'start-fresh' ? ' …' : ''}
            </span>
            {isMismatch && (
              <span className="inline-block mt-2 text-[9px] font-mono font-black tracking-widest uppercase bg-white/20 px-2 py-1 rounded-full">
                {busy === 'start-fresh' ? '…' : 'Recom.'}
              </span>
            )}
          </button>

          {/* Sair (só no mismatch) */}
          {isMismatch && (
            <button
              onClick={() => handle('sign-out')}
              disabled={!!busy}
              className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 text-left active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              <span className="block text-[12px] font-display font-bold tracking-wide uppercase text-white/70">Sair desta conta</span>
              <span className="block text-[10px] font-mono tracking-wider text-white/40 mt-1">
                Volta ao modo anônimo · mantém o local intacto
                {busy === 'sign-out' ? ' …' : ''}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
