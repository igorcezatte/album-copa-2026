'use client'

import Link from 'next/link'
import { useAlbumStore } from '@/store/albumStore'
import { TEAMS } from '@/data/teams'
import { Flag } from '@/components/Flag'

function getStickerInfo(id: string) {
  const [teamCode, ...numParts] = id.split('_')
  const number = numParts.join('_')
  const team = TEAMS.find((t) => t.code === teamCode)
  const sticker = team?.stickers.find((s) => s.number === number)
  return { team, sticker, number }
}

export default function RepetidasPage() {
  const duplicates = useAlbumStore((s) => s.getDuplicates())
  const addDuplicate = useAlbumStore((s) => s.addDuplicate)
  const removeDuplicate = useAlbumStore((s) => s.removeDuplicate)

  const totalDuplicates = duplicates.reduce((acc, d) => acc + d.quantity, 0)

  return (
    <div className="px-4 pt-6 animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-black text-white">Repetidas</h1>
        {duplicates.length > 0 && (
          <Link
            href="/trocar"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-copa-gold/10 text-copa-gold text-[11px] font-bold active:scale-95 transition-transform"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Trocar
          </Link>
        )}
      </div>
      <p className="text-sm text-white/40 mb-6">
        {totalDuplicates === 0
          ? 'Nenhuma repetida ainda'
          : `${totalDuplicates} figurinha${totalDuplicates !== 1 ? 's' : ''} repetida${totalDuplicates !== 1 ? 's' : ''}`}
      </p>

      {duplicates.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">✨</div>
          <p className="text-white/60 font-bold">Sem repetidas</p>
          <p className="text-white/30 text-sm mt-1">Suas repetidas aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-2">
          {duplicates.map(({ id, quantity }) => {
            const { team, sticker, number } = getStickerInfo(id)
            if (!team || !sticker) return null

            return (
              <div
                key={id}
                className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/5"
                style={{ background: `linear-gradient(145deg, ${team.primaryColor}10 0%, var(--copa-card) 100%)` }}
              >
                <Flag code={team.flagCode} size="xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{sticker.label}</p>
                  <p className="text-[10px] text-white/40">
                    {team.name} · #{number}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="w-7 h-7 rounded-full bg-white/10 text-white font-bold text-sm flex items-center justify-center active:scale-90 transition-transform"
                    onClick={() => removeDuplicate(id)}
                  >
                    −
                  </button>
                  <span className="text-copa-gold font-black text-sm w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    className="w-7 h-7 rounded-full bg-copa-gold/20 text-copa-gold font-bold text-sm flex items-center justify-center active:scale-90 transition-transform"
                    onClick={() => addDuplicate(id)}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
