'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { PIX_QR_BASE64, PIX_BR_CODE, PIX_SUGGESTED_AMOUNT } from '@/lib/pix-qr'

const PIX_KEY = 'igormcezatte@gmail.com'

export default function SobrePage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [qrCopied, setQrCopied] = useState(false)

  const handleCopyPix = async () => {
    await navigator.clipboard.writeText(PIX_KEY)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleCopyBrCode = async () => {
    await navigator.clipboard.writeText(PIX_BR_CODE)
    setQrCopied(true)
    setTimeout(() => setQrCopied(false), 2500)
  }

  return (
    <div className="px-4 pt-6 pb-10 animate-fade-in max-w-lg lg:max-w-2xl mx-auto">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-white/40 text-[11px] font-mono font-bold tracking-widest uppercase mb-4 -ml-1 hover:text-white/60 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </button>
      <h1 className="text-2xl lg:text-4xl font-display font-black text-white tracking-tight uppercase leading-none mb-7 lg:mb-9">Sobre</h1>

      {/* Sobre o app */}
      <section className="mb-7 lg:mb-9">
        <div
          className="rounded-2xl border border-white/5 p-5 lg:p-7 space-y-3 lg:space-y-4 corner-cut corner-cut-md"
          style={{
            background: 'var(--copa-card)',
            ['--cut-accent' as string]: 'rgba(245, 196, 46, 0.45)',
          } as React.CSSProperties}
        >
          <div className="flex items-center gap-3 lg:gap-4">
            <div
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f5c42e, #d4a017)' }}
            >
              <span className="text-black font-display font-black text-sm lg:text-base tracking-tight">26</span>
            </div>
            <div>
              <p className="text-base lg:text-xl font-display font-black text-white tracking-tight uppercase leading-none">Álbum Copa 2026</p>
              <p className="text-[10px] lg:text-[11px] font-mono tracking-widest uppercase text-white/40 mt-1">FIFA World Cup</p>
            </div>
          </div>
          <p className="text-[13px] lg:text-sm text-white/60 leading-relaxed">
            Controle suas figurinhas da Copa do Mundo 2026 de forma simples e divertida.
            Marque as que você tem, gerencie repetidas, veja o progresso por grupo e compartilhe sua lista atualizada com amigos.
          </p>
          <p className="text-[10px] font-mono tracking-widest uppercase text-white/30">994 figurinhas · 48 seleções · 12 grupos</p>

          {/* Crédito enxuto — uma linha, sem card de portfólio */}
          <p className="text-[11px] font-mono tracking-wider text-white/40 pt-1">
            feito por Igor ·{' '}
            <a
              href="https://github.com/igorcezatte"
              target="_blank"
              rel="noopener noreferrer"
              className="text-copa-gold hover:text-copa-gold/80 transition-colors"
            >
              github.com/igorcezatte
            </a>
          </p>
        </div>
      </section>

      {/* Apoie o projeto */}
      <section>
        <h2 className="text-xs lg:text-sm font-display font-bold text-white/40 uppercase tracking-[0.2em] mb-3 flex items-baseline gap-2">
          <span className="font-mono text-white/25" aria-hidden>—</span>
          Apoie o projeto
        </h2>
        <div
          className="rounded-2xl border border-white/5 p-5 lg:p-7 space-y-4 lg:space-y-5 corner-cut corner-cut-md"
          style={{
            background: 'var(--copa-card)',
            ['--cut-accent' as string]: 'rgba(245, 196, 46, 0.55)',
          } as React.CSSProperties}
        >
          <p className="text-[13px] lg:text-sm text-white/60 leading-relaxed">
            O app é gratuito e sempre vai ser. 💙 Se ele te ajudou e você quiser dar uma força,
            me paga um pacotinho 🎴 — qualquer valor é bem-vindo.
          </p>

          {/* QR Code — clicável: copia o código PIX (Copia e Cola) */}
          <div className="flex flex-col items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyBrCode}
              className="bg-white rounded-2xl p-3 inline-block active:scale-95 transition-transform relative group"
              aria-label="Copiar código PIX (Copia e Cola)"
            >
              <Image
                src={PIX_QR_BASE64}
                alt="QR Code PIX"
                width={180}
                height={180}
                className="rounded-xl"
              />
              {/* Overlay com feedback de copiado */}
              {qrCopied && (
                <div className="absolute inset-0 rounded-2xl bg-copa-green/90 flex flex-col items-center justify-center animate-fade-in">
                  <svg className="w-12 h-12 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-white font-display font-black text-sm tracking-tight uppercase">Código copiado!</p>
                </div>
              )}
            </button>
            <p className="text-[10px] font-mono tracking-wider text-white/50 text-center max-w-[260px] leading-snug">
              Toque no QR pra copiar o código PIX · <span className="text-copa-gold font-bold">R$ {PIX_SUGGESTED_AMOUNT.toFixed(2).replace('.', ',')} sugerido</span>, editável no banco
            </p>
          </div>

          {/* Chave PIX */}
          <div className="rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-mono tracking-widest uppercase text-white/40 mb-0.5">Chave PIX</p>
              <p className="text-sm font-bold text-white truncate font-mono">{PIX_KEY}</p>
            </div>
            <button
              onClick={handleCopyPix}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-copa-gold/10 text-copa-gold text-[10px] font-mono font-bold tracking-widest uppercase active:scale-95 transition-transform"
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copiado!
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
