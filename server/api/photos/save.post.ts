import { getSupabaseAdmin } from '../../utils/supabase-admin'

export default defineEventHandler(async (event) => {
  const uid = event.context.uid as string

  if (!uid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const body = await readBody(event)
  const { imageUrl } = body as { imageUrl?: string }

  if (!imageUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'imageUrl is required',
    })
  }

  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('photos')
    .insert({
      user_id: uid,
      image_url: imageUrl,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to save photo:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save photo',
    })
  }

  return {
    success: true,
    photo: {
      id: data.id,
      userId: data.user_id,
      imageUrl: data.image_url,
      createdAt: data.created_at,
    },
  }
})
