'use client'

import Link from 'next/link'
import { useAlbumStore } from '@/store/albumStore'
import { GROUPS, TOTAL_STICKERS } from '@/data/teams'
import { GroupCard } from '@/components/GroupCard'
import { ProgressBar } from '@/components/ProgressBar'
import { pct } from '@/lib/utils'

export default function HomePage() {
  const total = useAlbumStore((s) => s.getTotalProgress())
  const percentage = pct(total.collected, total.total)

  return (
    <div className="px-4 pt-6 animate-fade-in">
      {/* Hero header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
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

        {/* Total progress */}
        <div className="mt-4 rounded-2xl border border-white/5 p-4"
          style={{ background: 'linear-gradient(145deg, #f5c42e18 0%, #0d1424 100%)' }}
        >
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-3xl font-black text-white leading-none">
                {total.collected}
                <span className="text-white/30 text-lg">/{total.total}</span>
              </p>
              <p className="text-xs text-white/40 mt-0.5">figurinhas coletadas</p>
            </div>
            <p className="text-4xl font-black text-copa-gold leading-none">{percentage}%</p>
          </div>
          <ProgressBar
            value={total.collected}
            total={total.total}
            color="#f5c42e"
            height="md"
          />

          {/* Mini stats */}
          <div className="flex gap-4 mt-3">
            <StatPill label="Faltam" value={total.total - total.collected} />
            <StatPill label="Grupos" value="12" />
            <StatPill label="Seleções" value="48" />
          </div>
        </div>
      </div>

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
          <SpecialCard code="FWC" label="Copa History" total={20} />
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
  const progress = useAlbumStore((s) => s.getSectionProgress(code))
  const percentage = pct(progress.collected, progress.total)
  const meta = SPECIAL_META[code] ?? { icon: '⭐', color: '#94a3b8' }

  return (
    <Link href={`/especial/${code.toLowerCase()}`} className="block">
      <div
        className="rounded-2xl p-3.5 border active:scale-95 transition-transform duration-150"
        style={{
          background: `linear-gradient(145deg, ${meta.color}15 0%, #0d1424 100%)`,
          borderColor: percentage === 100 ? `${meta.color}60` : 'rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base leading-none">{meta.icon}</span>
          <span className="text-xs font-bold text-white/70 flex-1 truncate">{label}</span>
          <span className="text-xs font-black" style={{ color: meta.color }}>{percentage}%</span>
        </div>
        <ProgressBar value={progress.collected} total={progress.total} color={meta.color} height="xs" />
        <p className="text-right text-[10px] text-white/20 mt-1 font-mono">
          {progress.collected}/{total}
        </p>
      </div>
    </Link>
  )
}
