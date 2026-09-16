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

  const { error } = await supabase
    .from('tryons')
    .delete()
    .eq('id', id)
    .eq('user_id', uid)

  if (error) {
    console.error('Failed to delete tryon:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete try-on',
    })
  }

  return {
    success: true,
    message: 'Try-on deleted successfully',
  }
})
