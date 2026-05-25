/* eslint-disable @next/next/no-img-element */
// Card 9:16 (1080×1920) otimizado pra Instagram Stories. Foco em
// divulgação do app: stats agregadas (sem números faltantes específicos)
// + grid de bandeiras + footer PROTAGONISTA com URL gigante e QR code.
//
// Pipeline: PNG direto (sem PDF wrap) — Stories aceita PNG e não recomprime.
import type { ShareImagePayload, ShareImageTeam } from '@/utils/shareImage'
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
          — 48 SELEÇÕES
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

      {/* ─── Footer PROTAGONISTA ────────────────────────────── */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          background: GOLD,
          borderRadius: 24,
          padding: '30px 32px',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span
            style={{
              fontFamily: 'SpaceMono',
              fontWeight: 700,
              fontSize: 15,
              color: 'rgba(0,0,0,0.65)',
              letterSpacing: 4,
              lineHeight: 1,
            }}
          >
            FAÇA O SEU TAMBÉM
          </span>
          <span
            style={{
              fontFamily: 'BigShouldersDisplay',
              fontWeight: 900,
              fontSize: 92,
              color: '#000000',
              letterSpacing: -2,
              lineHeight: 0.88,
              marginTop: 8,
            }}
          >
            MEUALBUM
          </span>
          <span
            style={{
              fontFamily: 'BigShouldersDisplay',
              fontWeight: 900,
              fontSize: 92,
              color: '#000000',
              letterSpacing: -2,
              lineHeight: 0.88,
            }}
          >
            COPA26
          </span>
          <span
            style={{
              fontFamily: 'BigShouldersDisplay',
              fontWeight: 900,
              fontSize: 42,
              color: 'rgba(0,0,0,0.55)',
              letterSpacing: -0.5,
              lineHeight: 1,
              marginTop: 4,
            }}
          >
            .VERCEL.APP
          </span>
          <span
            style={{
              fontFamily: 'SpaceMono',
              fontWeight: 700,
              fontSize: 13,
              color: 'rgba(0,0,0,0.7)',
              letterSpacing: 2.5,
              lineHeight: 1,
              marginTop: 18,
            }}
          >
            GRÁTIS · SEM CADASTRO · SEM ADS
          </span>
        </div>

        {/* QR code à direita */}
        <div
          style={{
            marginLeft: 28,
            width: 300,
            height: 300,
            background: '#FFFFFF',
            borderRadius: 18,
            padding: 16,
            display: 'flex',
            flexShrink: 0,
            border: '3px solid #000000',
          }}
        >
          <img
            src={qrDataUri}
            alt=""
            width={268}
            height={268}
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
            <span
              style={{
                color: '#000000',
                fontSize: 15,
                fontWeight: 900,
                fontFamily: 'BigShouldersDisplay',
                lineHeight: 1,
              }}
            >
              ✓
            </span>
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
