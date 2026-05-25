import { ImageResponse } from 'next/og'
import {
  BASE_WIDTH,
  CollectionCard,
  RENDER_SCALE,
} from '@/share-images/CollectionCard'
import { StoryCard, STORY_HEIGHT, STORY_WIDTH } from '@/share-images/StoryCard'
import { loadShareFonts } from '@/share-images/fonts'
import { loadFlags, makeFlagResolver } from '@/share-images/flags'
import { loadQrDataUri } from '@/share-images/qr'
import {
  estimateCollectionHeight,
  type ShareImagePayload,
} from '@/utils/shareImage'

export const runtime = 'edge'

const APP_URL = 'https://meualbumcopa26.vercel.app'

function isValidPayload(v: unknown): v is ShareImagePayload {
  if (!v || typeof v !== 'object') return false
  const p = v as Record<string, unknown>
  return (
    typeof p.collected === 'number' &&
    typeof p.total === 'number' &&
    typeof p.completedTeams === 'number' &&
    typeof p.totalDuplicates === 'number' &&
    Array.isArray(p.teams) &&
    Array.isArray(p.specials) &&
    Array.isArray(p.duplicates)
  )
}

function collectFlagCodes(p: ShareImagePayload): string[] {
  const codes: string[] = []
  for (const t of p.teams) if (t.flagCode) codes.push(t.flagCode)
  for (const d of p.duplicates) if (d.flagCode) codes.push(d.flagCode)
  return codes
}

export async function POST(req: Request): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response('invalid json', { status: 400 })
  }
  if (!isValidPayload(body)) {
    return new Response('invalid payload', { status: 400 })
  }

  const format = body.format ?? 'card'

  // Fontes são síncronas (bundleadas inline). Bandeiras e QR em paralelo
  // por rede — sem isso, Satori faria fetches sequenciais durante o render.
  const fonts = loadShareFonts()
  const [flagMap, qrDataUri] = await Promise.all([
    loadFlags(collectFlagCodes(body)),
    format === 'story' ? loadQrDataUri(APP_URL, { margin: 1 }) : Promise.resolve(''),
  ])
  const getFlag = makeFlagResolver(flagMap)

  const fontDefs = [
    { name: 'BigShouldersDisplay', data: fonts.display, weight: 900 as const, style: 'normal' as const },
    { name: 'SpaceMono', data: fonts.mono, weight: 700 as const, style: 'normal' as const },
  ]

  if (format === 'story') {
    return new ImageResponse(
      <StoryCard data={body} getFlag={getFlag} qrDataUri={qrDataUri} />,
      {
        width: STORY_WIDTH,
        height: STORY_HEIGHT,
        fonts: fontDefs,
        headers: { 'Cache-Control': 'no-store' },
      }
    )
  }

  // Default: card (CollectionCard com altura variável)
  const baseHeight = estimateCollectionHeight(body)
  return new ImageResponse(
    <CollectionCard data={body} getFlag={getFlag} baseHeight={baseHeight} />,
    {
      width: BASE_WIDTH * RENDER_SCALE,
      height: Math.round(baseHeight * RENDER_SCALE),
      fonts: fontDefs,
      headers: { 'Cache-Control': 'no-store' },
    }
  )
}
