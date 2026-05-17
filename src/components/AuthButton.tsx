'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export function AuthButton({ className }: { className?: string }) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className={cn('w-8 h-8 rounded-full bg-white/10 animate-pulse', className)} />
    )
  }

  if (session?.user) {
    return (
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className={cn('flex items-center gap-2 group', className)}
        title={`Sair (${session.user.email})`}
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
