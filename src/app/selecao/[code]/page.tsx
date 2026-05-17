import { TEAMS } from '@/data/teams'
import { notFound } from 'next/navigation'
import { SelecaoPageClient } from './SelecaoPageClient'

interface Props {
  params: { code: string }
}

export function generateStaticParams() {
  return TEAMS.map((t) => ({ code: t.code.toLowerCase() }))
}

export default function SelecaoPage({ params }: Props) {
  const team = TEAMS.find((t) => t.code === params.code.toUpperCase())
  if (!team) notFound()
  return <SelecaoPageClient teamCode={team.code} />
}
