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
  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseAnonKey = config.public.supabaseAnonKey as string

  try {
    const response = await $fetch<any>(
      `${supabaseUrl}/auth/v1/user`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    return {
      success: true,
      user: {
        uid: response.id,
        email: response.email || null,
        displayName: response.user_metadata?.full_name || null,
        photoURL: response.user_metadata?.avatar_url || null,
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
