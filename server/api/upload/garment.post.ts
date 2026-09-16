import { getSupabaseAdmin } from '../../utils/supabase-admin'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default defineEventHandler(async (event) => {
  const uid = event.context.uid as string

  if (!uid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const parts = await readMultipartFormData(event)
  if (!parts || parts.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No file uploaded',
    })
  }

  const filePart = parts.find((p) => p.name === 'file')
  if (!filePart) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File field is required',
    })
  }

  const contentType = filePart.type || 'application/octet-stream'
  if (!VALID_TYPES.includes(contentType)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only JPEG, PNG, and WebP images are allowed',
    })
  }

  if (filePart.data.length > MAX_FILE_SIZE) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image is too large. Maximum size is 10MB.',
    })
  }

  if (filePart.data.length < 1024) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unable to read this image.',
    })
  }

  const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg'
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  const filePath = `users/${uid}/garment/${timestamp}-${random}.${ext}`

  const supabase = getSupabaseAdmin()

  const { error: uploadError } = await supabase.storage
    .from('tryon-images')
    .upload(filePath, filePart.data, {
      contentType,
      upsert: true,
    })

  if (uploadError) {
    console.error('Failed to upload garment image:', uploadError)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload image',
    })
  }

  const { data: publicUrlData } = supabase.storage
    .from('tryon-images')
    .getPublicUrl(filePath)

  return {
    success: true,
    imageUrl: publicUrlData.publicUrl,
    path: filePath,
  }
})
