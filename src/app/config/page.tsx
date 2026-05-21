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
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-white/40 text-[11px] font-mono font-bold tracking-widest uppercase mb-4 -ml-1 hover:text-white/60 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </button>
      <p className="text-[10px] text-white/30 font-mono tracking-[0.22em] uppercase">Ajustes</p>
      <h1 className="text-2xl font-display font-black text-white tracking-tight uppercase leading-none mt-0.5">Configurações</h1>
      <p className="text-[11px] text-white/40 font-mono tracking-wider mt-1 mb-7">Conta · álbum · backup · histórico</p>

      {/* Conta */}
      <section className="mb-6">
        <h2 className="text-xs font-display font-bold text-white/40 uppercase tracking-[0.2em] mb-3 flex items-baseline gap-2">
          <span className="font-mono text-white/25" aria-hidden>—</span>
          Conta
        </h2>
        <div
          className="rounded-2xl border border-white/5 overflow-hidden corner-cut corner-cut-sm"
          style={{
            background: 'var(--copa-card)',
            ['--cut-accent' as string]: 'rgba(255, 255, 255, 0.22)',
          } as React.CSSProperties}
        >
          {session?.user ? (
            <>
              <div className="flex items-center gap-3 p-4 border-b border-white/5">
                {session.user.image && (
                  <Image src={session.user.image} alt="Avatar" width={36} height={36} className="rounded-full" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-bold tracking-wide uppercase text-white truncate">{session.user.name}</p>
                  <p className="text-[11px] font-mono text-white/40 truncate mt-0.5">{session.user.email}</p>
                </div>
                <span
                  className="text-[9px] font-mono font-black tracking-widest uppercase px-2 py-1 rounded-full"
                  style={{ background: 'rgba(21, 160, 101, 0.12)', color: 'var(--copa-field)' }}
                >
                  Sync
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full p-4 text-[11px] font-mono font-bold tracking-widest uppercase text-red-400 text-left active:bg-white/5 transition-colors"
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
                <p className="text-sm font-display font-bold tracking-wide uppercase text-white">Entrar com Google</p>
                <p className="text-[10px] font-mono tracking-wider text-white/40 mt-0.5">Sincronize em qualquer dispositivo</p>
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
        <h2 className="text-xs font-display font-bold text-white/40 uppercase tracking-[0.2em] mb-3 flex items-baseline gap-2">
          <span className="font-mono text-white/25" aria-hidden>—</span>
          Álbum
        </h2>
        <div
          className="rounded-2xl border border-white/5 overflow-hidden corner-cut corner-cut-md"
          style={{
            background: 'var(--copa-card)',
            ['--cut-accent' as string]: 'rgba(245, 196, 46, 0.45)',
          } as React.CSSProperties}
        >
          <div className="p-4 border-b border-white/5 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-white/40">Progresso atual</p>
              <p className="text-[11px] font-mono tracking-wider text-white/50 mt-1">
                {hydrated ? `${total.collected} de ${total.total} figurinhas` : '—'}
              </p>
            </div>
            <span className="text-3xl font-display font-black tracking-tight leading-none text-copa-gold">
              {hydrated ? `${pct(total.collected, total.total)}%` : '—'}
            </span>
          </div>
          <Link href="/stats" className="flex items-center justify-between p-4 border-b border-white/5 active:bg-white/5 transition-colors">
            <p className="text-[11px] font-mono font-bold tracking-widest uppercase text-white">Ver estatísticas</p>
            <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Reset */}
          {step === 'idle' && (
            <button
              onClick={() => setStep('confirm')}
              className="w-full p-4 text-[11px] font-mono font-bold tracking-widest uppercase text-red-400 text-left active:bg-white/5 transition-colors"
            >
              Remover todas as figurinhas…
            </button>
          )}

          {step === 'confirm' && (
            <div className="p-4 space-y-3">
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-[11px] font-mono font-black tracking-widest uppercase text-red-400 mb-1">Tem certeza absoluta?</p>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Esta ação apaga <span className="font-bold text-white/70">todas</span> as figurinhas do seu álbum e não pode ser desfeita. Para confirmar, digite exatamente:
                </p>
                <p className="text-[12px] font-mono font-black text-red-400 mt-1.5 tracking-widest">{CONFIRM_PHRASE}</p>
              </div>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="Digite para confirmar…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-red-400/50 font-mono uppercase tracking-wider"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setStep('idle'); setConfirmText('') }}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 text-[10px] font-mono font-bold tracking-widest uppercase active:scale-95 transition-transform"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReset}
                  disabled={!canConfirm || resetting}
                  className="flex-1 py-2.5 rounded-xl text-[10px] font-mono font-black tracking-widest uppercase active:scale-95 transition-all disabled:opacity-30"
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
                <p className="text-sm font-display font-bold tracking-wide uppercase text-white">Álbum zerado</p>
                <p className="text-[10px] font-mono tracking-wider text-white/40 mt-0.5">Pronto para começar do zero</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <BackupSection />

      <HistorySection />

      {/* Sobre */}
      <section>
        <h2 className="text-xs font-display font-bold text-white/40 uppercase tracking-[0.2em] mb-3 flex items-baseline gap-2">
          <span className="font-mono text-white/25" aria-hidden>—</span>
          Sobre
        </h2>
        <div
          className="rounded-2xl border border-white/5 overflow-hidden corner-cut corner-cut-sm"
          style={{
            background: 'var(--copa-card)',
            ['--cut-accent' as string]: 'rgba(255, 255, 255, 0.22)',
          } as React.CSSProperties}
        >
          <Link href="/sobre" className="flex items-center justify-between p-4 active:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-base">☕</span>
              <p className="text-[11px] font-mono font-bold tracking-widest uppercase text-white">Sobre o app e o dev</p>
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
