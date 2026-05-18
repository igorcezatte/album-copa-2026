import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Retorna null se as variáveis não estão configuradas (dev local sem Upstash)
// — a API funciona normalmente, só sem rate limiting
function createRatelimit(requests: number, window: string) {
  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(requests, window as `${number} ${'s' | 'm' | 'h' | 'd'}`),
    analytics: false,
  })
}

// GET /api/stickers — carrega 1x por sessão, 20/min é mais que suficiente
export const rlGet = createRatelimit(20, '1 m')

// PUT /api/stickers — 1.5s debounce no cliente, 60/min cobre uso normal
export const rlPut = createRatelimit(60, '1 m')
