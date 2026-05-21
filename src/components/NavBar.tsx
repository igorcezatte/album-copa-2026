'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SearchModal } from './SearchModal'

const tabs = [
  {
    href: '/',
    label: 'Álbum',
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: '/colecao',
    label: 'Coleção',
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/stats',
    label: 'Stats',
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/sobre',
    label: 'Sobre',
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
]

export function NavBar() {
  const path = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-copa-bg/90 backdrop-blur-xl pb-safe">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto relative">
          {tabs.map((tab) => {
            const active = tab.href === '/' ? path === '/' : path.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-150 relative',
                  active ? 'text-copa-gold' : 'text-white/30 hover:text-white/50',
                )}
              >
                {/* Marker fino no topo da tab ativa — motif do corner-cut linha */}
                {active && (
                  <span
                    aria-hidden
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-copa-gold"
                  />
                )}
                {tab.icon(active)}
                <span className="text-[10px] font-display font-bold tracking-[0.18em] uppercase">{tab.label}</span>
              </Link>
            )
          })}

          {/* Search button */}
          <button
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-150 relative',
              searchOpen ? 'text-copa-gold' : 'text-white/30 hover:text-white/50',
            )}
            onClick={() => setSearchOpen(true)}
            aria-label="Buscar figurinha"
          >
            {searchOpen && (
              <span
                aria-hidden
                className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-copa-gold"
              />
            )}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-[10px] font-display font-bold tracking-[0.18em] uppercase">Buscar</span>
          </button>
        </div>
      </nav>
    </>
  )
}
