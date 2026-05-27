/* eslint-disable @next/next/no-img-element */
// Card 9:16 (1080×1920) focado em figurinhas repetidas pra troca.
// Grid de bandeiras + números dos stickers por seleção, sem seção de
// "o que eu tenho" — objetivo é o amigo bater o olho e saber o que tem.
import type { ShareImageDuplicate, ShareImagePayload } from '@/utils/shareImage'
import type { FlagResolver } from '@/share-images/flags'
import { SpecialBadge } from '@/share-images/specialBadges'

const GOLD = '#F5C42E'
const BG = '#06080F'
const BG_CARD = '#0E1220'
const APP_URL = 'meualbumcopa26.vercel.app'

export const STORY_TRADE_WIDTH = 1080
export const STORY_TRADE_HEIGHT = 1920

// Bandeira pequena à esquerda + conteúdo à direita. Cabe até 24 (12 rows × 2).
// Usuários com mais caem no overflow "+N SELEÇÕES".
//
// Layout calculado dinamicamente pra preencher TODO o espaço disponível
// entre o divider e o footer — sem isso, usuários com poucas seleções
// repetidas viam metade da imagem vazia. cardHeight cresce até o cap;
// componentes internos escalam proporcionalmente (com cap em 2× pra não
// virar billboard com 3-4 seleções).
const MAX_SLOTS = 24
const COL_GAP = 12

// Altura útil pro grid (calibrada pro layout: header 36 + subheadline 25 +
// hero 70 + divider 12 + paddings 112 + footer ~210 + grid marginTop 20 = 485).
const GRID_AVAILABLE_HEIGHT = 1435

// Tamanhos base (caso COMPACT): scale=1 vira o layout original com 24 cards.
const BASE = {
  cardHeight: 80,
  flagW: 66,
  flagH: 46,
  nameSize: 20,
  labelSize: 12,
  badgeSize: 16,
  overflowSize: 18,
} as const

interface Layout {
  cardHeight: number
  cardGap: number
  flagW: number
  flagH: number
  nameSize: number
  labelSize: number
  badgeSize: number
  overflowSize: number
}

function pickLayout(slotsCount: number): Layout {
  const rows = Math.ceil(slotsCount / 2)
  const cardGap = slotsCount <= 10 ? 14 : slotsCount <= 18 ? 10 : 8
  const ideal = (GRID_AVAILABLE_HEIGHT - (rows - 1) * cardGap) / rows
  // Floor BASE (compact não fica menor), cap em 200 (não vira banner).
  const cardHeight = Math.min(200, Math.max(BASE.cardHeight, Math.floor(ideal)))
  // Scale capped em 2× pra elementos não inflarem demais com 3-4 cards.
  const scale = Math.min(2, cardHeight / BASE.cardHeight)
  return {
    cardHeight,
    cardGap,
    flagW: Math.round(BASE.flagW * scale),
    flagH: Math.round(BASE.flagH * scale),
    nameSize: Math.round(BASE.nameSize * scale),
    labelSize: Math.round(BASE.labelSize * scale),
    badgeSize: Math.round(BASE.badgeSize * scale),
    overflowSize: Math.round(BASE.overflowSize * scale),
  }
}

interface Props {
  data: ShareImagePayload
  getFlag: FlagResolver
  qrDataUri: string
}

export function StoryCardTrade({ data, getFlag, qrDataUri }: Props) {
  const dups = data.duplicates
  const hasOverflow = dups.length > MAX_SLOTS
  const visibleCount = hasOverflow ? MAX_SLOTS - 1 : dups.length
  const visible = dups.slice(0, visibleCount)
  const overflowCount = dups.length - visible.length

  const slots: (ShareImageDuplicate | null)[] = [...visible]
  if (hasOverflow) slots.push(null)

  const layout = pickLayout(slots.length)

  const half = Math.ceil(slots.length / 2)
  const leftSlots = slots.slice(0, half)
  const rightSlots = slots.slice(half)

  return (
    <div
      style={{
        width: STORY_TRADE_WIDTH,
        height: STORY_TRADE_HEIGHT,
        background: BG,
        display: 'flex',
        flexDirection: 'column',
        padding: 56,
        fontFamily: 'SpaceMono',
        color: '#FFFFFF',
      }}
    >
      {/* ─── Header ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 6, height: 34, background: GOLD, marginRight: 16, display: 'flex' }} />
          <span
            style={{
              fontFamily: 'BigShouldersDisplay',
              fontWeight: 900,
              fontSize: 36,
              color: GOLD,
              letterSpacing: 2,
              lineHeight: 1,
            }}
          >
            REPETIDAS PRA TROCAR
          </span>
        </div>
        <span
          style={{
            fontFamily: 'SpaceMono',
            fontWeight: 700,
            fontSize: 14,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: 3,
          }}
        >
          PANINI · COPA 2026
        </span>
      </div>

      {/* Sub-headline (propaganda sutil pro site) */}
      <span
        style={{
          fontFamily: 'SpaceMono',
          fontWeight: 700,
          fontSize: 13,
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: 2.5,
          lineHeight: 1,
          marginTop: 12,
          marginLeft: 22,
        }}
      >
        ORGANIZADAS EM MEUALBUMCOPA26.VERCEL.APP
      </span>

      {/* ─── Hero (compacto) ───────────────────────────────────── */}
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline' }}>
        <span
          style={{
            fontFamily: 'BigShouldersDisplay',
            fontWeight: 900,
            fontSize: 56,
            color: GOLD,
            lineHeight: 1,
            letterSpacing: -1,
          }}
        >
          {data.totalDuplicates}
        </span>
        <span
          style={{
            fontFamily: 'BigShouldersDisplay',
            fontWeight: 900,
            fontSize: 26,
            color: '#FFFFFF',
            lineHeight: 1,
            letterSpacing: -0.3,
            marginLeft: 12,
          }}
        >
          FIGURINHAS
        </span>
        <span
          style={{
            fontFamily: 'SpaceMono',
            fontWeight: 700,
            fontSize: 12,
            color: 'rgba(255,255,255,0.40)',
            letterSpacing: 3,
            lineHeight: 1,
            marginLeft: 'auto',
          }}
        >
          {dups.length} {dups.length === 1 ? 'SELECAO' : 'SELECOES'}
        </span>
      </div>

      {/* ─── Divider ───────────────────────────────────────────── */}
      <div
        style={{
          marginTop: 10,
          height: 2,
          background: 'rgba(245,196,46,0.25)',
          display: 'flex',
          borderRadius: 1,
        }}
      />

      {/* ─── Grid de times ─────────────────────────────────────── */}
      <div style={{ marginTop: 20, display: 'flex' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {leftSlots.map((slot, i) =>
            slot ? (
              <TeamCard
                key={slot.teamCode}
                dup={slot}
                getFlag={getFlag}
                gap={i < leftSlots.length - 1 ? layout.cardGap : 0}
                layout={layout}
              />
            ) : (
              <OverflowCard
                key="overflow-l"
                count={overflowCount}
                gap={0}
                layout={layout}
              />
            )
          )}
        </div>

        <div style={{ width: COL_GAP, display: 'flex', flexShrink: 0 }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {rightSlots.map((slot, i) =>
            slot ? (
              <TeamCard
                key={slot.teamCode}
                dup={slot}
                getFlag={getFlag}
                gap={i < rightSlots.length - 1 ? layout.cardGap : 0}
                layout={layout}
              />
            ) : (
              <OverflowCard
                key="overflow-r"
                count={overflowCount}
                gap={0}
                layout={layout}
              />
            )
          )}
        </div>
      </div>

      {/* ─── Footer ────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          background: GOLD,
          borderRadius: 20,
          padding: '22px 26px',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span
            style={{
              fontFamily: 'SpaceMono',
              fontWeight: 700,
              fontSize: 13,
              color: 'rgba(0,0,0,0.65)',
              letterSpacing: 3.5,
              lineHeight: 1,
            }}
          >
            VEJA MEU ALBUM COMPLETO
          </span>
          <span
            style={{
              fontFamily: 'BigShouldersDisplay',
              fontWeight: 900,
              fontSize: 42,
              color: '#000000',
              letterSpacing: -0.8,
              lineHeight: 1,
              marginTop: 6,
            }}
          >
            MEUALBUMCOPA26.VERCEL.APP
          </span>
          <span
            style={{
              fontFamily: 'SpaceMono',
              fontWeight: 700,
              fontSize: 12,
              color: 'rgba(0,0,0,0.55)',
              letterSpacing: 2.5,
              lineHeight: 1,
              marginTop: 10,
            }}
          >
            GRATIS · SEM CADASTRO · SEM ADS
          </span>
        </div>
        <div
          style={{
            marginLeft: 22,
            width: 200,
            height: 200,
            background: '#FFFFFF',
            borderRadius: 14,
            padding: 12,
            display: 'flex',
            flexShrink: 0,
            border: '2px solid #000000',
          }}
        >
          <img src={qrDataUri} alt="" width={176} height={176} style={{ display: 'flex' }} />
        </div>
      </div>
    </div>
  )
}

// ─── TeamCard ─────────────────────────────────────────────────

function TeamCard({
  dup,
  getFlag,
  gap,
  layout,
}: {
  dup: ShareImageDuplicate
  getFlag: FlagResolver
  gap: number
  layout: Layout
}) {
  const labelStr = dup.labels.join('  ·  ')

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: layout.cardHeight,
        background: BG_CARD,
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: gap,
        flexShrink: 0,
        padding: '0 14px',
      }}
    >
      {/* Bandeira pequena (ou badge especial pra FWC/CC) */}
      {dup.flagCode ? (
        <div
          style={{
            display: 'flex',
            width: layout.flagW,
            height: layout.flagH,
            borderRadius: 6,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.12)',
            flexShrink: 0,
          }}
        >
          <img
            src={getFlag(dup.flagCode)}
            alt=""
            width={layout.flagW}
            height={layout.flagH}
            style={{ display: 'flex', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <SpecialBadge code={dup.teamCode} width={layout.flagW} height={layout.flagH} />
      )}

      {/* Conteúdo */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: 14,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            fontFamily: 'BigShouldersDisplay',
            fontWeight: 900,
            fontSize: layout.nameSize,
            color: '#FFFFFF',
            letterSpacing: 0.3,
            lineHeight: 1,
          }}
        >
          {dup.teamName.toUpperCase()}
        </span>
        <span
          style={{
            fontFamily: 'SpaceMono',
            fontWeight: 700,
            fontSize: layout.labelSize,
            color: 'rgba(245,196,46,0.85)',
            letterSpacing: 0.5,
            marginTop: 7,
            lineHeight: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {labelStr}
        </span>
      </div>

      {/* Badge ×N */}
      <span
        style={{
          fontFamily: 'BigShouldersDisplay',
          fontWeight: 900,
          fontSize: layout.badgeSize,
          color: '#000000',
          background: GOLD,
          padding: '4px 9px',
          borderRadius: 5,
          lineHeight: 1,
          flexShrink: 0,
          marginLeft: 10,
        }}
      >
        ×{dup.totalExtras}
      </span>
    </div>
  )
}

// ─── OverflowCard ─────────────────────────────────────────────

function OverflowCard({
  count,
  gap,
  layout,
}: {
  count: number
  gap: number
  layout: Layout
}) {
  return (
    <div
      style={{
        display: 'flex',
        height: layout.cardHeight,
        background: 'rgba(245,196,46,0.08)',
        border: '1px solid rgba(245,196,46,0.30)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: gap,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'BigShouldersDisplay',
          fontWeight: 900,
          fontSize: layout.overflowSize,
          color: GOLD,
          letterSpacing: 2.5,
          lineHeight: 1,
        }}
      >
        + {count} SELECOES
      </span>
    </div>
  )
}
