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

function mapFirebaseAuthError(errorCode: string): { statusCode: number; message: string } {
  const map: Record<string, { statusCode: number; message: string }> = {
    'EMAIL_EXISTS': { statusCode: 409, message: 'An account with this email already exists.' },
    'INVALID_EMAIL': { statusCode: 400, message: 'Please enter a valid email address.' },
    'WEAK_PASSWORD': { statusCode: 400, message: 'Password must be at least 6 characters.' },
    'TOO_MANY_ATTEMPTS_TRY_LATER': { statusCode: 429, message: 'Too many attempts. Please try again later.' },
    'OPERATION_NOT_ALLOWED': { statusCode: 403, message: 'Email/password sign-up is not enabled.' },
  }
  return map[errorCode] || { statusCode: 500, message: 'Sign-up failed. Please try again.' }
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
  const apiKey = config.public.firebaseApiKey as string

  try {
    const response = await $fetch<any>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        method: 'POST',
        body: {
          email,
          password,
          returnSecureToken: true,
        },
      }
    )

    return {
      success: true,
      idToken: response.idToken,
      refreshToken: response.refreshToken,
      user: {
        uid: response.localId,
        email: response.email || email,
        displayName: response.displayName || null,
        photoURL: null,
      },
    }
  } catch (error: any) {
    const errorCode = error?.data?.error?.message || error?.message || ''
    const mapped = mapFirebaseAuthError(errorCode)

    console.error('Signup error:', { errorCode, email })

    throw createError({
      statusCode: mapped.statusCode,
      statusMessage: mapped.message,
    })
  }
})
