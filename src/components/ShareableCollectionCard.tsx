'use client'

/**
 * Card visual otimizado pra captura em PNG. Largura fixa (1080px) pra
 * resultado consistente entre devices. Inline styles propositais — evita
 * que CSS variables / Tailwind do app afetem a captura.
 */

const CARD_WIDTH = 1080
const PADDING = 60
const APP_URL = 'meualbumcopa26.vercel.app'

export interface ShareableData {
  collected: number
  total: number
  teamsMissing: Array<{
    teamName: string
    flagCode: string
    missing: string[]
  }>
  specialsMissing: Array<{
    name: string
    icon: string
    missing: string[]
  }>
  duplicates: Array<{
    teamCode: string
    teamName: string
    flagCode: string
    number: string
    extras: number
  }>
}

function flagEmoji(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return '🏳️'
  const cp = (c: string) => 0x1f1e6 + c.charCodeAt(0) - 65
  return Array.from(iso2.toUpperCase())
    .map((c) => String.fromCodePoint(cp(c)))
    .join('')
}

interface Props {
  data: ShareableData
}

export function ShareableCollectionCard({ data }: Props) {
  const { collected, total, teamsMissing, specialsMissing, duplicates } = data
  const pct = total > 0 ? Math.round((collected / total) * 100) : 0
  const totalMissing =
    teamsMissing.reduce((acc, t) => acc + t.missing.length, 0) +
    specialsMissing.reduce((acc, s) => acc + s.missing.length, 0)
  const totalDuplicates = duplicates.reduce((acc, d) => acc + d.extras, 0)

  const teamsWithStickers = teamsMissing.filter((t) => t.missing.length > 0)
  const specialsWithStickers = specialsMissing.filter((s) => s.missing.length > 0)

  return (
    <div
      style={{
        width: CARD_WIDTH,
        background: 'linear-gradient(180deg, #0a1226 0%, #060a14 100%)',
        padding: PADDING,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        color: '#f1f5f9',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 30,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #f5c42e, #d4a017)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 28,
                color: '#000',
              }}
            >
              26
            </div>
            <div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  lineHeight: 1,
                  color: '#fff',
                }}
              >
                Álbum Copa 2026
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: 'rgba(255,255,255,0.45)',
                  marginTop: 4,
                }}
              >
                Minha coleção
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1,
            color: '#f5c42e',
          }}
        >
          {pct}%
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 40, fontWeight: 900, color: '#fff' }}>
            {collected}
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 28 }}>
              /{total}
            </span>
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>
            figurinhas
          </div>
        </div>
        <div
          style={{
            width: '100%',
            height: 14,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 7,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              background:
                pct === 100
                  ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                  : 'linear-gradient(90deg, #f5c42ecc, #f5c42e)',
              borderRadius: 7,
            }}
          />
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: 'rgba(255,255,255,0.08)',
          marginBottom: 30,
        }}
      />

      {/* Faltantes */}
      {totalMissing > 0 && (
        <div style={{ marginBottom: 30 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: '#ef4444',
              marginBottom: 16,
              letterSpacing: 0.5,
            }}
          >
            ❌ Faltam {totalMissing}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {teamsWithStickers.map((t) => (
              <div
                key={t.teamName}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>
                  {flagEmoji(t.flagCode)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: 4,
                    }}
                  >
                    {t.teamName}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: 'ui-monospace, Menlo, monospace',
                      letterSpacing: 1,
                    }}
                  >
                    {t.missing.join(', ')}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: '#ef4444',
                    background: 'rgba(239,68,68,0.12)',
                    padding: '4px 10px',
                    borderRadius: 999,
                    flexShrink: 0,
                  }}
                >
                  -{t.missing.length}
                </div>
              </div>
            ))}
            {specialsWithStickers.map((s) => (
              <div
                key={s.name}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(245,196,46,0.05)',
                  border: '1px solid rgba(245,196,46,0.15)',
                }}
              >
                <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: 4,
                    }}
                  >
                    {s.name}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: 'ui-monospace, Menlo, monospace',
                      letterSpacing: 1,
                    }}
                  >
                    {s.missing.join(', ')}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: '#f5c42e',
                    background: 'rgba(245,196,46,0.12)',
                    padding: '4px 10px',
                    borderRadius: 999,
                    flexShrink: 0,
                  }}
                >
                  -{s.missing.length}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      {totalMissing > 0 && totalDuplicates > 0 && (
        <div
          style={{
            height: 1,
            background: 'rgba(255,255,255,0.08)',
            marginBottom: 30,
          }}
        />
      )}

      {/* Repetidas */}
      {totalDuplicates > 0 && (
        <div style={{ marginBottom: 30 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: '#f5c42e',
              marginBottom: 16,
              letterSpacing: 0.5,
            }}
          >
            ♻️ Repetidas {totalDuplicates}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
            }}
          >
            {duplicates.map((d) => (
              <div
                key={`${d.teamCode}_${d.number}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: 'rgba(245,196,46,0.05)',
                  border: '1px solid rgba(245,196,46,0.15)',
                }}
              >
                <div style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>
                  {flagEmoji(d.flagCode)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    {d.teamName}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.45)',
                      fontFamily: 'ui-monospace, Menlo, monospace',
                    }}
                  >
                    #{d.number}
                    {d.extras > 1 ? ` · ×${d.extras}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: 40,
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#f5c42e',
            fontFamily: 'ui-monospace, Menlo, monospace',
          }}
        >
          📲 {APP_URL}
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.25)',
          }}
        >
          FIFA World Cup
        </div>
      </div>
    </div>
  )
}
