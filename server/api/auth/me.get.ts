export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing authentication token',
    })
  }

  const token = authHeader.slice(7)
  const config = useRuntimeConfig()
  const apiKey = config.public.firebaseApiKey as string

  try {
    const response = await $fetch<any>(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        body: { idToken: token },
      }
    )

    if (!response.users || response.users.length === 0) {
      throw new Error('No user found')
    }

    const firebaseUser = response.users[0]

    return {
      success: true,
      user: {
        uid: firebaseUser.localId,
        email: firebaseUser.email || null,
        displayName: firebaseUser.displayName || null,
        photoURL: firebaseUser.photoUrl || null,
      },
    }
  } catch (error: any) {
    console.error('Token verification error:', { error: error?.message })

    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token.',
    })
  }
})
