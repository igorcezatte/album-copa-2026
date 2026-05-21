/**
 * Auth local: apelido + senha. Funções server-side, NÃO importar no browser
 * (bcryptjs roda em JS puro mas a service_role_key do Supabase é segredo).
 *
 * Decisões:
 * - Apelido case-insensitive armazenado em `username_lower` (canônico) e
 *   `username` (forma original do user, pra exibição).
 * - Senha hasheada com bcryptjs 10 rounds. Plaintext é tentador ("é só
 *   álbum") mas vazaria reuso de senha em outros sites do user.
 * - Sem confirmação de email, sem recuperação. UX deixa isso explícito.
 */

import bcrypt from 'bcryptjs'
import { createSupabaseAdmin } from './supabase'

const USERNAME_REGEX = /^[a-z0-9_-]{3,20}$/
const MIN_PASSWORD_LENGTH = 5
const MAX_PASSWORD_LENGTH = 100
const BCRYPT_ROUNDS = 10

const RESERVED_USERNAMES = new Set([
  'admin',
  'administrador',
  'root',
  'null',
  'undefined',
  'system',
  'sistema',
  'support',
  'suporte',
  'help',
  'ajuda',
  'copa26',
  'copa',
  'panini',
  'fifa',
  'me',
  'eu',
  'self',
  'login',
  'logout',
  'signup',
  'signin',
  'config',
  'api',
])

export interface LocalAccount {
  user_id: string
  username: string
  username_lower: string
}

export type ValidateUsernameResult =
  | { ok: true; normalized: string; display: string }
  | { ok: false; error: 'too_short' | 'too_long' | 'invalid_chars' | 'reserved' }

export function validateUsername(raw: string): ValidateUsernameResult {
  const display = (raw ?? '').trim()
  const normalized = display.toLowerCase()

  if (normalized.length < 3) return { ok: false, error: 'too_short' }
  if (normalized.length > 20) return { ok: false, error: 'too_long' }
  if (!USERNAME_REGEX.test(normalized)) {
    return { ok: false, error: 'invalid_chars' }
  }
  if (RESERVED_USERNAMES.has(normalized)) {
    return { ok: false, error: 'reserved' }
  }

  return { ok: true, normalized, display }
}

export type ValidatePasswordResult =
  | { ok: true }
  | { ok: false; error: 'too_short' | 'too_long' }

export function validatePassword(raw: string): ValidatePasswordResult {
  if (typeof raw !== 'string') return { ok: false, error: 'too_short' }
  if (raw.length < MIN_PASSWORD_LENGTH) return { ok: false, error: 'too_short' }
  if (raw.length > MAX_PASSWORD_LENGTH) return { ok: false, error: 'too_long' }
  return { ok: true }
}

export type SignupResult =
  | { ok: true; account: LocalAccount }
  | {
      ok: false
      error:
        | 'invalid_username'
        | 'invalid_password'
        | 'username_taken'
        | 'db_error'
      suggestions?: string[]
      detail?: string
    }

export async function signupLocal(
  rawUsername: string,
  rawPassword: string
): Promise<SignupResult> {
  const uname = validateUsername(rawUsername)
  if (!uname.ok) return { ok: false, error: 'invalid_username' }

  const pwd = validatePassword(rawPassword)
  if (!pwd.ok) return { ok: false, error: 'invalid_password' }

  const supabase = createSupabaseAdmin()

  // Checa antes pra dar erro limpo + sugestões em vez de capturar erro
  // genérico do Postgres na violação de unique.
  const { data: existing } = await supabase
    .from('local_accounts')
    .select('user_id')
    .eq('username_lower', uname.normalized)
    .maybeSingle()

  if (existing) {
    const suggestions = await suggestAlternatives(uname.normalized)
    return { ok: false, error: 'username_taken', suggestions }
  }

  const password_hash = await bcrypt.hash(rawPassword, BCRYPT_ROUNDS)

  const { data: inserted, error } = await supabase
    .from('local_accounts')
    .insert({
      username_lower: uname.normalized,
      username: uname.display,
      password_hash,
    })
    .select('user_id, username, username_lower')
    .single()

  if (error || !inserted) {
    // Race condition: alguém criou o mesmo apelido entre o check e o insert.
    if (error?.code === '23505') {
      const suggestions = await suggestAlternatives(uname.normalized)
      return { ok: false, error: 'username_taken', suggestions }
    }
    return { ok: false, error: 'db_error', detail: error?.message }
  }

  return {
    ok: true,
    account: {
      user_id: inserted.user_id as string,
      username: inserted.username as string,
      username_lower: inserted.username_lower as string,
    },
  }
}

/**
 * Verifica credenciais. Retorna `null` em qualquer falha (apelido não existe,
 * senha errada, erro de DB) — NextAuth interpreta null como "auth failed".
 *
 * Compara o hash mesmo quando o apelido não existe (timing constant-ish) pra
 * não vazar via timing se o apelido está cadastrado.
 */
export async function authenticateLocal(
  rawUsername: string,
  rawPassword: string
): Promise<LocalAccount | null> {
  const uname = validateUsername(rawUsername)
  if (!uname.ok) return null

  const supabase = createSupabaseAdmin()

  const { data: row } = await supabase
    .from('local_accounts')
    .select('user_id, username, username_lower, password_hash')
    .eq('username_lower', uname.normalized)
    .maybeSingle()

  // Hash dummy pra rodar bcrypt.compare mesmo quando não existe — mitiga
  // timing attack barato. O hash é um bcrypt válido de "x".
  const HASH_DUMMY =
    '$2a$10$abcdefghijklmnopqrstuuB1uMUL/i9KGUMjpyAuxw7m4G5L9aIue'
  const hashToCompare = row?.password_hash ?? HASH_DUMMY

  const matches = await bcrypt.compare(rawPassword, hashToCompare)

  if (!row || !matches) return null

  // Atualiza last_login_at sem bloquear o response (best effort).
  await supabase
    .from('local_accounts')
    .update({ last_login_at: new Date().toISOString() })
    .eq('user_id', row.user_id)
    .then(
      () => undefined,
      () => undefined
    )

  return {
    user_id: row.user_id as string,
    username: row.username as string,
    username_lower: row.username_lower as string,
  }
}

const SUGGESTION_SUFFIXES = ['-2', '-26', '-copa', '-fan', '-1', '-3', '-bra']

/**
 * Gera até 3 sugestões livres pra um apelido tomado. Tenta sufixos comuns +
 * número aleatório como fallback. Faz UMA query pra checar disponibilidade
 * em batch.
 */
export async function suggestAlternatives(
  takenLower: string,
  max: number = 3
): Promise<string[]> {
  const candidates: string[] = []
  for (const suffix of SUGGESTION_SUFFIXES) {
    const candidate = (takenLower + suffix).toLowerCase()
    if (candidate.length <= 20 && USERNAME_REGEX.test(candidate)) {
      candidates.push(candidate)
    }
  }
  // Fallback: 3 com número aleatório
  for (let i = 0; i < 3; i++) {
    const n = Math.floor(Math.random() * 900) + 100
    const candidate = `${takenLower}-${n}`
    if (candidate.length <= 20) candidates.push(candidate)
  }

  if (candidates.length === 0) return []

  const supabase = createSupabaseAdmin()
  const { data: taken } = await supabase
    .from('local_accounts')
    .select('username_lower')
    .in('username_lower', candidates)

  const takenSet = new Set((taken ?? []).map((r) => r.username_lower as string))

  return candidates.filter((c) => !takenSet.has(c)).slice(0, max)
}

/** Disponibilidade live pra UX do form (debounce no cliente). */
export async function checkUsernameAvailability(
  rawUsername: string
): Promise<{ available: boolean; reason?: string }> {
  const uname = validateUsername(rawUsername)
  if (!uname.ok) return { available: false, reason: uname.error }

  const supabase = createSupabaseAdmin()
  const { data } = await supabase
    .from('local_accounts')
    .select('user_id')
    .eq('username_lower', uname.normalized)
    .maybeSingle()

  return { available: !data }
}
