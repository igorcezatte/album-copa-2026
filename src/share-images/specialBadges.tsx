// Badges para seções especiais (FWC e CC) usados em share-images.
// Substituem a bandeira de país quando a "team" é FWC ou Coca-Cola — antes
// ficava placeholder vazio, agora identifica visualmente a seção.
//
// Renderizado por Satori (next/og). Fontes BigShouldersDisplay 900 estão
// bundleadas, então o texto não dispara fetch externo.

const GOLD = '#F5C42E'
const COCA_RED = '#E8222A'

interface BadgeProps {
  width: number
  height: number
}

export function FwcBadge({ width, height }: BadgeProps) {
  // Bandeira dourada com "FWC" preto bold. Fonte ~55% da altura pra caber
  // em qualquer tamanho de card (pequeno em compact, grande em spacious).
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height,
        background: GOLD,
        borderRadius: 6,
        border: '1px solid rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'BigShouldersDisplay',
          fontWeight: 900,
          fontSize: Math.round(height * 0.55),
          color: '#000000',
          letterSpacing: 1.5,
          lineHeight: 1,
        }}
      >
        FWC
      </span>
    </div>
  )
}

export function CcBadge({ width, height }: BadgeProps) {
  // Fundo Coca-Cola red com "CC" branco. Versão simplificada (sem o ribbon
  // literal/script) pra evitar uso do logo registrado.
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height,
        background: COCA_RED,
        borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.15)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'BigShouldersDisplay',
          fontWeight: 900,
          fontSize: Math.round(height * 0.6),
          color: '#FFFFFF',
          letterSpacing: 1.5,
          lineHeight: 1,
        }}
      >
        CC
      </span>
    </div>
  )
}

export function SpecialBadge({ code, width, height }: BadgeProps & { code: string }) {
  if (code === 'FWC') return <FwcBadge width={width} height={height} />
  if (code === 'CC') return <CcBadge width={width} height={height} />
  return null
}
