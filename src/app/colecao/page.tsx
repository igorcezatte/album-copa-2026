'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAlbumStore, stickerId } from '@/store/albumStore'
import { TEAMS, FWC_SECTION, CC_SECTION, GROUP_COLORS } from '@/data/teams'
import { Flag } from '@/components/Flag'
import { ShareSheet, type ShareFormat } from '@/components/ShareSheet'
import {
  buildFullPdfData,
  generatePdfBlob,
} from '@/utils/pdf'
import { buildShareText, buildTextDuplicates } from '@/utils/shareText'
import { cn } from '@/lib/utils'

type View = 'faltantes' | 'repetidas'

function getStickerInfo(id: string) {
  const [teamCode, ...numParts] = id.split('_')
  const number = numParts.join('_')
  const team = TEAMS.find((t) => t.code === teamCode)
  const sticker = team?.stickers.find((s) => s.number === number)
  return { team, sticker, number, teamCode }
}

// Web Share com fallback pra download.
// Pra texto: tenta share via Web Share API; senão, copia pra clipboard.
async function shareFileOrDownload(file: File, title: string): Promise<void> {
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ title, files: [file] })
    return
  }
  // fallback: download
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function shareTextOrCopy(text: string, title: string): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text })
      return
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      // segue pra clipboard fallback
    }
  }
  await navigator.clipboard.writeText(text)
}

export default function ColecaoPage() {
  const getMissing = useAlbumStore((s) => s.getMissing)
  const isCollected = useAlbumStore((s) => s.isCollected)
  const getTotalProgress = useAlbumStore((s) => s.getTotalProgress)
  const getDuplicatesFn = useAlbumStore((s) => s.getDuplicates)
  const duplicates = useAlbumStore((s) => s.getDuplicates())
  const addDuplicate = useAlbumStore((s) => s.addDuplicate)
  const removeDuplicate = useAlbumStore((s) => s.removeDuplicate)

  const [view, setView] = useState<View>('faltantes')
  const [shareOpen, setShareOpen] = useState(false)

  // Computa faltantes
  const teamsWithMissing = TEAMS.map((team) => ({
    team,
    missing: getMissing(team.code),
  })).filter((t) => t.missing.length > 0)
  const totalMissing = teamsWithMissing.reduce(
    (acc, t) => acc + t.missing.length,
    0
  )

  // Repetidas: quantidade total = soma dos extras
  const totalDuplicates = duplicates.reduce((acc, d) => acc + d.quantity, 0)

  const hasContent = totalMissing > 0 || duplicates.length > 0

  const totalProgress = getTotalProgress()

  const buildPdfDataInputs = () => {
    const allTeams = TEAMS.map((team) => ({
      teamName: team.name,
      group: team.group,
      primaryColor: team.primaryColor,
      flagCode: team.flagCode,
      missing: getMissing(team.code),
    }))
    const specials = [
      {
        name: 'Copa History (FWC)',
        color: '#f5c42e',
        missing: FWC_SECTION.stickers
          .filter((s) => !isCollected(stickerId('FWC', s.number)))
          .map((s) => s.number),
      },
      {
        name: 'Coca-Cola (CC)',
        color: '#e8222a',
        missing: CC_SECTION.stickers
          .filter((s) => !isCollected(stickerId('CC', s.number)))
          .map((s) => s.number),
      },
    ]
    return buildFullPdfData(allTeams, specials, getTotalProgress(), getDuplicatesFn())
  }

  const handleShare = async (format: ShareFormat): Promise<void> => {
    try {
      if (format === 'text') {
        // Resolve teamName/label preservando FWC/CC (bug: antes esses caiam no
        // filtro `if (!info.team)` e somiam do total)
        const textDupes = buildTextDuplicates(duplicates, (teamCode, number) => {
          const team = TEAMS.find((t) => t.code === teamCode)
          if (team) return { teamName: team.name, label: number }
          if (teamCode === 'FWC') return { teamName: 'Copa History', label: `FWC${number}` }
          if (teamCode === 'CC') return { teamName: 'Coca-Cola', label: `CC${number}` }
          return null
        })

        const teamsMissing = TEAMS
          .map((t) => ({ teamName: t.name, missing: getMissing(t.code) }))
          .filter((t) => t.missing.length > 0)
        const specialsMissing = [
          {
            name: 'Copa History (FWC)',
            missing: FWC_SECTION.stickers
              .filter((s) => !isCollected(stickerId('FWC', s.number)))
              .map((s) => s.number),
          },
          {
            name: 'Coca-Cola (CC)',
            missing: CC_SECTION.stickers
              .filter((s) => !isCollected(stickerId('CC', s.number)))
              .map((s) => s.number),
          },
        ].filter((s) => s.missing.length > 0)

        const text = buildShareText({
          collected: totalProgress.collected,
          total: totalProgress.total,
          teamsMissing,
          specialsMissing,
          duplicates: textDupes,
        })
        await shareTextOrCopy(text, 'Álbum Copa 2026 — Minha coleção')
        return
      }

      if (format === 'pdf') {
        const blob = await generatePdfBlob(buildPdfDataInputs())
        const file = new File([blob], 'colecao-copa2026.pdf', {
          type: 'application/pdf',
        })
        await shareFileOrDownload(file, 'Álbum Copa 2026 — Minha coleção')
        return
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') console.error(err)
    }
  }

  return (
    <div className="px-4 md:px-6 pt-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="min-w-0">
          <h1 className="text-xl font-display font-black text-white tracking-wide uppercase">Minha coleção</h1>
          <p className="text-[11px] text-white/40 mt-1 font-mono tracking-wider">
            {totalMissing} faltando · {totalDuplicates} repetida
            {totalDuplicates !== 1 ? 's' : ''}
          </p>
        </div>

        {hasContent && (
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-copa-gold/10 text-copa-gold text-[11px] font-display font-bold tracking-widest uppercase active:scale-95 transition-transform flex-shrink-0"
            aria-label="Compartilhar coleção"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Compartilhar
          </button>
        )}
      </div>

      {/* Pill switcher */}
      <div className="flex gap-2 mt-4 mb-5 md:max-w-md">
        <button
          onClick={() => setView('faltantes')}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-xs font-display font-bold tracking-widest uppercase active:scale-95 transition-all flex items-center justify-center gap-1.5',
            view === 'faltantes'
              ? 'bg-white text-black'
              : 'bg-white/5 text-white/50 hover:text-white/70'
          )}
        >
          Faltantes
          <span
            className={cn(
              'text-[10px] font-display font-black tracking-tight rounded-full px-1.5 py-0.5',
              view === 'faltantes'
                ? 'bg-black/10 text-black'
                : 'bg-white/10 text-white/60'
            )}
          >
            {totalMissing}
          </span>
        </button>
        <button
          onClick={() => setView('repetidas')}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-xs font-display font-bold tracking-widest uppercase active:scale-95 transition-all flex items-center justify-center gap-1.5',
            view === 'repetidas'
              ? 'bg-white text-black'
              : 'bg-white/5 text-white/50 hover:text-white/70'
          )}
        >
          Repetidas
          <span
            className={cn(
              'text-[10px] font-display font-black tracking-tight rounded-full px-1.5 py-0.5',
              view === 'repetidas'
                ? 'bg-black/10 text-black'
                : 'bg-white/10 text-white/60'
            )}
          >
            {totalDuplicates}
          </span>
        </button>
      </div>

      {/* Content por view */}
      {view === 'faltantes' && (
        <FaltantesView teamsWithMissing={teamsWithMissing} totalMissing={totalMissing} />
      )}

      {view === 'repetidas' && (
        <RepetidasView
          duplicates={duplicates}
          addDuplicate={addDuplicate}
          removeDuplicate={removeDuplicate}
        />
      )}

      {/* ShareSheet — abre com 3 opções de formato */}
      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        onShare={handleShare}
      />

    </div>
  )
}

// ─── Sub-views ──────────────────────────────────────────────────────

interface FaltantesViewProps {
  teamsWithMissing: Array<{ team: typeof TEAMS[number]; missing: string[] }>
  totalMissing: number
}

function FaltantesView({ teamsWithMissing, totalMissing }: FaltantesViewProps) {
  if (totalMissing === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🏆</div>
        <p className="text-white/60 font-display font-black tracking-wide uppercase">Álbum completo!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {teamsWithMissing.map(({ team, missing }) => (
        <Link key={team.code} href={`/selecao/${team.code.toLowerCase()}`} className="block group">
          <div
            className="rounded-2xl p-4 border border-white/5 active:scale-95 group-hover:-translate-y-0.5 transition-all duration-200 corner-cut corner-cut-md"
            style={{
              background: `linear-gradient(145deg, ${team.primaryColor}15 0%, var(--copa-card) 100%)`,
              ['--cut-accent' as string]: `${GROUP_COLORS[team.group]}a0`,
            } as React.CSSProperties}
          >
            <div className="flex items-center gap-3 mb-2">
              <Flag code={team.flagCode} size="sm" />
              <div className="flex-1">
                <p className="font-display font-bold text-sm text-white tracking-wide uppercase">{team.name}</p>
                <p className="text-[10px] text-white/40 mt-0.5">
                  <span
                    className="font-mono tracking-widest uppercase"
                    style={{ color: GROUP_COLORS[team.group] }}
                  >
                    Grupo {team.group}
                  </span>
                </p>
              </div>
              <span className="text-xs font-display font-black tracking-tight text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
                −{missing.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {missing.map((num) => (
                <span
                  key={num}
                  className="text-[10px] font-mono font-bold tracking-wider text-white/50 bg-white/5 rounded px-1.5 py-0.5"
                >
                  {num.padStart(2, '0')}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

interface RepetidasViewProps {
  duplicates: Array<{ id: string; quantity: number }>
  addDuplicate: (id: string) => void
  removeDuplicate: (id: string) => void
}

function RepetidasView({
  duplicates,
  addDuplicate,
  removeDuplicate,
}: RepetidasViewProps) {
  if (duplicates.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">✨</div>
        <p className="text-white/60 font-display font-black tracking-wide uppercase">Sem repetidas</p>
        <p className="text-white/30 text-xs mt-2 font-mono tracking-wider">
          Suas repetidas aparecerão aqui
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-3">
        <Link
          href="/trocar"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-copa-gold/10 text-copa-gold text-[11px] font-display font-bold tracking-widest uppercase active:scale-95 transition-transform"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          Trocar
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {duplicates.map(({ id, quantity }) => {
          const { team, sticker, number } = getStickerInfo(id)
          if (!team || !sticker) return null

          return (
            <div
              key={id}
              className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/5 corner-cut corner-cut-md"
              style={{
                background: `linear-gradient(145deg, ${team.primaryColor}10 0%, var(--copa-card) 100%)`,
                ['--cut-accent' as string]: `${team.primaryColor}90`,
              } as React.CSSProperties}
            >
              <Flag code={team.flagCode} size="xs" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-bold text-white truncate tracking-wide uppercase">
                  {sticker.label}
                </p>
                <p className="text-[10px] text-white/40 font-mono tracking-wider mt-0.5">
                  {team.name} · #{number.padStart(2, '0')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="w-7 h-7 rounded-full bg-white/10 text-white font-display font-black text-base flex items-center justify-center active:scale-90 transition-transform"
                  onClick={() => removeDuplicate(id)}
                  aria-label="Remover uma repetida"
                >
                  −
                </button>
                <span className="text-copa-gold font-display font-black text-base tracking-tight w-5 text-center">
                  {quantity}
                </span>
                <button
                  className="w-7 h-7 rounded-full bg-copa-gold/20 text-copa-gold font-display font-black text-base flex items-center justify-center active:scale-90 transition-transform"
                  onClick={() => addDuplicate(id)}
                  aria-label="Adicionar uma repetida"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
