'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useAlbumStore } from '@/store/albumStore'
import { useShallow } from 'zustand/react/shallow'
import {
  shouldShowExtendedReminder,
  getBannerDismissed,
  getExtendedReminderDismissed,
  dismissExtendedReminder,
} from '@/utils/syncBanner'
import { SignInSheet } from './SignInSheet'

/**
 * Lembrete mais visível pro usuário anônimo que já dispensou o banner
 * regular e ainda assim acumulou 30+ figurinhas sem proteção. Aparece uma
 * única vez (dispensável pra sempre) e oferece as duas opções: criar conta
 * ou baixar backup local.
 */
export function ExtendedBackupReminder() {
  const { data: session } = useSession()
  const total = useAlbumStore(useShallow((s) => s.getTotalProgress()))
  const [mounted, setMounted] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [reminderDismissed, setReminderDismissed] = useState(true)
  const [signInOpen, setSignInOpen] = useState(false)

  useEffect(() => {
    setBannerDismissed(getBannerDismissed())
    setReminderDismissed(getExtendedReminderDismissed())
    setMounted(true)
  }, [])

  // Logado: tem sync na nuvem, não precisa do lembrete
  if (session?.user) return null
  if (!mounted) return null
  if (
    !shouldShowExtendedReminder(
      total.collected,
      bannerDismissed,
      reminderDismissed
    )
  ) {
    return null
  }

  const handleDismiss = () => {
    dismissExtendedReminder()
    setReminderDismissed(true)
  }

  return (
    <div
      className="mx-4 mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 animate-fade-in corner-cut corner-cut-md"
      style={{ ['--cut-accent' as string]: 'rgba(252, 211, 77, 0.5)' } as React.CSSProperties}
      role="region"
      aria-label="Lembrete de backup"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-amber-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-7a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-amber-300/80 font-mono tracking-[0.22em] uppercase">Sem backup</p>
          <p className="text-base font-display font-black tracking-tight uppercase text-amber-200 leading-none mt-0.5">
            <span className="text-2xl">{total.collected}</span> figurinhas em risco
          </p>
          <p className="text-[11px] text-white/50 leading-relaxed mt-2">
            Recomendamos uma destas opções pra não perder o progresso se o
            celular travar, limpar dados ou trocar de aparelho:
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setSignInOpen(true)}
          className="w-full py-2.5 rounded-xl bg-copa-gold text-black text-[11px] font-mono font-black tracking-widest uppercase active:scale-[0.98] transition-transform"
        >
          Criar conta grátis
        </button>
        <Link
          href="/config"
          className="block w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-[11px] font-mono font-bold tracking-widest uppercase text-center active:scale-[0.98] transition-transform"
        >
          Baixar backup do álbum
        </Link>
      </div>

      <button
        onClick={handleDismiss}
        className="w-full text-[10px] font-mono font-bold tracking-widest uppercase text-white/30 mt-3 active:text-white/50 transition-colors"
      >
        Não mostrar de novo
      </button>

      <SignInSheet
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        callbackUrl="/"
      />
    </div>
  )
}
