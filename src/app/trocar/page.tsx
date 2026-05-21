'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAlbumStore } from '@/store/albumStore'
import { TEAMS, FWC_SECTION, CC_SECTION } from '@/data/teams'
import { stickerId as mkId } from '@/store/albumStore'
import {
  buildTradeProfile,
  decodeTradeProfile,
  encodeTradeProfile,
  calculateTrades,
  CATEGORY_META,
  type TradeProfile,
  type TradeItem,
} from '@/utils/trade'
import { useHydrated } from '@/hooks/useHydrated'

// ── Helpers ────────────────────────────────────────────────────

function buildMyMissingIds(getMissing: (code: string) => string[], isCollected: (id: string) => boolean): string[] {
  const ids: string[] = []
  for (const team of TEAMS) {
    getMissing(team.code).forEach((n) => ids.push(`${team.code}_${n}`))
  }
  FWC_SECTION.stickers.forEach((s) => { if (!isCollected(mkId('FWC', s.number))) ids.push(`FWC_${s.number}`) })
  CC_SECTION.stickers.forEach((s)  => { if (!isCollected(mkId('CC', s.number)))  ids.push(`CC_${s.number}`)  })
  return ids
}

// ── Sub-componentes ────────────────────────────────────────────

function TradeItemRow({ item }: { item: TradeItem }) {
  const meta = CATEGORY_META[item.category]
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-[10px]">{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-display font-bold tracking-wide uppercase text-white">{item.stickerLabel}</span>
        <span className="text-[10px] text-white/40 ml-1 font-mono">— {item.teamName} #{item.stickerNumber}</span>
      </div>
      <span className="text-[9px] text-white/30 font-mono tracking-widest uppercase">{meta.label}</span>
    </div>
  )
}

function TrocarContent() {
  const router = useRouter()
  const params = useSearchParams()
  const encoded = params.get('c')
  const hydrated = useHydrated()

  const getDuplicates = useAlbumStore((s) => s.getDuplicates)
  const getMissing    = useAlbumStore((s) => s.getMissing)
  const isCollected   = useAlbumStore((s) => s.isCollected)

  const [useRules, setUseRules] = useState(true)
  const [inputCode, setInputCode] = useState('')
  const [friendProfile, setFriendProfile] = useState<TradeProfile | null>(null)
  const [inputError, setInputError] = useState('')
  const [copied, setCopied] = useState(false)

  // Meu perfil
  const myProfile = hydrated
    ? buildTradeProfile(
        getDuplicates(),
        buildMyMissingIds(getMissing, isCollected),
      )
    : null

  const myCode = myProfile ? encodeTradeProfile(myProfile) : ''
  const myUrl  = typeof window !== 'undefined' ? `${window.location.origin}/trocar?c=${myCode}` : ''

  // Carrega o perfil do amigo da URL
  useEffect(() => {
    if (!encoded) return
    const decoded = decodeTradeProfile(encoded)
    if (decoded) setFriendProfile(decoded)
    else setInputError('Código inválido ou corrompido.')
  }, [encoded])

  const handleLoadCode = () => {
    setInputError('')
    const decoded = decodeTradeProfile(inputCode.trim())
    if (!decoded) { setInputError('Código inválido.'); return }
    setFriendProfile(decoded)
    router.replace(`/trocar?c=${inputCode.trim()}`)
  }

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(myUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleShareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Meu codigo de troca - Album Copa 2026', url: myUrl })
      } catch {
        // usuário cancelou o share
      }
    } else {
      handleCopyUrl()
    }
  }

  // Resultado de trocas
  const tradeResult = myProfile && friendProfile
    ? calculateTrades(myProfile, friendProfile, useRules)
    : null

  const totalMyDups  = myProfile ? Object.values(myProfile.dup).flat().length : 0
  const totalMyNeed  = myProfile ? Object.values(myProfile.need).flat().length : 0

  return (
    <div className="px-4 pt-6 pb-10 animate-fade-in">
      {/* Header */}
      <Link
        href="/colecao"
        className="inline-flex items-center gap-1 text-white/40 text-[11px] font-mono font-bold tracking-widest uppercase mb-4 -ml-1 hover:text-white/60 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </Link>
      <p className="text-[10px] text-white/30 font-mono tracking-[0.22em] uppercase">Mercado · P2P</p>
      <h1 className="text-2xl font-display font-black text-white tracking-tight uppercase leading-none mt-0.5">Trocar Figurinhas</h1>
      <p className="text-[11px] text-white/40 font-mono tracking-wider mt-1 mb-6">Compartilhe seu código · encontre quem tem o que falta</p>

      {/* Meu perfil */}
      <section className="mb-6">
        <h2 className="text-xs font-display font-bold text-white/40 uppercase tracking-[0.2em] mb-3 flex items-baseline gap-2">
          <span className="font-mono text-white/25" aria-hidden>—</span>
          Meu perfil
        </h2>
        <div
          className="rounded-2xl border border-white/5 p-4 corner-cut corner-cut-md"
          style={{
            background: 'var(--copa-card)',
            ['--cut-accent' as string]: 'rgba(245, 196, 46, 0.45)',
          } as React.CSSProperties}
        >
          {!hydrated ? (
            <p className="text-[11px] font-mono uppercase tracking-widest text-white/30">Carregando…</p>
          ) : (
            <>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-3xl font-display font-black text-white leading-none tracking-tight">{totalMyDups}</p>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mt-1.5">Repetidas disponíveis</p>
                  <p className="text-[10px] font-mono tracking-wider text-white/30 mt-2">Preciso de <span className="text-white/60 font-bold">{totalMyNeed}</span> figurinhas</p>
                </div>
                {myProfile && (
                  <div className="flex gap-2.5">
                    {Object.entries(CATEGORY_META).map(([cat, meta]) => {
                      const count = myProfile.dup[cat as keyof typeof myProfile.dup].length
                      return count > 0 ? (
                        <div key={cat} className="flex flex-col items-center">
                          <span className="text-base">{meta.icon}</span>
                          <span className="text-[10px] font-mono font-black tracking-wider text-white/50 mt-0.5">{count}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyUrl}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 text-white/60 text-[10px] font-mono font-bold tracking-widest uppercase active:scale-95 transition-transform"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copied ? 'Copiado!' : 'Copiar link'}
                </button>
                <button
                  onClick={handleShareUrl}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-copa-gold/10 text-copa-gold text-[10px] font-mono font-bold tracking-widest uppercase active:scale-95 transition-transform"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Compartilhar
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Input código do amigo */}
      {!friendProfile && (
        <section className="mb-6">
          <h2 className="text-xs font-display font-bold text-white/40 uppercase tracking-[0.2em] mb-3 flex items-baseline gap-2">
            <span className="font-mono text-white/25" aria-hidden>—</span>
            Código de um amigo
          </h2>
          <div
            className="rounded-2xl border border-white/5 p-4 corner-cut corner-cut-sm"
            style={{
              background: 'var(--copa-card)',
              ['--cut-accent' as string]: 'rgba(255, 255, 255, 0.18)',
            } as React.CSSProperties}
          >
            <p className="text-[10px] font-mono tracking-wider text-white/40 mb-3 uppercase">Cole o link ou código compartilhado</p>
            <div className="flex gap-2">
              <input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Cole o código aqui…"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-white placeholder-white/20 outline-none focus:border-copa-gold/40"
              />
              <button
                onClick={handleLoadCode}
                disabled={!inputCode.trim()}
                className="px-4 py-2.5 rounded-xl bg-copa-gold text-black text-[10px] font-mono font-black tracking-widest uppercase disabled:opacity-40 active:scale-95 transition-transform"
              >
                Ver trocas
              </button>
            </div>
            {inputError && <p className="text-[10px] font-mono uppercase tracking-wider text-red-400 mt-2">{inputError}</p>}
          </div>
        </section>
      )}

      {/* Resultado de trocas */}
      {tradeResult && friendProfile && (
        <section>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[10px] text-white/30 font-mono tracking-[0.22em] uppercase">Resultado</p>
              <h2 className="text-base font-display font-black text-white tracking-tight uppercase leading-none mt-0.5">
                Trocas com {friendProfile.nick ?? 'este perfil'}
              </h2>
            </div>
            <button
              onClick={() => { setFriendProfile(null); router.replace('/trocar') }}
              className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/30 active:text-white/60 transition-colors"
            >
              Limpar
            </button>
          </div>

          {/* Toggle regras */}
          <div className="flex items-center gap-3 mb-4 rounded-xl px-3 py-2.5 border border-white/5" style={{ background: 'var(--copa-card)' }}>
            <button
              onClick={() => setUseRules(!useRules)}
              className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 ${useRules ? 'bg-copa-gold' : 'bg-white/10'}`}
              aria-pressed={useRules}
            >
              <div className={`w-4 h-4 rounded-full bg-white mx-0.5 transition-transform ${useRules ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
            <div>
              <p className="text-[11px] font-display font-bold tracking-wide uppercase text-white">Regras de categoria</p>
              <p className="text-[9px] font-mono tracking-wider text-white/40 mt-0.5">Escudo · Seleção · Jogador respeitam a categoria</p>
            </div>
          </div>

          {/* Balanço */}
          {tradeResult.isBalanced ? (
            <div
              className="rounded-xl border px-3 py-2.5 mb-4 corner-cut corner-cut-sm"
              style={{
                background: 'rgba(21, 160, 101, 0.10)',
                borderColor: 'rgba(21, 160, 101, 0.25)',
                ['--cut-accent' as string]: 'rgba(21, 160, 101, 0.55)',
              } as React.CSSProperties}
            >
              <p className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color: 'var(--copa-field)' }}>
                Troca equilibrada · ambos ganham
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-white/5 border border-white/5 px-3 py-2.5 mb-4">
              <p className="text-[10px] font-mono tracking-widest uppercase text-white/40">Troca parcial · apenas um lado tem o que o outro precisa</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Posso oferecer */}
            <div
              className="rounded-2xl border border-white/5 p-3 corner-cut corner-cut-sm"
              style={{
                background: 'var(--copa-card)',
                ['--cut-accent' as string]: 'rgba(21, 160, 101, 0.5)',
              } as React.CSSProperties}
            >
              <p className="text-[9px] font-mono font-black tracking-widest uppercase mb-2" style={{ color: 'var(--copa-field)' }}>
                Posso oferecer · {tradeResult.canOffer.length}
              </p>
              {tradeResult.canOffer.length === 0 ? (
                <p className="text-[10px] font-mono tracking-wider text-white/25 uppercase">Nenhuma correspondência</p>
              ) : (
                tradeResult.canOffer.map((item, i) => <TradeItemRow key={i} item={item} />)
              )}
            </div>

            {/* Posso receber */}
            <div
              className="rounded-2xl border border-white/5 p-3 corner-cut corner-cut-sm"
              style={{
                background: 'var(--copa-card)',
                ['--cut-accent' as string]: 'rgba(245, 196, 46, 0.5)',
              } as React.CSSProperties}
            >
              <p className="text-[9px] font-mono font-black tracking-widest uppercase text-copa-gold mb-2">
                Posso receber · {tradeResult.canReceive.length}
              </p>
              {tradeResult.canReceive.length === 0 ? (
                <p className="text-[10px] font-mono tracking-wider text-white/25 uppercase">Nenhuma correspondência</p>
              ) : (
                tradeResult.canReceive.map((item, i) => <TradeItemRow key={i} item={item} />)
              )}
            </div>
          </div>

          {/* Meu código para o amigo */}
          <div
            className="mt-4 rounded-2xl border border-white/5 p-4 corner-cut corner-cut-md"
            style={{
              background: 'var(--copa-card)',
              ['--cut-accent' as string]: 'rgba(245, 196, 46, 0.45)',
            } as React.CSSProperties}
          >
            <p className="text-[10px] font-mono tracking-wider text-white/40 mb-3 uppercase">
              Compartilhe seu código com <strong className="text-white/70 font-display font-bold tracking-wide">{friendProfile.nick ?? 'seu amigo'}</strong> · ele vê as trocas do lado dele
            </p>
            <button
              onClick={handleShareUrl}
              className="w-full py-2.5 rounded-xl bg-copa-gold/10 text-copa-gold text-[10px] font-mono font-bold tracking-widest uppercase active:scale-95 transition-transform"
            >
              Compartilhar meu código
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default function TrocarPage() {
  return (
    <Suspense fallback={<div className="px-4 pt-6 text-white/40 text-[11px] font-mono uppercase tracking-widest">Carregando…</div>}>
      <TrocarContent />
    </Suspense>
  )
}
