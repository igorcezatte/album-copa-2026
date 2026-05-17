'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAlbumStore } from '@/store/albumStore'
import { TEAMS } from '@/data/teams'
import { Flag } from '@/components/Flag'
import { GROUP_COLORS } from '@/data/teams'
import { generateShareText, shareAlbum } from '@/utils/share'

export default function FaltantesPage() {
  const getMissing = useAlbumStore((s) => s.getMissing)
  const [copied, setCopied] = useState(false)

  const teamsWithMissing = TEAMS.map((team) => ({
    team,
    missing: getMissing(team.code),
  })).filter((t) => t.missing.length > 0)

  const totalMissing = teamsWithMissing.reduce((acc, t) => acc + t.missing.length, 0)

  const handleShare = async () => {
    const shareData = teamsWithMissing.map((t) => ({
      teamName: t.team.name,
      missing: t.missing,
    }))
    const text = generateShareText(shareData)
    const usedNative = await shareAlbum(text)
    if (!usedNative) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="px-4 pt-6 animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-black text-white">Faltantes</h1>
        {totalMissing > 0 && (
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-copa-gold/10 text-copa-gold text-xs font-bold active:scale-95 transition-transform"
            onClick={handleShare}
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copiado!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Compartilhar
              </>
            )}
          </button>
        )}
      </div>
      <p className="text-sm text-white/40 mb-6">
        {totalMissing === 0 ? 'Álbum completo! 🏆' : `${totalMissing} figurinha${totalMissing !== 1 ? 's' : ''} faltando`}
      </p>

      {totalMissing === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-white/60 font-bold">Álbum completo!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teamsWithMissing.map(({ team, missing }) => (
            <Link key={team.code} href={`/selecao/${team.code.toLowerCase()}`}>
              <div
                className="rounded-2xl p-4 border border-white/5 active:scale-95 transition-transform"
                style={{
                  background: `linear-gradient(145deg, ${team.primaryColor}15 0%, #0d1424 100%)`,
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Flag code={team.flagCode} size="sm" />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white">{team.name}</p>
                    <p className="text-[10px] text-white/40">
                      <span
                        className="font-bold"
                        style={{ color: GROUP_COLORS[team.group] }}
                      >
                        Grupo {team.group}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs font-black text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
                    -{missing.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {missing.map((num) => (
                    <span
                      key={num}
                      className="text-[10px] font-bold text-white/50 bg-white/5 rounded px-1.5 py-0.5 font-mono"
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
