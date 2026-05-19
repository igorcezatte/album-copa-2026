import type { Session } from 'next-auth'

/**
 * Lista hardcoded de emails autorizados a acessar /admin e as APIs admin.
 *
 * Decisão consciente: não usar flag no JWT ou env var. O JWT é controlado
 * pelo cliente (poderia ser forjado), e env vars adicionam complexidade
 * pra um único admin. Hardcoded é a forma mais simples e segura.
 *
 * Se um dia houver mais admins, migrar pra tabela admin_users no Supabase.
 */
const ADMIN_EMAILS = new Set<string>([
  'igorcezatte13@gmail.com',
])

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.has(email.toLowerCase())
}

export function isAdminSession(session: Session | null | undefined): boolean {
  return isAdminEmail(session?.user?.email)
}
