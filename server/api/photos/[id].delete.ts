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
      statusMessage: 'Photo ID is required',
    })
  }

  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', id)
    .eq('user_id', uid)

  if (error) {
    console.error('Failed to delete photo:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete photo',
    })
  }

  return {
    success: true,
    message: 'Photo deleted successfully',
  }
})
