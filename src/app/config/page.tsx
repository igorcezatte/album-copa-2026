'use client'

import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAlbumStore } from '@/store/albumStore'
import { pct } from '@/lib/utils'
import { useHydrated } from '@/hooks/useHydrated'
import { useShallow } from 'zustand/react/shallow'
import { BackupSection } from '@/components/BackupSection'
import { HistorySection } from '@/components/HistorySection'
import { saveSnapshot, clearLastUserId } from '@/utils/localBackup'
import { clearVersions } from '@/utils/versions'

const CONFIRM_PHRASE = 'REMOVER TUDO'

export default function ConfigPage() {
  const { data: session } = useSession()
  const hydrated = useHydrated()
  const total = useAlbumStore(useShallow((s) => s.getTotalProgress()))
  const resetAlbum = useAlbumStore((s) => s.resetAlbum)
  const stickersSnapshot = useAlbumStore((s) => s.stickers)
  const router = useRouter()

  const [confirmText, setConfirmText] = useState('')
  const [step, setStep] = useState<'idle' | 'confirm' | 'done'>('idle')
  const [resetting, setResetting] = useState(false)

  const canConfirm = confirmText === CONFIRM_PHRASE

  const handleReset = async () => {
    if (!canConfirm) return
    setResetting(true)

    // Wipe servidor primeiro com force:true (bypass do sanity guard).
    // Ordem importa: se chamássemos resetAlbum() antes, o debounce do useSyncStore
    // dispararia PUT [] sem force e o servidor responderia 409 (catastrophic shrink),
    // abrindo modal de conflito indevidamente.
    if (session?.user?.id) {
      await fetch('/api/stickers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stickers: [], force: true }),
      }).catch(console.error)
    }

    // Limpa marca de "última conta nesse browser" pra que o próximo login
    // siga o caminho "primeira vez" em vez de "mesma conta voltando".
    clearLastUserId()
    // Wipe do histórico antigo + insere snapshot "antes do reset" como ponto
    // único de retorno. Usuario pediu reset total, mas se mudar de ideia em
    // /config → Histórico, consegue voltar.
    clearVersions()
    saveSnapshot(stickersSnapshot, 'reset-album')
    resetAlbum()

    setStep('done')
    setResetting(false)
    setConfirmText('')
  }

  return (
    <div className="px-4 pt-6 pb-8 animate-fade-in max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="text-white/40 active:scale-90 transition-transform"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-black text-white">Configurações</h1>
      </div>

      {/* Conta */}
      <section className="mb-6">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Conta</p>
        <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'var(--copa-card)' }}>
          {session?.user ? (
            <>
              <div className="flex items-center gap-3 p-4 border-b border-white/5">
                {session.user.image && (
                  <Image src={session.user.image} alt="Avatar" width={36} height={36} className="rounded-full" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{session.user.name}</p>
                  <p className="text-[11px] text-white/40 truncate">{session.user.email}</p>
                </div>
                <span className="text-[10px] font-bold text-copa-green bg-copa-green/10 px-2 py-1 rounded-full">Sincronizado</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full p-4 text-sm font-bold text-red-400 text-left active:bg-white/5 transition-colors"
              >
                Sair da conta
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: '/config' })}
              className="w-full flex items-center gap-3 p-4 active:bg-white/5 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
                <svg className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.908 8.908 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-white">Entrar com Google</p>
                <p className="text-[11px] text-white/40">Sincronize em qualquer dispositivo</p>
              </div>
              <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </section>

      {/* Álbum */}
      <section className="mb-6">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Álbum</p>
        <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'var(--copa-card)' }}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Progresso atual</p>
              <p className="text-[11px] text-white/40">
                {hydrated ? `${total.collected} de ${total.total} figurinhas` : '—'}
              </p>
            </div>
            <span className="text-xl font-black text-copa-gold">
              {hydrated ? `${pct(total.collected, total.total)}%` : '—'}
            </span>
          </div>
          <Link href="/stats" className="flex items-center justify-between p-4 border-b border-white/5 active:bg-white/5 transition-colors">
            <p className="text-sm font-bold text-white">Ver estatísticas</p>
            <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Reset */}
          {step === 'idle' && (
            <button
              onClick={() => setStep('confirm')}
              className="w-full p-4 text-sm font-bold text-red-400 text-left active:bg-white/5 transition-colors"
            >
              Remover todas as figurinhas…
            </button>
          )}

          {step === 'confirm' && (
            <div className="p-4 space-y-3">
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-sm font-bold text-red-400 mb-1">Tem certeza absoluta?</p>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Esta ação apaga <span className="font-bold text-white/70">todas</span> as figurinhas do seu álbum e não pode ser desfeita. Para confirmar, digite exatamente:
                </p>
                <p className="text-[11px] font-black text-red-400 mt-1 font-mono">{CONFIRM_PHRASE}</p>
              </div>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="Digite para confirmar…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-red-400/50 font-mono uppercase"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setStep('idle'); setConfirmText('') }}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 text-sm font-bold active:scale-95 transition-transform"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReset}
                  disabled={!canConfirm || resetting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-all disabled:opacity-30"
                  style={{ background: canConfirm ? '#ef4444' : undefined, color: canConfirm ? '#fff' : undefined, border: !canConfirm ? '1px solid rgba(239,68,68,0.3)' : undefined }}
                >
                  {resetting ? 'Removendo…' : 'Remover tudo'}
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-copa-green/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-copa-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Álbum zerado</p>
                <p className="text-[11px] text-white/40">Pronto para começar do zero!</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <BackupSection />

      <HistorySection />

      {/* Sobre */}
      <section>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Sobre</p>
        <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'var(--copa-card)' }}>
          <Link href="/sobre" className="flex items-center justify-between p-4 active:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-base">☕</span>
              <p className="text-sm font-bold text-white">Sobre o app e o desenvolvedor</p>
            </div>
            <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
