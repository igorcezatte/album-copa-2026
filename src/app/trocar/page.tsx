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
        <span className="text-[11px] font-bold text-white">{item.stickerLabel}</span>
        <span className="text-[10px] text-white/40 ml-1">— {item.teamName} #{item.stickerNumber}</span>
      </div>
      <span className="text-[9px] text-white/30 capitalize">{meta.label}</span>
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
      <div className="flex items-center gap-3 mb-6">
        <Link href="/repetidas" className="text-white/40 active:scale-90 transition-transform">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-black text-white">Trocar Figurinhas</h1>
      </div>

      {/* Meu perfil */}
      <section className="mb-5">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Meu perfil</p>
        <div className="rounded-2xl border border-white/5 p-4" style={{ background: 'var(--copa-card)' }}>
          {!hydrated ? (
            <p className="text-sm text-white/30">Carregando...</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-white">{totalMyDups} repetidas disponíveis</p>
                  <p className="text-[11px] text-white/40">Preciso de {totalMyNeed} figurinhas</p>
                </div>
                {myProfile && (
                  <div className="flex gap-2">
                    {Object.entries(CATEGORY_META).map(([cat, meta]) => {
                      const count = myProfile.dup[cat as keyof typeof myProfile.dup].length
                      return count > 0 ? (
                        <div key={cat} className="flex flex-col items-center">
                          <span className="text-base">{meta.icon}</span>
                          <span className="text-[9px] font-black text-white/50">{count}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyUrl}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 text-white/60 text-xs font-bold active:scale-95 transition-transform"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copied ? 'Copiado!' : 'Copiar link'}
                </button>
                <button
                  onClick={handleShareUrl}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-copa-gold/10 text-copa-gold text-xs font-bold active:scale-95 transition-transform"
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
        <section className="mb-5">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Código de um amigo</p>
          <div className="rounded-2xl border border-white/5 p-4" style={{ background: 'var(--copa-card)' }}>
            <p className="text-[11px] text-white/40 mb-3">Cole o link ou código que seu amigo compartilhou:</p>
            <div className="flex gap-2">
              <input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Cole o código aqui..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-copa-gold/40 text-xs"
              />
              <button
                onClick={handleLoadCode}
                disabled={!inputCode.trim()}
                className="px-4 py-2 rounded-xl bg-copa-gold text-black text-xs font-black disabled:opacity-40 active:scale-95 transition-transform"
              >
                Ver trocas
              </button>
            </div>
            {inputError && <p className="text-[11px] text-red-400 mt-2">{inputError}</p>}
          </div>
        </section>
      )}

      {/* Resultado de trocas */}
      {tradeResult && friendProfile && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              Trocas com {friendProfile.nick ?? 'este perfil'}
            </p>
            <button
              onClick={() => { setFriendProfile(null); router.replace('/trocar') }}
              className="text-[10px] text-white/30 active:text-white/60"
            >
              Limpar
            </button>
          </div>

          {/* Toggle regras */}
          <div className="flex items-center gap-3 mb-4 rounded-xl px-3 py-2 border border-white/5" style={{ background: 'var(--copa-card)' }}>
            <button
              onClick={() => setUseRules(!useRules)}
              className={`w-9 h-5 rounded-full transition-colors ${useRules ? 'bg-copa-gold' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white mx-0.5 transition-transform ${useRules ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
            <div>
              <p className="text-[11px] font-bold text-white">Regras de categoria</p>
              <p className="text-[9px] text-white/40">Escudo por escudo · Seleção por seleção · Jogador por jogador</p>
            </div>
          </div>

          {/* Balanço */}
          {tradeResult.isBalanced ? (
            <div className="rounded-xl bg-copa-green/10 border border-copa-green/20 px-3 py-2 mb-4 text-[11px] font-bold text-copa-green">
              Troca equilibrada possivel! Ambos ganham figurinhas.
            </div>
          ) : (
            <div className="rounded-xl bg-white/5 border border-white/5 px-3 py-2 mb-4 text-[11px] text-white/40">
              Troca parcial — apenas um lado tem o que o outro precisa.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Posso oferecer */}
            <div className="rounded-2xl border border-white/5 p-3" style={{ background: 'var(--copa-card)' }}>
              <p className="text-[10px] font-black text-copa-green mb-2">
                Posso oferecer ({tradeResult.canOffer.length})
              </p>
              {tradeResult.canOffer.length === 0 ? (
                <p className="text-[10px] text-white/25">Nenhuma correspondencia</p>
              ) : (
                tradeResult.canOffer.map((item, i) => <TradeItemRow key={i} item={item} />)
              )}
            </div>

            {/* Posso receber */}
            <div className="rounded-2xl border border-white/5 p-3" style={{ background: 'var(--copa-card)' }}>
              <p className="text-[10px] font-black text-copa-gold mb-2">
                Posso receber ({tradeResult.canReceive.length})
              </p>
              {tradeResult.canReceive.length === 0 ? (
                <p className="text-[10px] text-white/25">Nenhuma correspondencia</p>
              ) : (
                tradeResult.canReceive.map((item, i) => <TradeItemRow key={i} item={item} />)
              )}
            </div>
          </div>

          {/* Meu código para o amigo */}
          <div className="mt-4 rounded-2xl border border-white/5 p-4" style={{ background: 'var(--copa-card)' }}>
            <p className="text-[11px] text-white/40 mb-2">
              Compartilhe seu código com <strong className="text-white/60">{friendProfile.nick ?? 'seu amigo'}</strong> para que ele veja as trocas do lado dele:
            </p>
            <button
              onClick={handleShareUrl}
              className="w-full py-2.5 rounded-xl bg-copa-gold/10 text-copa-gold text-xs font-bold active:scale-95 transition-transform"
            >
              Compartilhar meu codigo
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default function TrocarPage() {
  return (
    <Suspense fallback={<div className="px-4 pt-6 text-white/40 text-sm">Carregando...</div>}>
      <TrocarContent />
    </Suspense>
  )
}
