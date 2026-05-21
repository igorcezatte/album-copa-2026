'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SearchModal } from './SearchModal'
import { AuthButton } from './AuthButton'
import { ThemeToggle } from './ThemeToggle'
import { SoundToggle } from './SoundToggle'

/**
 * Header desktop fixo no topo (md+ apenas).
 *
 * Em mobile fica oculto e a `NavBar` (bottom-tabs) assume.
 * Em desktop substitui o header "hero" individual de cada página.
 */
const tabs = [
  { href: '/', label: 'Álbum' },
  { href: '/colecao', label: 'Coleção' },
  { href: '/stats', label: 'Stats' },
  { href: '/sobre', label: 'Sobre' },
]

export function DesktopHeader() {
  const path = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <header className="hidden md:block fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-copa-bg/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto h-16 px-6 flex items-center gap-8">
          {/* Logo + título */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div
              className="w-9 h-9 flex items-center justify-center font-display font-black text-base corner-cut corner-cut-sm group-hover:scale-105 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #f5c42e, #d4a017)',
                ['--cut-accent' as string]: 'rgba(0,0,0,0.4)',
              } as React.CSSProperties}
            >
              <span className="text-black tracking-tight">26</span>
            </div>
            <div className="leading-none">
              <p className="text-base font-display font-black text-white tracking-wide uppercase leading-none">
                Álbum Copa 2026
              </p>
              <p className="text-[10px] text-white/40 font-mono tracking-[0.22em] uppercase mt-1">
                FIFA World Cup
              </p>
            </div>
          </Link>

          {/* Tabs centrais */}
          <nav className="flex items-center gap-1 flex-1 justify-center">
            {tabs.map((tab) => {
              const active = tab.href === '/' ? path === '/' : path.startsWith(tab.href)
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'relative px-4 py-2 text-[11px] font-display font-bold tracking-[0.2em] uppercase transition-colors',
                    active
                      ? 'text-copa-gold'
                      : 'text-white/40 hover:text-white/80',
                  )}
                >
                  {tab.label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-copa-gold"
                    />
                  )}
                </Link>
              )
            })}
            <button
              onClick={() => setSearchOpen(true)}
              className={cn(
                'relative px-4 py-2 text-[11px] font-display font-bold tracking-[0.2em] uppercase transition-colors flex items-center gap-1.5',
                searchOpen ? 'text-copa-gold' : 'text-white/40 hover:text-white/80',
              )}
              aria-label="Buscar figurinha"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </button>
          </nav>

          {/* Ações à direita */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />
            <SoundToggle />
            <Link
              href="/config"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/35 hover:text-white/70 transition-colors active:scale-90"
              aria-label="Configurações"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            <AuthButton />
          </div>
        </div>
      </header>
    </>
  )
}
