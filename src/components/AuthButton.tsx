'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export function AuthButton({ className }: { className?: string }) {
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  if (status === 'loading') {
    return (
      <div className={cn('w-8 h-8 rounded-full bg-white/10 animate-pulse', className)} />
    )
  }

  if (session?.user) {
    return (
      <>
        <button
          onClick={() => setMenuOpen(true)}
          className={cn('flex items-center gap-2 group', className)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={`Conta de ${session.user.name ?? session.user.email ?? 'usuário'}`}
        >
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? 'Avatar'}
              width={28}
              height={28}
              className="rounded-full ring-2 ring-copa-gold/50 group-active:scale-90 transition-transform"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-copa-gold/20 flex items-center justify-center">
              <span className="text-[11px] font-black text-copa-gold">
                {session.user.name?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
          )}
        </button>

        <AccountMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </>
    )
  }

  return (
    <button
      onClick={() => signIn('google', { callbackUrl: '/' })}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl',
        'bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold',
        'hover:bg-white/10 active:scale-95 transition-all duration-150',
        className,
      )}
    >
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
        <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.908 8.908 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" fill="currentColor"/>
      </svg>
      Entrar
    </button>
  )
}

// ─── Sub-componente: bottom sheet com dados da conta + ações ─────

interface AccountMenuProps {
  open: boolean
  onClose: () => void
}

function AccountMenu({ open, onClose }: AccountMenuProps) {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ESC fecha
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !signingOut) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, signingOut, onClose])

  if (!open || !mounted || !session?.user) return null

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await signOut({ callbackUrl: '/' })
    } finally {
      // signOut redireciona — geralmente nao chega aqui, mas garante reset
      setSigningOut(false)
    }
  }

  const initial = session.user.name?.[0]?.toUpperCase() ?? '?'

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-menu-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !signingOut) onClose()
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
        style={{ background: 'var(--copa-card)' }}
      >
        {/* Header com avatar grande + email */}
        <div className="p-5 border-b border-white/5 flex items-start gap-4">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? 'Avatar'}
              width={56}
              height={56}
              className="rounded-full ring-2 ring-copa-gold/50 flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-copa-gold/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-black text-copa-gold">
                {initial}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2
              id="account-menu-title"
              className="text-base font-black text-white truncate"
            >
              {session.user.name ?? 'Sua conta'}
            </h2>
            {session.user.email && (
              <p className="text-[12px] text-white/50 truncate mt-0.5">
                {session.user.email}
              </p>
            )}
            <p className="inline-block mt-2 text-[10px] font-bold text-copa-green bg-copa-green/10 px-2 py-0.5 rounded-full">
              Sincronizado
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={signingOut}
            aria-label="Fechar"
            className="text-white/30 p-1 active:scale-90 transition-transform disabled:opacity-30 flex-shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Ações */}
        <div className="p-3 space-y-2">
          <Link
            href="/config"
            onClick={onClose}
            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-white/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="block text-[13px] font-bold text-white">
                Configurações
              </span>
              <span className="block text-[11px] text-white/40 leading-tight mt-0.5">
                Backup, histórico e mais
              </span>
            </div>
            <svg
              className="w-4 h-4 text-white/30 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="block text-[13px] font-bold text-red-400">
                {signingOut ? 'Saindo…' : 'Sair da conta'}
              </span>
              <span className="block text-[11px] text-white/40 leading-tight mt-0.5">
                Suas figurinhas continuam neste dispositivo
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
