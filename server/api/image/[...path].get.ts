import { getSupabaseAdmin } from '../../utils/supabase-admin'

export default defineEventHandler(async (event) => {
  const imageUrl = getRouterParam(event, 'path')
  
  if (!imageUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image URL is required',
    })
  }

  const supabase = getSupabaseAdmin()

  try {
    let filePath = imageUrl
    
    // Extract file path from Supabase Storage URL
    if (imageUrl.includes('supabase.co/storage/v1/object')) {
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split('/storage/v1/object/public/tryon-images/')
      if (pathParts[1]) {
        filePath = pathParts[1]
      }
    }

    const { data, error } = await supabase.storage
      .from('tryon-images')
      .download(filePath)

    if (error) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Image not found',
      })
    }

    const buffer = Buffer.from(await data.arrayBuffer())
    const contentType = data.type || 'image/jpeg'
    
    setResponseHeader(event, 'Content-Type', contentType)
    setResponseHeader(event, 'Access-Control-Allow-Origin', '*')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000')
    
    return buffer
  } catch (error: any) {
    console.error('Image proxy error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load image',
    })
  }
})
