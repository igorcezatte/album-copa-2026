'use client'

import { useState } from 'react'
import { useAlbumStore } from '@/store/albumStore'
import { useHydrated } from '@/hooks/useHydrated'
import {
  listVersions,
  addVersion,
  diffStickers,
  reasonLabel,
  type Version,
} from '@/utils/versions'

/**
 * Seção "Histórico" em /config: lista as versões automáticas mantidas em
 * background e permite restaurar uma. Visualmente colapsada por padrão — é
 * funcionalidade de recuperação, não de uso diário.
 *
 * Restaurar SEMPRE cria um snapshot do estado atual primeiro (anti-arrependi-
 * mento), e mostra preview de diff antes de aplicar.
 */
export function HistorySection() {
  const hydrated = useHydrated()
  const currentStickers = useAlbumStore((s) => s.stickers)
  const replaceStickers = useAlbumStore((s) => s.replaceStickers)

  const [open, setOpen] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  // Snapshot da lista no momento de abrir/restaurar — evita re-listVersions
  // ao recriar a versão de salvamento atual.
  const [versions, setVersions] = useState<Version[]>([])

  const refresh = () => {
    setVersions(listVersions())
  }

  const handleToggle = () => {
    if (!open) refresh()
    setOpen(!open)
    setPreviewId(null)
    setDone(false)
  }

  const preview = previewId !== null ? versions.find((v) => v.id === previewId) : null
  const diff = preview ? diffStickers(currentStickers, preview.stickers) : null

  const handleRestore = (version: Version) => {
    // Cria versão "agora" antes de restaurar — usuário pode voltar.
    addVersion(currentStickers, 'restore-backup')
    replaceStickers(version.stickers)
    setPreviewId(null)
    setDone(true)
    refresh()
  }

  return (
    <section className="mb-6">
      <h2 className="text-xs font-display font-bold text-white/40 uppercase tracking-[0.2em] mb-3 flex items-baseline gap-2">
        <span className="font-mono text-white/25" aria-hidden>—</span>
        Histórico
      </h2>
      <div
        className="rounded-2xl border border-white/5 overflow-hidden corner-cut corner-cut-sm"
        style={{
          background: 'var(--copa-card)',
          ['--cut-accent' as string]: 'var(--cut-accent-neutral)',
        } as React.CSSProperties}
      >
        {/* Toggle */}
        <button
          onClick={handleToggle}
          disabled={!hydrated}
          className="w-full p-4 text-left active:bg-white/5 transition-colors flex items-center justify-between disabled:opacity-40"
        >
          <span className="flex-1 min-w-0">
            <span className="block text-[11px] font-mono font-bold tracking-widest uppercase text-white">Versões automáticas</span>
            <span className="block text-[11px] font-normal text-white/40 mt-1 leading-relaxed">
              O app salva uma versão da sua coleção a cada 12h ou antes de
              ações que mexem com seus dados. Útil pra voltar atrás.
            </span>
          </span>
          <svg
            className={`w-4 h-4 text-white/30 flex-shrink-0 ml-3 transition-transform ${
              open ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="border-t border-white/5">
            {done && (
              <div className="p-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-copa-green/20 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-copa-green"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-bold tracking-wide uppercase text-white">Versão restaurada</p>
                  <p className="text-[10px] font-mono tracking-wider text-white/40 mt-0.5">
                    Suas figurinhas voltaram pro estado escolhido
                  </p>
                </div>
                <button
                  onClick={() => setDone(false)}
                  className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/40 px-2 py-1"
                >
                  OK
                </button>
              </div>
            )}

            {versions.length === 0 ? (
              <div className="p-4 text-[11px] text-white/40 leading-relaxed">
                Sem versões salvas ainda. Quando você usar o app por alguns
                dias ou fizer trocas, elas vão aparecer aqui.
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {versions.map((v) => (
                  <li key={v.id} className="p-3">
                    <button
                      onClick={() =>
                        setPreviewId(previewId === v.id ? null : v.id)
                      }
                      className="w-full text-left flex items-center gap-3 active:opacity-70 transition-opacity"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-display font-bold tracking-wide uppercase text-white truncate">
                          {reasonLabel(v.reason)}
                        </p>
                        <p className="text-[10px] font-mono tracking-wider text-white/40 mt-1">
                          {formatDateTime(v.savedAt)} ·{' '}
                          <span className="font-bold text-white/60">
                            {v.size} figurinha{v.size === 1 ? '' : 's'}
                          </span>
                        </p>
                      </div>
                      <svg
                        className={`w-3.5 h-3.5 text-white/30 transition-transform ${
                          previewId === v.id ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>

                    {previewId === v.id && preview && diff && (
                      <div className="mt-3 rounded-xl bg-amber-500/5 border border-amber-500/15 p-3 space-y-2">
                        <p className="text-[10px] font-mono font-black tracking-widest uppercase text-amber-300">
                          Se restaurar agora
                        </p>
                        <div className="text-[11px] text-white/70 leading-relaxed space-y-0.5">
                          {diff.added.length > 0 && (
                            <p>
                              <span className="text-red-400 font-display font-black tracking-tight">
                                −{diff.added.length}
                              </span>{' '}
                              figurinha{diff.added.length === 1 ? '' : 's'} que
                              você tem hoje mas não tinha nessa versão
                            </p>
                          )}
                          {diff.removed.length > 0 && (
                            <p>
                              <span className="font-display font-black tracking-tight" style={{ color: 'var(--copa-field)' }}>
                                +{diff.removed.length}
                              </span>{' '}
                              figurinha{diff.removed.length === 1 ? '' : 's'}{' '}
                              que voltam dessa versão
                            </p>
                          )}
                          {diff.changed.length > 0 && (
                            <p>
                              <span className="text-amber-300 font-display font-black tracking-tight">
                                {diff.changed.length}
                              </span>{' '}
                              repetida
                              {diff.changed.length === 1 ? '' : 's'}{' '}
                              ajustada{diff.changed.length === 1 ? '' : 's'}
                            </p>
                          )}
                          {diff.added.length === 0 &&
                            diff.removed.length === 0 &&
                            diff.changed.length === 0 && (
                              <p className="text-white/40 font-mono tracking-wider uppercase text-[10px]">
                                Idêntica ao estado atual
                              </p>
                            )}
                        </div>
                        <p className="text-[10px] font-mono tracking-wider text-white/40 leading-relaxed">
                          Antes de aplicar, o estado atual será salvo como nova
                          versão · você pode voltar depois
                        </p>
                        <button
                          onClick={() => handleRestore(preview)}
                          className="w-full py-2 rounded-lg bg-copa-gold text-black text-[10px] font-mono font-black tracking-widest uppercase active:scale-[0.98] transition-transform"
                        >
                          Restaurar
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
