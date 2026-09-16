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

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 6 characters.',
    })
  }

  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseAnonKey = config.public.supabaseAnonKey as string

  try {
    const response = await $fetch<any>(
      `${supabaseUrl}/auth/v1/signup`,
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
        uid: response.id,
        email: response.email || email,
        displayName: response.user_metadata?.full_name || null,
        photoURL: response.user_metadata?.avatar_url || null,
      },
    }
  } catch (error: any) {
    const errorCode = error?.data?.error_code || error?.data?.msg || error?.message || ''

    let statusCode = 500
    let message = 'Sign-up failed. Please try again.'

    if (errorCode.includes('user_already_exists') || errorCode.includes('already registered')) {
      statusCode = 409
      message = 'An account with this email already exists.'
    } else if (errorCode.includes('invalid_email')) {
      statusCode = 400
      message = 'Please enter a valid email address.'
    }

    console.error('Signup error:', { errorCode, email })

    throw createError({
      statusCode,
      statusMessage: message,
    })
  }
})
