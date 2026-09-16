import { getSupabaseAdmin } from '../../utils/supabase-admin'

export default defineEventHandler(async (event) => {
  const uid = event.context.uid as string

  if (!uid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Try-on ID is required',
    })
  }

  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('tryons')
    .select('*')
    .eq('id', id)
    .eq('user_id', uid)
    .single()

  if (error || !data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Try-on not found',
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
      fashnPredictionId: data.fashn_prediction_id,
      openaiModel: data.openai_model,
      openaiQuality: data.openai_quality,
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
