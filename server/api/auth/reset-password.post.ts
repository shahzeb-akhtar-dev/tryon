const authRateLimitMap = new Map<string, number>()
const AUTH_RATE_LIMIT_WINDOW_MS = 10_000

function getRateLimitKey(event: any): string {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  return ip
}

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const last = authRateLimitMap.get(key) || 0
  if (now - last < AUTH_RATE_LIMIT_WINDOW_MS) return false
  authRateLimitMap.set(key, now)
  return true
}

export default defineEventHandler(async (event) => {
  const rateKey = getRateLimitKey(event)
  if (!checkRateLimit(rateKey)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please wait before trying again.',
    })
  }

  const body = await readBody(event)
  const { email } = body as { email?: string }

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required.',
    })
  }

  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseAnonKey = config.public.supabaseAnonKey as string

  try {
    await $fetch(
      `${supabaseUrl}/auth/v1/recover`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: {
          email,
        },
      }
    )

    return {
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
    }
  } catch (error: any) {
    console.error('Password reset error:', { error: error?.message })

    return {
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
    }
  }
})
