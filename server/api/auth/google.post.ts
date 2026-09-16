import { getSupabaseAdmin } from '../../utils/supabase-admin'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { idToken } = body as { idToken?: string }

  if (!idToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID token is required.',
    })
  }

  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseAnonKey = config.public.supabaseAnonKey as string

  let user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }

  try {
    const response = await $fetch<any>(
      `${supabaseUrl}/auth/v1/user`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${idToken}`,
        },
      }
    )

    user = {
      uid: response.id,
      email: response.email || null,
      displayName: response.user_metadata?.full_name || null,
      photoURL: response.user_metadata?.avatar_url || null,
    }
  } catch (error: any) {
    console.error('Google auth error:', {
      message: error?.message,
      data: error?.data,
      status: error?.statusCode,
    })

    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token. Please sign in again.',
    })
  }

  try {
    const supabase = getSupabaseAdmin()
    await supabase.from('users').upsert({
      uid: user.uid,
      email: user.email,
      display_name: user.displayName,
      photo_url: user.photoURL,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'uid' })
  } catch (e: any) {
    console.warn('Could not upsert user document:', e?.message)
  }

  return {
    success: true,
    user,
    idToken,
  }
})
