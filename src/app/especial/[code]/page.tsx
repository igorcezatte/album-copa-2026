import { notFound } from 'next/navigation'
import { FWC_SECTION, CC_SECTION } from '@/data/teams'
import { SpecialPageClient } from './SpecialPageClient'

const SECTIONS = {
  fwc: FWC_SECTION,
  cc: CC_SECTION,
}

interface Props {
  params: { code: string }
}

export function generateStaticParams() {
  return Object.keys(SECTIONS).map((code) => ({ code }))
}

export default function SpecialPage({ params }: Props) {
  const section = SECTIONS[params.code as keyof typeof SECTIONS]
  if (!section) notFound()
  return <SpecialPageClient sectionCode={section.code} />
}
