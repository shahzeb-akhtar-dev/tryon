import { verifySupabaseToken } from '../utils/supabase-admin'

const PROTECTED_PREFIXES = ['/api/tryon/', '/api/photos/', '/api/garments/', '/api/upload/', '/api/auth/me']

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
    const decodedToken = await verifySupabaseToken(token)
    event.context.uid = decodedToken.uid
    event.context.email = decodedToken.email
  } catch (error: any) {

    console.error('Token verification failed:', {
      message: error?.message,
      data: error?.data,
      status: error?.statusCode,
    })
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired authentication token',
    })
  }
})
