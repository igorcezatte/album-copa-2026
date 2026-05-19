import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminSession } from '@/lib/admin'
import { AdminClient } from './AdminClient'

export const metadata = {
  title: 'Admin · Álbum Copa 2026',
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  // Gate server-side. Não autorizados são jogados de volta pra home sem
  // pista de que /admin existe.
  if (!isAdminSession(session)) {
    redirect('/')
  }

  return <AdminClient />
}
