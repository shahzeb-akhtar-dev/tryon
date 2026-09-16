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
  const offset = Number(query.offset) || 0

  const supabase = getSupabaseAdmin()

  const { data, error, count } = await supabase
    .from('tryons')
    .select('*', { count: 'exact' })
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Failed to list tryons:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to list try-ons',
    })
  }

  return {
    success: true,
    tryons: (data || []).map((d) => ({
      id: d.id,
      userId: d.user_id,
      personImageUrl: d.person_image_url,
      garmentImageUrl: d.garment_image_url,
      resultImageUrl: d.result_image_url,
      status: d.status,
      category: d.category,
      mode: d.mode,
      outputFormat: d.output_format,
      error: d.error,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      completedAt: d.completed_at,
    })),
    total: count || 0,
    limit,
    offset,
  }
})
