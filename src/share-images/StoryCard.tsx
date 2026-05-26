/* eslint-disable @next/next/no-img-element */
// Card 9:16 (1080×1920) otimizado pra Instagram Stories. Foco em
// divulgação do app: stats agregadas (sem números faltantes específicos)
// + grid de bandeiras + footer PROTAGONISTA com URL gigante e QR code.
//
// Pipeline: PNG direto (sem PDF wrap) — Stories aceita PNG e não recomprime.
import type {
  ShareImageDuplicate,
  ShareImagePayload,
  ShareImageTeam,
} from '@/utils/shareImage'
import type { FlagResolver } from '@/share-images/flags'

const GOLD = '#F5C42E'
const BG = '#06080F'
const BG_CARD = '#0E1220'
const APP_URL = 'meualbumcopa26.vercel.app'

export const STORY_WIDTH = 1080
export const STORY_HEIGHT = 1920

interface Props {
  data: ShareImagePayload
  getFlag: FlagResolver
  qrDataUri: string
}

export function StoryCard({ data, getFlag, qrDataUri }: Props) {
  const pct = data.total > 0 ? data.collected / data.total : 0
  const pctLabel = `${Math.round(pct * 100)}%`
  const completedCount = data.completedTeams
  const specialsCollected = data.specials.reduce((a, s) => a + s.collected, 0)
  const specialsTotal = data.specials.reduce((a, s) => a + s.total, 0)

  return (
    <div
      style={{
        width: STORY_WIDTH,
        height: STORY_HEIGHT,
        background: BG,
        display: 'flex',
        flexDirection: 'column',
        padding: 56,
        fontFamily: 'SpaceMono',
        color: '#FFFFFF',
      }}
    >
      {/* ─── Header ─────────────────────────────────────────── */}
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
            ÁLBUM COPA 2026
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
          PANINI · BRASIL
        </span>
      </div>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: 'BigShouldersDisplay',
            fontWeight: 900,
            fontSize: 56,
            color: '#FFFFFF',
            letterSpacing: -0.5,
            lineHeight: 1,
          }}
        >
          MINHA COLEÇÃO
        </span>
        <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 18 }}>
          <span
            style={{
              fontFamily: 'BigShouldersDisplay',
              fontWeight: 900,
              fontSize: 240,
              lineHeight: 0.82,
              color: '#FFFFFF',
              letterSpacing: -3,
            }}
          >
            {data.collected}
          </span>
          <span
            style={{
              fontFamily: 'BigShouldersDisplay',
              fontWeight: 900,
              fontSize: 96,
              lineHeight: 1,
              color: 'rgba(255,255,255,0.32)',
              marginLeft: 16,
              marginBottom: 12,
            }}
          >
            / {data.total}
          </span>
          <div
            style={{
              marginLeft: 'auto',
              marginBottom: 16,
              padding: '12px 22px',
              background: GOLD,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'BigShouldersDisplay',
                fontWeight: 900,
                fontSize: 64,
                color: '#000000',
                lineHeight: 1,
                letterSpacing: -1.5,
              }}
            >
              {pctLabel}
            </span>
          </div>
        </div>
        {/* Barra de progresso */}
        <div
          style={{
            marginTop: 24,
            width: '100%',
            height: 12,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 6,
            display: 'flex',
          }}
        >
          <div
            style={{
              width: `${pct * 100}%`,
              background: GOLD,
              borderRadius: 6,
              display: 'flex',
            }}
          />
        </div>
      </div>

      {/* ─── Stats (3 cards) ────────────────────────────────── */}
      <div style={{ marginTop: 38, display: 'flex' }}>
        <StatCard label="SELEÇÕES" value={String(completedCount)} suffix="/ 48" sublabel="COMPLETAS" />
        <StatCard
          label="ESPECIAIS"
          value={String(specialsCollected)}
          suffix={`/ ${specialsTotal}`}
          sublabel="FWC + CC"
          marginLeft
        />
        <StatCard
          label="REPETIDAS"
          value={String(data.totalDuplicates)}
          sublabel="PRA TROCA"
          accent
          marginLeft
        />
      </div>

      {/* ─── Section: 48 Seleções ───────────────────────────── */}
      <div
        style={{
          marginTop: 40,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'BigShouldersDisplay',
            fontWeight: 900,
            fontSize: 22,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: 5,
          }}
        >
          48 SELEÇÕES
        </span>
        <span
          style={{
            fontFamily: 'SpaceMono',
            fontWeight: 700,
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: 2.5,
          }}
        >
          {completedCount} COMPLETAS · {data.teams.length - completedCount} EM ANDAMENTO
        </span>
      </div>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column' }}>
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <div
            key={row}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: row < 5 ? 14 : 0,
            }}
          >
            {data.teams.slice(row * 8, row * 8 + 8).map((team) => (
              <FlagCell key={team.code} team={team} getFlag={getFlag} />
            ))}
          </div>
        ))}
      </div>

      {/* ─── Repetidas pra troca ────────────────────────────── */}
      {data.duplicates.length > 0 && (
        <DuplicatesSection duplicates={data.duplicates} totalDuplicates={data.totalDuplicates} />
      )}

      {/* ─── Footer compacto ────────────────────────────────── */}
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
            FAÇA O SEU TAMBÉM
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
            GRÁTIS · SEM CADASTRO · SEM ADS
          </span>
        </div>

        {/* QR code à direita */}
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
          <img
            src={qrDataUri}
            alt=""
            width={176}
            height={176}
            style={{ display: 'flex' }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────

function StatCard({
  label,
  value,
  suffix,
  sublabel,
  marginLeft,
  accent,
}: {
  label: string
  value: string
  suffix?: string
  sublabel: string
  marginLeft?: boolean
  accent?: boolean
}) {
  return (
    <div
      style={{
        flex: 1,
        marginLeft: marginLeft ? 14 : 0,
        padding: '20px 22px',
        background: accent ? `rgba(245,196,46,0.10)` : BG_CARD,
        border: accent
          ? `1px solid rgba(245,196,46,0.40)`
          : `1px solid rgba(255,255,255,0.06)`,
        borderRadius: 18,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <span
        style={{
          fontFamily: 'SpaceMono',
          fontWeight: 700,
          fontSize: 12,
          color: accent ? GOLD : 'rgba(255,255,255,0.45)',
          letterSpacing: 3,
          lineHeight: 1,
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 12 }}>
        <span
          style={{
            fontFamily: 'BigShouldersDisplay',
            fontWeight: 900,
            fontSize: 72,
            color: accent ? GOLD : '#FFFFFF',
            lineHeight: 0.9,
            letterSpacing: -1.5,
          }}
        >
          {value}
        </span>
        {suffix && (
          <span
            style={{
              fontFamily: 'BigShouldersDisplay',
              fontWeight: 900,
              fontSize: 26,
              color: 'rgba(255,255,255,0.32)',
              marginLeft: 6,
              lineHeight: 1,
            }}
          >
            {suffix}
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: 'SpaceMono',
          fontWeight: 700,
          fontSize: 11,
          color: 'rgba(255,255,255,0.40)',
          letterSpacing: 2,
          marginTop: 10,
          lineHeight: 1,
        }}
      >
        {sublabel}
      </span>
    </div>
  )
}

// ─── FlagCell ─────────────────────────────────────────────────

function FlagCell({ team, getFlag }: { team: ShareImageTeam; getFlag: FlagResolver }) {
  const pct = team.total > 0 ? team.collected / team.total : 0
  const complete = pct === 1
  const zero = pct === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 100 }}>
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: 84,
          height: 60,
          borderRadius: 6,
          overflow: 'hidden',
          border: complete ? `2px solid ${GOLD}` : '1px solid rgba(255,255,255,0.12)',
          opacity: zero ? 0.32 : 1,
        }}
      >
        <img
          src={getFlag(team.flagCode)}
          alt=""
          width={84}
          height={60}
          style={{
            display: 'flex',
            objectFit: 'cover',
            filter: zero ? 'grayscale(1)' : 'none',
          }}
        />
        {complete && (
          <div
            style={{
              position: 'absolute',
              right: 3,
              bottom: 3,
              width: 22,
              height: 22,
              background: GOLD,
              borderRadius: 11,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: 'flex' }}
            >
              <path d="M5 12l5 5L19 7" />
            </svg>
          </div>
        )}
      </div>
      <div
        style={{
          marginTop: 6,
          width: 84,
          height: 3,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 1.5,
          display: 'flex',
        }}
      >
        {pct > 0 && (
          <div
            style={{
              width: `${pct * 100}%`,
              background: complete ? GOLD : 'rgba(255,255,255,0.55)',
              borderRadius: 1.5,
              display: 'flex',
            }}
          />
        )}
      </div>
    </div>
  )
}

// ─── Repetidas pra troca ─────────────────────────────────────
//
// Lista compacta em 2 colunas. Se houver mais que MAX_DUP_ROWS entradas,
// a última vira "+N OUTRAS" — objetivo é dar pra um amigo bater o olho
// e ver o que tem disponível pra trocar, sem virar parede de texto.
const MAX_DUP_ROWS = 10

function DuplicatesSection({
  duplicates,
  totalDuplicates,
}: {
  duplicates: ShareImageDuplicate[]
  totalDuplicates: number
}) {
  const hasOverflow = duplicates.length > MAX_DUP_ROWS
  const visibleCount = hasOverflow ? MAX_DUP_ROWS - 1 : duplicates.length
  const visible = duplicates.slice(0, visibleCount)
  const overflow = duplicates.length - visible.length
  const half = Math.ceil(visible.length / 2)
  const leftCol = visible.slice(0, half)
  const rightCol = visible.slice(half)

  return (
    <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'BigShouldersDisplay',
            fontWeight: 900,
            fontSize: 22,
            color: GOLD,
            letterSpacing: 4,
            lineHeight: 1,
          }}
        >
          REPETIDAS PRA TROCA
        </span>
        <span
          style={{
            fontFamily: 'SpaceMono',
            fontWeight: 700,
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: 2,
          }}
        >
          {totalDuplicates} TOTAL · {duplicates.length} SELEÇÕES
        </span>
      </div>

      <div style={{ marginTop: 12, display: 'flex' }}>
        <DupColumn rows={leftCol} />
        <div style={{ flex: 1, marginLeft: 16, display: 'flex', flexDirection: 'column' }}>
          {rightCol.map((d, i) => (
            <DupRow key={d.teamCode + ':' + i} dup={d} />
          ))}
          {hasOverflow && (
            <div
              style={{
                marginTop: 0,
                padding: '8px 12px',
                background: 'rgba(245,196,46,0.10)',
                border: '1px solid rgba(245,196,46,0.30)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'BigShouldersDisplay',
                  fontWeight: 900,
                  fontSize: 16,
                  color: GOLD,
                  letterSpacing: 2,
                  lineHeight: 1,
                }}
              >
                + {overflow} OUTRAS SELEÇÕES
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DupColumn({ rows }: { rows: ShareImageDuplicate[] }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {rows.map((d, i) => (
        <DupRow key={d.teamCode + ':' + i} dup={d} />
      ))}
    </div>
  )
}

function DupRow({ dup }: { dup: ShareImageDuplicate }) {
  // Layout horizontal compacto: nome | labels mono | badge +N.
  // overflow:hidden + nowrap evita que muitas labels deformem o grid.
  const labelStr = dup.labels.join(' · ')
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 10px',
        marginBottom: 6,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          fontFamily: 'BigShouldersDisplay',
          fontWeight: 900,
          fontSize: 17,
          color: '#FFFFFF',
          letterSpacing: 0.3,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {dup.teamName.toUpperCase()}
      </span>
      <span
        style={{
          fontFamily: 'SpaceMono',
          fontWeight: 700,
          fontSize: 13,
          color: 'rgba(245,196,46,0.9)',
          letterSpacing: 0.5,
          lineHeight: 1,
          marginLeft: 10,
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {labelStr}
      </span>
      <span
        style={{
          fontFamily: 'BigShouldersDisplay',
          fontWeight: 900,
          fontSize: 14,
          color: GOLD,
          lineHeight: 1,
          padding: '3px 7px',
          background: 'rgba(245,196,46,0.12)',
          borderRadius: 4,
          marginLeft: 10,
          flexShrink: 0,
        }}
      >
        +{dup.totalExtras}
      </span>
    </div>
  )
}
