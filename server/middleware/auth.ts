const PROTECTED_PREFIXES = ['/api/tryon/', '/api/auth/me']

async function verifyTokenViaRest(idToken: string): Promise<{ uid: string; email: string | null }> {
  const config = useRuntimeConfig()
  const apiKey = config.public.firebaseApiKey as string

  const response = await $fetch<any>(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      body: { idToken },
    }
  )

  if (!response.users || response.users.length === 0) {
    throw new Error('Invalid token')
  }

  return {
    uid: response.users[0].localId,
    email: response.users[0].email || null,
  }
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  const isProtected = PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix))
  if (!isProtected) {
    return
  }

  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing authentication token',
    })
  }

  const token = authHeader.slice(7)

  try {
    const { verifyFirebaseToken } = await import('../utils/firebase-admin')
    const decodedToken = await verifyFirebaseToken(token)
    event.context.uid = decodedToken.uid
    event.context.email = decodedToken.email
  } catch (adminError) {
    try {
      const user = await verifyTokenViaRest(token)
      event.context.uid = user.uid
      event.context.email = user.email
    } catch (restError) {
      console.error('Token verification failed (both Admin SDK and REST API):', restError)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired authentication token',
      })
    }
  }
})
