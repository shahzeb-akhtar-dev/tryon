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
      statusMessage: 'Garment ID is required',
    })
  }

  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('garments')
    .delete()
    .eq('id', id)
    .eq('user_id', uid)

  if (error) {
    console.error('Failed to delete garment:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete garment',
    })
  }

  return {
    success: true,
    message: 'Garment deleted successfully',
  }
})
