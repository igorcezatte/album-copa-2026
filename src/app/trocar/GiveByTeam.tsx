'use client'

import { useMemo, useState } from 'react'
import { TEAMS, GROUPS, GROUP_COLORS } from '@/data/teams'
import { resolveStickerVisual } from '@/utils/trade'
import { useTradeSession } from '@/store/tradeSessionStore'
import { cn } from '@/lib/utils'
import { readableTextOn, accentOn } from '@/lib/teamColor'
import { Flag } from '@/components/Flag'

interface Dup {
  id: string
  number: string
  available: number
}
interface TeamBucket {
  code: string
  name: string
  flagCode?: string
  color: string
  isSpecial: boolean
  dups: Dup[]
  totalAvailable: number
}

const GROUP_OF: Record<string, string> = Object.fromEntries(TEAMS.map((t) => [t.code, t.group]))

/**
 * Chip de uma figurinha repetida. Toque cicla a quantidade entregue
 * (0 → 1 → … → disponível → 0). Selecionado fica na cor do time.
 */
function GiveChip({ dup, color }: { dup: Dup; color: string }) {
  const count = useTradeSession((s) => s.giving[dup.id] ?? 0)
  const setGiving = useTradeSession((s) => s.setGiving)
  const selected = count > 0
  const multi = dup.available > 1
  // Texto legível sobre o fundo da cor do time (preto da Alemanha → branco).
  const fg = readableTextOn(color)

  return (
    <button
      onClick={() => setGiving(dup.id, count >= dup.available ? 0 : count + 1)}
      className={cn(
        'relative h-9 min-w-[2.75rem] px-2.5 rounded-lg font-mono font-bold text-[12px] tracking-wide tabular-nums transition-all duration-100 active:scale-90 flex items-center justify-center',
        !selected && 'text-white/55',
      )}
      style={
        selected
          ? { background: color, color: fg, boxShadow: `0 1px 8px ${color}55` }
          : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
      }
      aria-label={`Figurinha ${dup.number}${selected ? `, entregando ${count}` : ''}`}
    >
      {dup.number.padStart(2, '0')}
      {multi && (
        <span
          className={cn('ml-1 text-[9px] font-black', selected ? 'opacity-55' : 'text-white/25')}
        >
          {selected ? `×${count}` : `·${dup.available}`}
        </span>
      )}
    </button>
  )
}

/** Uma seleção (ou seção especial) colapsável com seus números repetidos. */
function TeamRow({ bucket, defaultOpen }: { bucket: TeamBucket; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const giving = useTradeSession((s) => s.giving)
  const picked = bucket.dups.reduce((acc, d) => acc + (giving[d.id] ?? 0), 0)

  return (
    <div
      className="rounded-xl border overflow-hidden transition-colors"
      style={{
        borderColor: picked > 0 ? `${bucket.color}55` : 'rgba(255,255,255,0.06)',
        background: 'var(--copa-card)',
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left active:bg-white/[0.03] transition-colors"
      >
        {bucket.flagCode ? (
          <Flag code={bucket.flagCode} size="sm" />
        ) : (
          <span
            className="inline-flex items-center justify-center flex-shrink-0 font-display font-black leading-none"
            style={{
              width: 28,
              height: 20,
              borderRadius: '0 4px 4px 0',
              background: bucket.color,
              color: readableTextOn(bucket.color),
              fontSize: 10,
            }}
          >
            {bucket.code}
          </span>
        )}
        <span className="flex-1 min-w-0 text-[12px] font-display font-bold tracking-wide uppercase text-white/85 truncate">
          {bucket.name}
        </span>

        {picked > 0 ? (
          <span
            className="text-[10px] font-mono font-black tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ background: `${bucket.color}26`, color: accentOn(bucket.color) }}
          >
            {picked} dando
          </span>
        ) : (
          <span className="text-[10px] font-mono tracking-wider text-white/30 whitespace-nowrap">
            {bucket.totalAvailable} rep.
          </span>
        )}
        <svg
          className={cn('w-3.5 h-3.5 text-white/25 transition-transform flex-shrink-0', open && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="flex flex-wrap gap-1.5 px-3 pb-3 pt-0.5">
          {bucket.dups.map((d) => (
            <GiveChip key={d.id} dup={d} color={bucket.color} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Lado ENTREGA reorganizado por **grupo → seleção**. Cada seleção vira uma
 * linha colapsável; as repetidas viram chips de número (toque cicla a qtd).
 * Substitui a grade antiga de um-card-por-figurinha (poluída demais).
 */
export function GiveByTeam({ duplicates }: { duplicates: Array<{ id: string; available: number }> }) {
  const [filter, setFilter] = useState('')

  const byTeam = useMemo(() => {
    const map = new Map<string, TeamBucket>()
    for (const d of duplicates) {
      const v = resolveStickerVisual(d.id)
      let b = map.get(v.teamCode)
      if (!b) {
        b = { code: v.teamCode, name: v.teamName, flagCode: v.flagCode, color: v.color, isSpecial: v.isSpecial, dups: [], totalAvailable: 0 }
        map.set(v.teamCode, b)
      }
      b.dups.push({ id: d.id, number: v.number, available: d.available })
      b.totalAvailable += d.available
    }
    Array.from(map.values()).forEach((b) => b.dups.sort((a, z) => Number(a.number) - Number(z.number)))
    return map
  }, [duplicates])

  const q = filter.trim().toLowerCase()
  const matchesTeam = (b: TeamBucket) =>
    !q || b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || b.dups.some((d) => d.number === q)

  const sections = useMemo(() => {
    const groups = GROUPS.map((letter) => ({
      key: letter,
      label: `Grupo ${letter}`,
      color: GROUP_COLORS[letter],
      teams: TEAMS.filter((t) => t.group === letter && byTeam.has(t.code))
        .map((t) => byTeam.get(t.code)!)
        .filter(matchesTeam),
    })).filter((s) => s.teams.length)

    const specialTeams = ['FWC', 'CC']
      .filter((c) => byTeam.has(c))
      .map((c) => byTeam.get(c)!)
      .filter(matchesTeam)

    if (specialTeams.length) {
      groups.push({ key: 'SPECIAL', label: 'Especiais', color: '#f5c42e', teams: specialTeams })
    }
    return groups
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byTeam, q])

  const teamCount = byTeam.size
  const noResults = sections.length === 0

  return (
    <>
      {teamCount > 4 && (
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrar seleção ou número…"
          className="w-full mb-3 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-mono text-white placeholder-white/25 outline-none focus:border-copa-gold/40"
          style={{ background: 'var(--copa-card)' }}
          autoComplete="off"
        />
      )}

      {noResults ? (
        <p className="text-center text-white/25 text-[11px] font-mono tracking-widest uppercase py-6">Nada com esse filtro</p>
      ) : (
        <div className="flex flex-col gap-4">
          {sections.map((s) => (
            <div key={s.key}>
              <div className="flex items-center gap-2 mb-2 px-0.5">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} aria-hidden />
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-white/40">{s.label}</span>
                <span className="text-[10px] font-mono tracking-wider text-white/20">{s.teams.length}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {s.teams.map((b) => (
                  <TeamRow key={b.code} bucket={b} defaultOpen={!!q} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
