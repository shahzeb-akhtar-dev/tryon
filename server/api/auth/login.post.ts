const authRateLimitMap = new Map<string, number>()
const AUTH_RATE_LIMIT_WINDOW_MS = 5_000

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
  const { email, password } = body as { email?: string; password?: string }

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required.',
    })
  }

  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseAnonKey = config.public.supabaseAnonKey as string

  try {
    const response = await $fetch<any>(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: {
          email,
          password,
        },
      }
    )

    return {
      success: true,
      idToken: response.access_token,
      refreshToken: response.refresh_token,
      user: {
        uid: response.user.id,
        email: response.user.email || null,
        displayName: response.user.user_metadata?.full_name || null,
        photoURL: response.user.user_metadata?.avatar_url || null,
      },
    }
  } catch (error: any) {
    const errorCode = error?.data?.error_code || error?.data?.msg || error?.message || ''

    let statusCode = 500
    let message = 'Login failed. Please try again.'

    if (errorCode.includes('invalid_credentials') || errorCode.includes('Invalid login credentials')) {
      statusCode = 401
      message = 'Invalid email or password.'
    } else if (errorCode.includes('email_not_confirmed')) {
      statusCode = 403
      message = 'Please verify your email address.'
    }

    console.error('Login error:', { errorCode, email })

    throw createError({
      statusCode,
      statusMessage: message,
    })
  }
})
