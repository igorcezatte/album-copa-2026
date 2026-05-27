/* eslint-disable @next/next/no-img-element */
// JSX puro pra Satori/next/og. Layout vertical 1080px de largura, altura
// dinamica calculada pelo endpoint. Carro chefe de compartilhamento:
// 12 cards de grupo (4 times cada) + specials + repetidas + callout.
import { GROUPS, GROUP_COLORS } from '@/data/teams'
import type { FlagResolver } from '@/share-images/flags'
import type {
  ShareImagePayload,
  ShareImageTeam,
  ShareImageSpecial,
  ShareImageDuplicate,
} from '@/utils/shareImage'
import { SpecialBadge } from '@/share-images/specialBadges'

const GOLD = '#F5C42E'
const BG = '#06080F'
const BG_CARD = 'rgba(255,255,255,0.03)'
const BORDER = 'rgba(255,255,255,0.06)'
const APP_URL = 'meualbumcopa26.vercel.app'

// Render scale: o card é desenhado em base 1080 e renderizado nativamente
// nessa resolução. O 1.5x histórico existia pra proteger texto pequeno da
// recompressão JPEG do WhatsApp, mas o PDF wrap (imageBlobToPdfBlob)
// preserva o PNG intacto — WhatsApp não recomprime documentos PDF.
// Render em 1080 corta ~4x os pixels processados pelo Satori (de ~3.9M
// pra ~2M), derrubando o tempo de geração de ~5s pra ~1-2s.
export const RENDER_SCALE = 1
export const BASE_WIDTH = 1080

// Dimensoes FIXAS (em base 1080) pra alinhar todos os times e grupos uniformemente.
// Mantidas em sincronia com estimateCollectionHeight() em shareImage.ts.
const TEAM_ROW_HEIGHT = 82 // header 24 + mt 4 + 2 linhas mono ~36 + pad 14
const TEAM_ROW_GAP = 5
const GROUP_HEADER_H = 32 // 22 line + 10 marginBottom
const GROUP_PADDING = 12
const GROUP_BLOCK_HEIGHT =
  GROUP_PADDING * 2 +
  GROUP_HEADER_H +
  4 * TEAM_ROW_HEIGHT +
  3 * TEAM_ROW_GAP // 24 + 32 + 328 + 15 = 399
const GROUP_BLOCK_MARGIN = 12

interface Props {
  data: ShareImagePayload
  getFlag: FlagResolver
  /** Altura em base 1080 (sem aplicar RENDER_SCALE). Usada pelo wrapper
   *  externo pra dimensionar o canvas escalado. */
  baseHeight: number
}

interface GroupData {
  code: string
  color: string
  teams: ShareImageTeam[]
}

function buildGroups(teams: ShareImageTeam[]): GroupData[] {
  const map = new Map<string, ShareImageTeam[]>()
  for (const t of teams) {
    if (!map.has(t.group)) map.set(t.group, [])
    map.get(t.group)!.push(t)
  }
  return GROUPS.map((code) => ({
    code,
    color: GROUP_COLORS[code] ?? '#666666',
    teams: map.get(code) ?? [],
  }))
}

export function CollectionCard({ data, getFlag, baseHeight }: Props) {
  const pct = data.total > 0 ? data.collected / data.total : 0
  const pctLabel = `${Math.round(pct * 100)}%`
  const totalMissing =
    data.teams.reduce((a, t) => a + t.missing.length, 0) +
    data.specials.reduce((a, s) => a + s.missing.length, 0)

  const allGroups = buildGroups(data.teams)
  const half = Math.ceil(allGroups.length / 2)
  const leftGroups = allGroups.slice(0, half) // A-F
  const rightGroups = allGroups.slice(half) // G-L

  // Repetidas em 2 colunas
  const dupMid = Math.ceil(data.duplicates.length / 2)
  const leftDups = data.duplicates.slice(0, dupMid)
  const rightDups = data.duplicates.slice(dupMid)

  return (
    <div
      style={{
        width: BASE_WIDTH,
        height: baseHeight,
        background: BG,
        display: 'flex',
        flexDirection: 'column',
        padding: 48,
        fontFamily: 'SpaceMono',
        color: '#FFFFFF',
      }}
    >
      <Header data={data} pct={pct} pctLabel={pctLabel} totalMissing={totalMissing} />

      <SectionTitle title="FALTANTES" count={totalMissing} accent="neutral" />

      <div style={{ display: 'flex', width: '100%' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {leftGroups.map((g) => (
            <GroupBlock key={g.code} group={g} getFlag={getFlag} />
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 0, marginLeft: 16, display: 'flex', flexDirection: 'column' }}>
          {rightGroups.map((g) => (
            <GroupBlock key={g.code} group={g} getFlag={getFlag} />
          ))}
        </div>
      </div>

      {/* Especiais */}
      <div
        style={{
          marginTop: 22,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {data.specials.map((s, i) => (
          <SpecialBlock key={s.code} special={s} isFirst={i === 0} />
        ))}
      </div>

      {/* Repetidas — div column explicito (Fragment dentro de flex parent
          confunde o Satori: o SectionTitle e o grid das 2 cols ficavam no
          mesmo row, dividindo largura horizontalmente). */}
      {data.duplicates.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <SectionTitle title="REPETIDAS" count={data.totalDuplicates} accent="repetidas" />
          <div style={{ display: 'flex', width: '100%' }}>
            <DupColumn dups={leftDups} getFlag={getFlag} />
            <DupColumn dups={rightDups} getFlag={getFlag} marginLeft />
          </div>
        </div>
      )}

      {/* Footer callout — convite direto pra fazer o seu */}
      <div
        style={{
          marginTop: 36,
          padding: '32px 36px',
          background: GOLD,
          borderRadius: 22,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <span
          style={{
            fontFamily: 'SpaceMono',
            fontWeight: 700,
            fontSize: 14,
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
            fontSize: 64,
            color: '#000000',
            letterSpacing: -1,
            lineHeight: 1,
            marginTop: 8,
          }}
        >
          {APP_URL.toUpperCase()}
        </span>
        <span
          style={{
            fontFamily: 'SpaceMono',
            fontWeight: 700,
            fontSize: 14,
            color: 'rgba(0,0,0,0.7)',
            letterSpacing: 1.5,
            lineHeight: 1.3,
            marginTop: 14,
          }}
        >
          Organize a coleção · Marque faltantes · Encontre trocas
        </span>
        <span
          style={{
            fontFamily: 'SpaceMono',
            fontWeight: 700,
            fontSize: 13,
            color: 'rgba(0,0,0,0.55)',
            letterSpacing: 3,
            lineHeight: 1,
            marginTop: 14,
          }}
        >
          GRÁTIS · SEM CADASTRO · SEM ADS
        </span>
      </div>
    </div>
  )
}

// ─── Header ──────────────────────────────────────────────────

function Header({
  data,
  pct,
  pctLabel,
  totalMissing,
}: {
  data: ShareImagePayload
  pct: number
  pctLabel: string
  totalMissing: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            width: 6,
            height: 30,
            background: GOLD,
            marginRight: 14,
            display: 'flex',
          }}
        />
        <span
          style={{
            fontFamily: 'BigShouldersDisplay',
            fontWeight: 900,
            fontSize: 30,
            color: GOLD,
            letterSpacing: 2,
            lineHeight: 1,
          }}
        >
          ÁLBUM COPA 2026
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: 'SpaceMono',
            fontWeight: 700,
            fontSize: 14,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: 3,
          }}
        >
          PANINI · BRASIL
        </span>
      </div>

      <span
        style={{
          fontFamily: 'BigShouldersDisplay',
          fontWeight: 900,
          fontSize: 48,
          color: '#FFFFFF',
          letterSpacing: -0.5,
          lineHeight: 1,
          marginTop: 18,
        }}
      >
        MINHA COLEÇÃO
      </span>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          marginTop: 14,
        }}
      >
        <span
          style={{
            fontFamily: 'BigShouldersDisplay',
            fontWeight: 900,
            fontSize: 140,
            lineHeight: 0.85,
            color: '#FFFFFF',
            letterSpacing: -1.5,
          }}
        >
          {data.collected}
        </span>
        <span
          style={{
            fontFamily: 'BigShouldersDisplay',
            fontWeight: 900,
            fontSize: 64,
            lineHeight: 1,
            color: 'rgba(255,255,255,0.32)',
            marginLeft: 10,
            marginBottom: 6,
          }}
        >
          / {data.total}
        </span>
        <div
          style={{
            marginLeft: 'auto',
            marginBottom: 8,
            padding: '8px 16px',
            background: GOLD,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'BigShouldersDisplay',
              fontWeight: 900,
              fontSize: 44,
              color: '#000000',
              lineHeight: 1,
              letterSpacing: -1,
            }}
          >
            {pctLabel}
          </span>
        </div>
      </div>

      <span
        style={{
          fontFamily: 'SpaceMono',
          fontWeight: 700,
          fontSize: 15,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: 3,
          marginTop: 10,
        }}
      >
        {data.completedTeams} COMPLETAS · {totalMissing} FALTANTES ·{' '}
        {data.totalDuplicates} REPETIDAS
      </span>

      <div
        style={{
          marginTop: 14,
          width: '100%',
          height: 8,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 4,
          display: 'flex',
        }}
      >
        <div
          style={{
            width: `${pct * 100}%`,
            background: GOLD,
            borderRadius: 4,
            display: 'flex',
          }}
        />
      </div>
    </div>
  )
}

// ─── Section title ───────────────────────────────────────────

function SectionTitle({
  title,
  count,
  accent = 'neutral',
}: {
  title: string
  count: number
  accent?: 'neutral' | 'repetidas'
}) {
  // textColor e badgeBorder separados pra evitar concat de alpha hex em
  // rgba() (CSS invalido em Satori, quebra a geracao).
  const isRep = accent === 'repetidas'
  const accentColor = isRep ? GOLD : 'rgba(255,255,255,0.7)'
  const badgeBg = isRep ? 'rgba(245,196,46,0.15)' : 'rgba(255,255,255,0.06)'
  const badgeBorder = isRep ? 'rgba(245,196,46,0.55)' : 'rgba(255,255,255,0.3)'
  const badgeText = isRep ? GOLD : '#FFFFFF'
  return (
    <div
      style={{
        marginTop: 36,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* divisor acima pra abrir a secao */}
      <div
        style={{
          width: '100%',
          height: 2,
          background: 'rgba(255,255,255,0.08)',
          display: 'flex',
        }}
      />
      <div
        style={{
          marginTop: 18,
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 8,
              height: 42,
              background: accentColor,
              marginRight: 16,
              display: 'flex',
            }}
          />
          <span
            style={{
              fontFamily: 'BigShouldersDisplay',
              fontWeight: 900,
              fontSize: 46,
              color: '#FFFFFF',
              letterSpacing: -0.5,
              lineHeight: 1,
            }}
          >
            {title}
          </span>
        </div>
        <div
          style={{
            padding: '8px 18px',
            background: badgeBg,
            border: `2px solid ${badgeBorder}`,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'BigShouldersDisplay',
              fontWeight: 900,
              fontSize: 34,
              color: badgeText,
              lineHeight: 1,
              letterSpacing: -0.5,
            }}
          >
            {count}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── GroupBlock ──────────────────────────────────────────────

function GroupBlock({ group, getFlag }: { group: GroupData; getFlag: FlagResolver }) {
  const collected = group.teams.reduce((a, t) => a + t.collected, 0)
  const total = group.teams.reduce((a, t) => a + t.total, 0)
  const allComplete = total > 0 && collected === total

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: GROUP_PADDING,
        marginBottom: GROUP_BLOCK_MARGIN,
        height: GROUP_BLOCK_HEIGHT,
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${group.color}55`,
        borderRadius: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 10,
          paddingLeft: 2,
        }}
      >
        <div
          style={{
            width: 4,
            height: 22,
            background: group.color,
            marginRight: 10,
            display: 'flex',
          }}
        />
        <span
          style={{
            fontFamily: 'BigShouldersDisplay',
            fontWeight: 900,
            fontSize: 22,
            color: group.color,
            letterSpacing: 3,
            lineHeight: 1,
          }}
        >
          GRUPO {group.code}
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: 'SpaceMono',
            fontWeight: 700,
            fontSize: 14,
            color: allComplete ? '#4ade80' : 'rgba(255,255,255,0.5)',
            letterSpacing: 2,
            lineHeight: 1,
          }}
        >
          {collected}/{total}
        </span>
      </div>
      {group.teams.map((t) => (
        <TeamRow key={t.code} team={t} getFlag={getFlag} />
      ))}
    </div>
  )
}

// ─── TeamRow ─────────────────────────────────────────────────

function TeamRow({ team, getFlag }: { team: ShareImageTeam; getFlag: FlagResolver }) {
  const complete = team.total > 0 && team.collected === team.total
  const missingStr = team.missing.map((n) => n.padStart(2, '0')).join(' · ')

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '6px 10px',
        marginBottom: TEAM_ROW_GAP,
        height: TEAM_ROW_HEIGHT,
        background: BG_CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={getFlag(team.flagCode)}
          alt=""
          width={32}
          height={22}
          style={{
            display: 'flex',
            borderRadius: 3,
            objectFit: 'cover',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: 10,
            flex: 1,
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              fontFamily: 'BigShouldersDisplay',
              fontWeight: 900,
              fontSize: 19,
              color: '#FFFFFF',
              letterSpacing: 0.3,
              lineHeight: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {team.name.toUpperCase()}
          </span>
        </div>
        {complete ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '3px 8px',
              borderRadius: 5,
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.4)',
            }}
          >
            <span
              style={{
                fontFamily: 'SpaceMono',
                fontWeight: 700,
                fontSize: 11,
                color: '#4ade80',
                letterSpacing: 1.5,
              }}
            >
              COMPLETO
            </span>
          </div>
        ) : (
          <span
            style={{
              fontFamily: 'BigShouldersDisplay',
              fontWeight: 900,
              fontSize: 17,
              color: '#ff8a8a',
              letterSpacing: 0,
              padding: '3px 8px',
              background: 'rgba(255,138,138,0.12)',
              borderRadius: 5,
              lineHeight: 1,
            }}
          >
            -{team.missing.length}
          </span>
        )}
      </div>

      {!complete && team.missing.length > 0 && (
        // Linha unica de numeros mono separados por ` · ` (estilo PDF).
        // Mais legivel que badges separados, e o wrap natural do texto e
        // muito mais robusto que flexWrap de filhos no Satori.
        <div
          style={{
            marginTop: 4,
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              fontFamily: 'SpaceMono',
              fontWeight: 700,
              fontSize: 14,
              color: 'rgba(255,255,255,0.78)',
              letterSpacing: 0.5,
              lineHeight: 1.25,
            }}
          >
            {missingStr}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Bloco especial (FWC/CC) ─────────────────────────────────

function SpecialBlock({
  special,
  isFirst,
}: {
  special: ShareImageSpecial
  isFirst: boolean
}) {
  const complete = special.total > 0 && special.collected === special.total
  const prefix = special.code
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 16px',
        marginTop: isFirst ? 0 : 8,
        background: BG_CARD,
        border: `1px solid ${special.color}33`,
        borderRadius: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <SpecialBadge code={special.code} width={42} height={30} />
        <span
          style={{
            marginLeft: 12,
            fontFamily: 'BigShouldersDisplay',
            fontWeight: 900,
            fontSize: 24,
            color: '#FFFFFF',
            letterSpacing: 0.5,
            lineHeight: 1,
          }}
        >
          {special.name.toUpperCase()}
        </span>
        <span
          style={{
            marginLeft: 10,
            fontFamily: 'SpaceMono',
            fontWeight: 700,
            fontSize: 13,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: 2,
            lineHeight: 1,
          }}
        >
          ({special.code})
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: 'BigShouldersDisplay',
            fontWeight: 900,
            fontSize: 22,
            color: complete ? '#4ade80' : special.color,
            lineHeight: 1,
          }}
        >
          {special.collected}/{special.total}
        </span>
      </div>

      {complete ? (
        <span
          style={{
            marginTop: 6,
            fontFamily: 'SpaceMono',
            fontWeight: 700,
            fontSize: 13,
            color: '#4ade80',
            letterSpacing: 2,
          }}
        >
          SEÇÃO COMPLETA
        </span>
      ) : (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            marginTop: 8,
            width: '100%',
          }}
        >
          {special.missing.map((n) => (
            <span
              key={n}
              style={{
                fontFamily: 'SpaceMono',
                fontWeight: 700,
                fontSize: 14,
                color: 'rgba(255,255,255,0.85)',
                background: `${special.color}14`,
                border: `1px solid ${special.color}40`,
                borderRadius: 5,
                padding: '3px 8px',
                marginRight: 4,
                marginTop: 4,
                letterSpacing: 0.5,
                lineHeight: 1,
                display: 'flex',
                flexShrink: 0,
              }}
            >
              {prefix}
              {n}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Repetidas ───────────────────────────────────────────────

function DupColumn({
  dups,
  getFlag,
  marginLeft,
}: {
  dups: ShareImageDuplicate[]
  getFlag: FlagResolver
  marginLeft?: boolean
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        marginLeft: marginLeft ? 16 : 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {dups.map((d) => (
        <DupRow key={d.teamCode} dup={d} getFlag={getFlag} />
      ))}
    </div>
  )
}

function DupRow({ dup, getFlag }: { dup: ShareImageDuplicate; getFlag: FlagResolver }) {
  const labelsStr = dup.labels.join(' · ')
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 10px',
        marginBottom: 5,
        background: BG_CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {dup.flagCode ? (
          <img
            src={getFlag(dup.flagCode)}
            alt=""
            width={32}
            height={22}
            style={{
              display: 'flex',
              borderRadius: 3,
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              width: 32,
              height: 22,
              borderRadius: 4,
              background: dup.primaryColor,
              display: 'flex',
            }}
          />
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: 10,
            flex: 1,
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              fontFamily: 'BigShouldersDisplay',
              fontWeight: 900,
              fontSize: 19,
              color: '#FFFFFF',
              letterSpacing: 0.3,
              lineHeight: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {dup.teamName.toUpperCase()}
          </span>
        </div>
        <span
          style={{
            fontFamily: 'BigShouldersDisplay',
            fontWeight: 900,
            fontSize: 17,
            color: GOLD,
            lineHeight: 1,
            padding: '3px 8px',
            background: 'rgba(245,196,46,0.12)',
            borderRadius: 5,
          }}
        >
          +{dup.totalExtras}
        </span>
      </div>
      {/* Labels em linha unica mono (mesmo padrao do TeamRow) */}
      <div style={{ marginTop: 4, display: 'flex', overflow: 'hidden' }}>
        <span
          style={{
            fontFamily: 'SpaceMono',
            fontWeight: 700,
            fontSize: 14,
            color: 'rgba(245,196,46,0.9)',
            letterSpacing: 0.5,
            lineHeight: 1.25,
          }}
        >
          {labelsStr}
        </span>
      </div>
    </div>
  )
}
