'use client'

import Link from 'next/link'
import { useAlbumStore } from '@/store/albumStore'
import { GROUPS, TOTAL_STICKERS } from '@/data/teams'
import { GroupCard } from '@/components/GroupCard'
import { ProgressBar } from '@/components/ProgressBar'
import { pct } from '@/lib/utils'
import { AuthButton } from '@/components/AuthButton'
import { SyncBanner } from '@/components/SyncBanner'
import { SoundToggle } from '@/components/SoundToggle'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useHydrated } from '@/hooks/useHydrated'
import { useShallow } from 'zustand/react/shallow'

export default function HomePage() {
  const hydrated = useHydrated()
  const total = useAlbumStore(useShallow((s) => s.getTotalProgress()))
  const percentage = pct(total.collected, total.total)

  return (
    <div className="px-4 pt-6 animate-fade-in">
      {/* Hero header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
              style={{ background: 'linear-gradient(135deg, #f5c42e, #d4a017)' }}
            >
              <span className="text-black">26</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-white leading-none">Álbum Copa 2026</h1>
              <p className="text-[10px] text-white/40 font-medium">FIFA World Cup</p>
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
        <div className="mt-4 rounded-2xl border border-white/5 p-4"
          style={{ background: 'linear-gradient(145deg, #f5c42e18 0%, var(--copa-card) 100%)' }}
        >
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-3xl font-black text-white leading-none">
                {hydrated ? total.collected : '—'}
                <span className="text-white/30 text-lg">/{total.total}</span>
              </p>
              <p className="text-xs text-white/40 mt-0.5">figurinhas coletadas</p>
            </div>
            <p className="text-4xl font-black text-copa-gold leading-none">
              {hydrated ? `${percentage}%` : '—'}
            </p>
          </div>
          <ProgressBar
            key={hydrated ? 1 : 0}
            value={total.collected}
            total={total.total}
            color="#f5c42e"
            height="md"
          />

          {/* Mini stats */}
          <div className="flex gap-4 mt-3">
            <StatPill label="Faltam" value={hydrated ? total.total - total.collected : '—'} />
            <StatPill label="Grupos" value="12" />
            <StatPill label="Seleções" value="48" />
          </div>
        </div>
      </div>

      {/* Sync banner — aparece após 10+ figurinhas, apenas para anônimos */}
      <SyncBanner />

      {/* Groups grid */}
      <div className="mb-4">
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
          Grupos
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {GROUPS.map((group) => (
            <GroupCard key={group} group={group} />
          ))}
        </div>
      </div>

      {/* Special sections */}
      <div className="mb-4">
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
          Especiais
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <SpecialCard code="FWC" label="Copa History" total={19} />
          <SpecialCard code="CC" label="Coca-Cola" total={14} />
        </div>
      </div>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-sm font-black text-white">{value}</p>
      <p className="text-[9px] text-white/30 font-medium">{label}</p>
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
    <Link href={`/especial/${code.toLowerCase()}`} className="block">
      <div
        className="rounded-2xl p-3.5 border active:scale-95 transition-transform duration-150"
        style={{
          background: `linear-gradient(145deg, ${meta.color}15 0%, var(--copa-card) 100%)`,
          borderColor: percentage === 100 ? `${meta.color}60` : 'rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base leading-none">{meta.icon}</span>
          <span className="text-xs font-bold text-white/70 flex-1 truncate">{label}</span>
          <span className="text-xs font-black" style={{ color: meta.color }}>
            {hydrated ? `${percentage}%` : '—'}
          </span>
        </div>
        <ProgressBar key={hydrated ? 1 : 0} value={progress.collected} total={progress.total} color={meta.color} height="xs" />
        <p className="text-right text-[10px] text-white/20 mt-1 font-mono">
          {hydrated ? `${progress.collected}/${total}` : '—'}
        </p>
      </div>
    </Link>
  )
}
