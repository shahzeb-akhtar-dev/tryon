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
  const { imageUrl, name } = body as { imageUrl?: string; name?: string }

  if (!imageUrl || !name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'imageUrl and name are required',
    })
  }

  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('garments')
    .insert({
      user_id: uid,
      image_url: imageUrl,
      name,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to save garment:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save garment',
    })
  }

  return {
    success: true,
    garment: {
      id: data.id,
      userId: data.user_id,
      imageUrl: data.image_url,
      name: data.name,
      createdAt: data.created_at,
    },
  }
})
