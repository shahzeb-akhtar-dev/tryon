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
    'EMAIL_NOT_FOUND': { statusCode: 401, message: 'No account found with this email.' },
    'INVALID_PASSWORD': { statusCode: 401, message: 'Incorrect password.' },
    'USER_DISABLED': { statusCode: 403, message: 'This account has been disabled.' },
    'INVALID_LOGIN_CREDENTIALS': { statusCode: 401, message: 'Invalid email or password.' },
    'TOO_MANY_ATTEMPTS_TRY_LATER': { statusCode: 429, message: 'Too many attempts. Please try again later.' },
    'INVALID_EMAIL': { statusCode: 400, message: 'Please enter a valid email address.' },
    'MISSING_PASSWORD': { statusCode: 400, message: 'Please enter a password.' },
    'EMAIL_EXISTS': { statusCode: 409, message: 'An account with this email already exists.' },
    'WEAK_PASSWORD': { statusCode: 400, message: 'Password must be at least 6 characters.' },
  }
  return map[errorCode] || { statusCode: 500, message: 'Authentication failed. Please try again.' }
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
  const apiKey = config.public.firebaseApiKey as string

  try {
    const response = await $fetch<any>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
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
        email: response.email || null,
        displayName: response.displayName || null,
        photoURL: null,
      },
    }
  } catch (error: any) {
    const errorCode = error?.data?.error?.message || error?.message || ''
    const mapped = mapFirebaseAuthError(errorCode)

    console.error('Login error:', { errorCode, email })

    throw createError({
      statusCode: mapped.statusCode,
      statusMessage: mapped.message,
    })
  }
})
