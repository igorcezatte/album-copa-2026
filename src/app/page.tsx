'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAlbumStore } from '@/store/albumStore'
import { GROUPS, TOTAL_STICKERS } from '@/data/teams'
import { GroupCard } from '@/components/GroupCard'
import { ProgressBar } from '@/components/ProgressBar'
import { pct } from '@/lib/utils'
import { AuthButton } from '@/components/AuthButton'
import { SyncBanner } from '@/components/SyncBanner'
import { ExtendedBackupReminder } from '@/components/ExtendedBackupReminder'
import { SoundToggle } from '@/components/SoundToggle'
import { ThemeToggle } from '@/components/ThemeToggle'
import { PackAddSheet } from '@/components/PackAddSheet'
import { useHydrated } from '@/hooks/useHydrated'
import { useShallow } from 'zustand/react/shallow'

export default function HomePage() {
  const hydrated = useHydrated()
  const total = useAlbumStore(useShallow((s) => s.getTotalProgress()))
  const percentage = pct(total.collected, total.total)
  const [packOpen, setPackOpen] = useState(false)

  return (
    <div className="px-4 md:px-6 pt-6 animate-fade-in">
      {/* Hero header */}
      <div className="mb-6">
        {/* Logo + ícones — só em mobile (em desktop o DesktopHeader cobre) */}
        <div className="md:hidden flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 flex items-center justify-center font-display font-black text-base corner-cut corner-cut-sm"
              style={{
                background: 'linear-gradient(135deg, #f5c42e, #d4a017)',
                ['--cut-accent' as string]: 'rgba(0,0,0,0.4)',
              } as React.CSSProperties}
            >
              <span className="text-black tracking-tight">26</span>
            </div>
            <div>
              <h1 className="text-lg font-display font-black text-white leading-none tracking-wide uppercase">Álbum Copa 2026</h1>
              <p className="text-[10px] text-white/40 font-mono tracking-[0.18em] uppercase">FIFA World Cup</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <SoundToggle />
            <Link href="/config" className="w-7 h-7 rounded-xl flex items-center justify-center text-white/35 hover:text-white/60 transition-colors active:scale-90" aria-label="Configurações">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            <AuthButton />
          </div>
        </div>

        {/* Total progress */}
        <div
          className="mt-4 rounded-2xl border border-white/5 p-4 relative overflow-hidden corner-cut corner-cut-lg"
          style={{
            background: 'linear-gradient(145deg, #f5c42e18 0%, var(--copa-card) 100%)',
            ['--cut-accent' as string]: 'rgba(245, 196, 46, 0.55)',
          } as React.CSSProperties}
        >
          {/* Marca d'água sutil "2026" como motif tipográfico */}
          <span
            aria-hidden
            className="absolute -right-2 -bottom-6 font-display font-black text-[120px] leading-none text-white/[0.025] select-none pointer-events-none"
          >
            26
          </span>

          <div className="flex items-end justify-between mb-2 relative">
            <div>
              <p className="text-4xl font-display font-black text-white leading-none tracking-tight animate-count-up">
                {hydrated ? total.collected : '—'}
                <span className="text-white/30 text-xl font-mono font-normal ml-0.5">/{total.total}</span>
              </p>
              <p className="text-[10px] text-white/40 mt-1 font-mono tracking-[0.2em] uppercase">figurinhas coletadas</p>
            </div>
            <p
              className="text-5xl font-display font-black text-copa-gold leading-none tracking-tight animate-count-up"
              style={{ animationDelay: '0.05s' }}
            >
              {hydrated ? `${percentage}` : '—'}
              <span className="text-2xl text-copa-gold/60 ml-0.5">%</span>
            </p>
          </div>
          <ProgressBar
            key={hydrated ? 1 : 0}
            value={total.collected}
            total={total.total}
            color="#f5c42e"
            height="md"
          />

          {/* Mini stats com separadores tipográficos */}
          <div className="flex items-center gap-1 mt-3 relative">
            <StatPill label="Faltam" value={hydrated ? total.total - total.collected : '—'} />
            <span className="font-mono text-white/15 text-xs pb-2" aria-hidden>·</span>
            <StatPill label="Grupos" value="12" />
            <span className="font-mono text-white/15 text-xs pb-2" aria-hidden>·</span>
            <StatPill label="Seleções" value="48" />
          </div>
        </div>
      </div>

      {/* Entrada rápida global — várias figurinhas de uma vez */}
      <button
        onClick={() => setPackOpen(true)}
        className="w-full mb-5 rounded-2xl border border-copa-gold/30 bg-copa-gold/10 px-4 py-3 flex items-center gap-3 active:scale-[0.98] hover:bg-copa-gold/15 transition-all corner-cut corner-cut-md"
        style={{ ['--cut-accent' as string]: 'rgba(245, 196, 46, 0.7)' } as React.CSSProperties}
        aria-label="Adicionar várias figurinhas rapidamente"
      >
        <span className="text-xl">⚡</span>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[13px] font-display font-bold text-white leading-tight tracking-wide uppercase">
            Adicionar rapidamente
          </p>
          <p className="text-[10px] text-white/50 leading-tight mt-0.5">
            Várias figurinhas de uma vez
          </p>
        </div>
        <svg
          className="w-4 h-4 text-copa-gold flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Sync banner — aparece após 5+ figurinhas pra anônimos */}
      <SyncBanner />
      {/* Lembrete estendido — só pra anônimos que dispensaram o banner e tem 30+ */}
      <ExtendedBackupReminder />

      {/* Groups grid */}
      <div className="mb-4">
        <SectionTitle title="Grupos" count="12" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {GROUPS.map((group) => (
            <GroupCard key={group} group={group} />
          ))}
        </div>
      </div>

      {/* Special sections */}
      <div className="mb-4">
        <SectionTitle title="Especiais" count="02" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <SpecialCard code="FWC" label="Copa History" total={19} />
          <SpecialCard code="CC" label="Coca-Cola" total={14} />
        </div>
      </div>

      <PackAddSheet open={packOpen} onClose={() => setPackOpen(false)} />
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-base font-display font-black text-white leading-none tracking-tight">{value}</p>
      <p className="text-[9px] text-white/30 font-mono tracking-widest uppercase mt-0.5">{label}</p>
    </div>
  )
}

function SectionTitle({ title, count }: { title: string; count: string }) {
  return (
    <div className="flex items-end justify-between mb-3 pl-0.5">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[10px] text-white/25 tracking-widest" aria-hidden>—</span>
        <h2 className="text-sm font-display font-bold text-white/70 uppercase tracking-[0.2em]">
          {title}
        </h2>
      </div>
      <span className="font-mono text-[10px] text-white/25 tracking-widest">
        {count} <span className="text-white/15">/ {count}</span>
      </span>
    </div>
  )
}

const SPECIAL_META: Record<string, { icon: string; color: string }> = {
  FWC: { icon: '🏆', color: '#f5c42e' },
  CC:  { icon: '🥤', color: '#e8222a' },
}

function SpecialCard({ code, label, total }: { code: string; label: string; total: number }) {
  const hydrated = useHydrated()
  const rawProgress = useAlbumStore(useShallow((s) => s.getSectionProgress(code)))
  const progress = hydrated ? rawProgress : { collected: 0, total: rawProgress.total }
  const percentage = pct(progress.collected, progress.total)
  const meta = SPECIAL_META[code] ?? { icon: '⭐', color: '#94a3b8' }

  return (
    <Link href={`/especial/${code.toLowerCase()}`} className="block group">
      <div
        className="rounded-2xl p-3.5 border active:scale-95 group-hover:-translate-y-0.5 transition-all duration-200 corner-cut corner-cut-md"
        style={{
          background: `linear-gradient(145deg, ${meta.color}15 0%, var(--copa-card) 100%)`,
          borderColor: percentage === 100 ? `${meta.color}60` : 'rgba(255,255,255,0.05)',
          ['--cut-accent' as string]: `${meta.color}aa`,
        } as React.CSSProperties}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base leading-none">{meta.icon}</span>
          <span className="text-xs font-display font-bold text-white/70 flex-1 truncate uppercase tracking-wide">{label}</span>
          <span className="text-sm font-display font-black tracking-tight" style={{ color: meta.color }}>
            {hydrated ? `${percentage}%` : '—'}
          </span>
        </div>
        <ProgressBar key={hydrated ? 1 : 0} value={progress.collected} total={progress.total} color={meta.color} height="xs" />
        <p className="text-right text-[10px] text-white/20 mt-1 font-mono tracking-wider">
          {hydrated ? `${progress.collected}/${total}` : '—'}
        </p>
      </div>
    </Link>
  )
}
