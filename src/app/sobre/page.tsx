'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { PIX_QR_BASE64 } from '@/lib/pix-qr'

const PIX_KEY = 'igormcezatte@gmail.com'

export default function SobrePage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const handleCopyPix = async () => {
    await navigator.clipboard.writeText(PIX_KEY)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="px-4 pt-6 pb-10 animate-fade-in max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="text-white/40 active:scale-90 transition-transform"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-black text-white">Sobre</h1>
      </div>

      {/* Sobre o app */}
      <section className="mb-8">
        <div className="rounded-2xl border border-white/5 p-5 space-y-3" style={{ background: 'var(--copa-card)' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
              style={{ background: 'linear-gradient(135deg, #f5c42e, #d4a017)' }}
            >
              <span className="text-black">26</span>
            </div>
            <div>
              <p className="text-sm font-black text-white leading-none">Álbum Copa 2026</p>
              <p className="text-[10px] text-white/40">FIFA World Cup</p>
            </div>
          </div>
          <p className="text-[13px] text-white/60 leading-relaxed">
            Controle suas figurinhas da Copa do Mundo 2026 de forma simples e divertida.
            Marque as que você tem, gerencie repetidas, veja o progresso por grupo e compartilhe sua lista atualizada com amigos.
          </p>
          <p className="text-[11px] text-white/30">994 figurinhas · 48 seleções · 12 grupos</p>
        </div>
      </section>

      {/* Sobre o dev */}
      <section className="mb-8">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Desenvolvedor</p>
        <div className="rounded-2xl border border-white/5 p-5" style={{ background: 'var(--copa-card)' }}>
          <div className="flex items-center gap-4 mb-4">
            <Image
              src="https://github.com/igorcezatte.png"
              alt="Igor Cezatte"
              width={56}
              height={56}
              className="rounded-full ring-2 ring-white/10"
            />
            <div>
              <p className="text-sm font-black text-white">Igor Cezatte</p>
              <p className="text-[11px] text-white/50">Engenheiro de Computação</p>
              <a
                href="https://github.com/igorcezatte"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-copa-gold mt-0.5 inline-flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                github.com/igorcezatte
              </a>
            </div>
          </div>
          <p className="text-[13px] text-white/60 leading-relaxed">
            Apaixonado por tecnologia, desenvolvendo projetos nas horas vagas.
            Este álbum surgiu da necessidade real de controlar figurinhas da Copa,
            espero que esteja facilitando a sua vida também!
          </p>
        </div>
      </section>

      {/* PIX */}
      <section>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">🎴 Me pague um pacotinho</p>
        <div className="rounded-2xl border border-white/5 p-5 space-y-4" style={{ background: 'var(--copa-card)' }}>
          <p className="text-[13px] text-white/60 leading-relaxed">
            Essa aplicação é totalmente gratuita, use o quanto quiser. 💙
            Mas, se ela te ajudou e você quiser/puder dar uma força, me pague um pacotinho! 🎴

            Por aqui eu também ainda tô na luta pra fechar meu álbum. 😅
            Qualquer figurinha é bem-vinda!
          </p>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl p-3 inline-block">
              <Image
                src={PIX_QR_BASE64}
                alt="QR Code PIX"
                width={180}
                height={180}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Chave PIX */}
          <div className="rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/40 font-medium mb-0.5">Chave PIX</p>
              <p className="text-sm font-bold text-white truncate font-mono">{PIX_KEY}</p>
            </div>
            <button
              onClick={handleCopyPix}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-copa-gold/10 text-copa-gold text-[11px] font-bold active:scale-95 transition-transform"
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
