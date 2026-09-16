import { getSupabaseAdmin } from '../../utils/supabase-admin'

export default defineEventHandler(async (event) => {
  const uid = event.context.uid as string

  if (!uid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 20, 100)

  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to list photos:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to list photos',
    })
  }

  return {
    success: true,
    photos: (data || []).map((d) => ({
      id: d.id,
      userId: d.user_id,
      imageUrl: d.image_url,
      createdAt: d.created_at,
    })),
  }
})
