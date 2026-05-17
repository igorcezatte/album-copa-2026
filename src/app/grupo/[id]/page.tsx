import { GROUPS } from '@/data/teams'
import { notFound } from 'next/navigation'
import { GroupPageClient } from './GroupPageClient'

interface Props {
  params: { id: string }
}

export function generateStaticParams() {
  return GROUPS.map((g) => ({ id: g.toLowerCase() }))
}

export default function GroupPage({ params }: Props) {
  const group = params.id.toUpperCase()
  if (!GROUPS.includes(group)) notFound()
  return <GroupPageClient group={group} />
}
