import { signupLocal } from '@/lib/localAuth'
import { hit } from '@/lib/rateLimit'

function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') {
    return Response.json({ ok: false, error: 'invalid_payload' }, { status: 400 })
  }

  const ip = getClientIp(request)
  const rl = hit(`local-signup:${ip}`)
  if (!rl.allowed) {
    return Response.json(
      { ok: false, error: 'rate_limited', retryAfterMs: rl.retryAfterMs },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) },
      }
    )
  }

  const result = await signupLocal(body.username, body.password)

  if (!result.ok) {
    const status = result.error === 'db_error' ? 500 : 400
    return Response.json(result, { status })
  }

  // Cliente vai chamar signIn('local', ...) na sequência. Não retornamos token.
  return Response.json({ ok: true, username: result.account.username })
}
