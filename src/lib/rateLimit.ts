/**
 * Rate limit em memória. Janela deslizante simples: cada `hit(key)` retorna
 * se a chave excedeu o limite na janela atual.
 *
 * Limitação aceita: serverless da Vercel pode resetar o Map entre cold starts,
 * então o limite real é "por instância viva". Mitiga brute-force comum de
 * uma sessão (mesmo IP atacando em rajada) sem custo extra de Upstash.
 *
 * Não é defesa contra atacante distribuído — pra isso precisaria Upstash ou
 * RLS no banco. Pro caso de "vizinho tentando adivinhar a senha do amigo"
 * é suficiente.
 */

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

const WINDOW_MS = 60_000
const MAX_HITS = 5

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterMs: number
}

export function hit(key: string, now: number = Date.now()): RateLimitResult {
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_HITS - 1, retryAfterMs: 0 }
  }

  if (bucket.count >= MAX_HITS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, bucket.resetAt - now),
    }
  }

  bucket.count += 1
  return {
    allowed: true,
    remaining: MAX_HITS - bucket.count,
    retryAfterMs: 0,
  }
}

export function reset(key: string): void {
  buckets.delete(key)
}

export function _clearAllForTests(): void {
  buckets.clear()
}

export const RATE_LIMIT_WINDOW_MS = WINDOW_MS
export const RATE_LIMIT_MAX_HITS = MAX_HITS
