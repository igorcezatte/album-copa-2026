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

/**
 * Detecta erro do Supabase quando a tabela referenciada não existe.
 * Postgres code 42P01 = undefined_table. Usado pra fallback no admin
 * panel enquanto a migration v3 (user_profiles) ainda não foi rodada.
 */
export function isMissingTableError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const e = err as { code?: string; message?: string }
  if (e.code === '42P01') return true
  if (typeof e.message === 'string' && /does not exist/i.test(e.message)) {
    return true
  }
  return false
}

const PAGE_SIZE = 1000

/**
 * Lê TODAS as linhas de uma query Supabase usando .range() em loop.
 *
 * Supabase REST tem um cap default de 1000 rows por response (db-rest-max-rows).
 * Sem paginação, qualquer somatório acima disso fica truncado silenciosamente
 * — exatamente o bug do /admin que travava em "1000 figurinhas exatas".
 *
 * Recebe uma factory que cria a query base (sem range) e a invoca repetidamente
 * com offsets crescentes. Para quando uma página vem menor que PAGE_SIZE.
 */
interface RangeableQuery<T> {
  range(from: number, to: number): PromiseLike<{ data: T[] | null; error: unknown }>
}

export async function fetchAllRows<T>(
  buildQuery: () => RangeableQuery<T>
): Promise<{ data: T[]; error: unknown }> {
  const all: T[] = []
  let from = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const to = from + PAGE_SIZE - 1
    const { data, error } = await buildQuery().range(from, to)
    if (error) return { data: all, error }
    const rows = data ?? []
    all.push(...rows)
    if (rows.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return { data: all, error: null }
}
