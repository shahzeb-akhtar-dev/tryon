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
  const { personImageUrl, garmentImageUrl } = body as {
    personImageUrl?: string
    garmentImageUrl?: string
  }

  if (!personImageUrl || !garmentImageUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'personImageUrl and garmentImageUrl are required',
    })
  }

  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('tryons')
    .insert({
      user_id: uid,
      person_image_url: personImageUrl,
      garment_image_url: garmentImageUrl,
      status: 'ready',
      category: 'auto',
      mode: 'balanced',
      output_format: 'jpeg',
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create tryon:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create try-on record',
    })
  }

  return {
    success: true,
    tryOn: {
      id: data.id,
      userId: data.user_id,
      personImageUrl: data.person_image_url,
      garmentImageUrl: data.garment_image_url,
      resultImageUrl: data.result_image_url,
      status: data.status,
      category: data.category,
      mode: data.mode,
      outputFormat: data.output_format,
      error: data.error,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      completedAt: data.completed_at,
    },
  }
})
