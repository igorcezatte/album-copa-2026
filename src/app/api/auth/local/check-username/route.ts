import { checkUsernameAvailability } from '@/lib/localAuth'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const username = url.searchParams.get('u') ?? ''
  if (!username) {
    return Response.json({ available: false, reason: 'too_short' })
  }

  const result = await checkUsernameAvailability(username)
  return Response.json(result)
}
