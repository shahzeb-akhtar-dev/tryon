import { getSupabaseAdmin } from '../../utils/supabase-admin'

const OPENAI_MODEL = 'gpt-image-1' as const
const OPENAI_QUALITY = 'low' as const
const OPENAI_SIZE = '1024x1024' as const

const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_WINDOW_MS = 10_000

export default defineEventHandler(async (event) => {
  const uid = event.context.uid as string

  if (!uid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const now = Date.now()
  const lastRequest = rateLimitMap.get(uid) || 0
  if (now - lastRequest < RATE_LIMIT_WINDOW_MS) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please wait before trying again.',
    })
  }
  rateLimitMap.set(uid, now)

  const config = useRuntimeConfig()
  const openaiApiKey = config.openaiApiKey as string

  if (!openaiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OpenAI API key not configured',
    })
  }

  const body = await readBody(event)
  const { tryOnId } = body as { tryOnId?: string }

  if (!tryOnId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'tryOnId is required',
    })
  }

  const supabase = getSupabaseAdmin()

  const { data: tryOnData, error: fetchError } = await supabase
    .from('tryons')
    .select('*')
    .eq('id', tryOnId)
    .eq('user_id', uid)
    .single()

  if (fetchError || !tryOnData) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Try-on not found',
    })
  }

  if (tryOnData.status === 'generating') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Generation already in progress',
    })
  }

  if (!tryOnData.person_image_url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Person image is missing',
    })
  }

  if (!tryOnData.garment_image_url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Garment image is missing',
    })
  }

  await supabase
    .from('tryons')
    .update({
      status: 'generating',
      error: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tryOnId)
    .eq('user_id', uid)

  try {
    const personResponse = await fetch(tryOnData.person_image_url)
    if (!personResponse.ok) {
      throw new Error(`Failed to download person image: ${personResponse.status}`)
    }
    const personBuffer = Buffer.from(await personResponse.arrayBuffer())

    const garmentResponse = await fetch(tryOnData.garment_image_url)
    if (!garmentResponse.ok) {
      throw new Error(`Failed to download garment image: ${garmentResponse.status}`)
    }
    const garmentBuffer = Buffer.from(await garmentResponse.arrayBuffer())

    const formData = new FormData()
    formData.append('model', OPENAI_MODEL)
    formData.append('prompt', 'Virtual try-on: Place the garment from the second image onto the person in the first image. Keep the person\'s body, face, and pose unchanged. Make the garment fit naturally on the person\'s body with realistic draping, lighting, and shadows.')
    formData.append('quality', OPENAI_QUALITY)
    formData.append('size', OPENAI_SIZE)
    formData.append('n', '1')

    formData.append(
      'image[]',
      new Blob([personBuffer], { type: 'image/jpeg' }),
      'person.jpg',
    )
    formData.append(
      'image[]',
      new Blob([garmentBuffer], { type: 'image/jpeg' }),
      'garment.jpg',
    )

    const openaiResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    })

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text()
      console.error('OpenAI API error:', {
        status: openaiResponse.status,
        body: errorBody,
      })
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json() as {
      data: Array<{ b64_json?: string; url?: string }>
    }

    if (!openaiData.data || openaiData.data.length === 0) {
      throw new Error('OpenAI returned no image data')
    }

    const imageItem = openaiData.data[0]
    let resultBuffer: Buffer

    if (imageItem.b64_json) {
      resultBuffer = Buffer.from(imageItem.b64_json, 'base64')
    } else if (imageItem.url) {
      const imgResponse = await fetch(imageItem.url)
      if (!imgResponse.ok) {
        throw new Error(`Failed to download OpenAI result image: ${imgResponse.status}`)
      }
      resultBuffer = Buffer.from(await imgResponse.arrayBuffer())
    } else {
      throw new Error('OpenAI returned neither b64_json nor url')
    }

    const resultPath = `users/${uid}/tryons/${tryOnId}/result-openai.jpg`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tryon-images')
      .upload(resultPath, resultBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Failed to upload result: ${uploadError.message}`)
    }

    const { data: publicUrlData } = supabase.storage
      .from('tryon-images')
      .getPublicUrl(resultPath)

    const resultDownloadUrl = publicUrlData.publicUrl

    await supabase
      .from('tryons')
      .update({
        result_image_url: resultDownloadUrl,
        openai_model: OPENAI_MODEL,
        openai_quality: OPENAI_QUALITY,
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', tryOnId)
      .eq('user_id', uid)

    return {
      success: true,
      tryOnId,
      status: 'completed',
      resultImageUrl: resultDownloadUrl,
      provider: 'openai',
      model: OPENAI_MODEL,
      quality: OPENAI_QUALITY,
    }
  } catch (error: any) {
    console.error('OpenAI generation error:', {
      uid,
      tryOnId,
      error: error?.message || 'Unknown error',
      stack: error?.stack,
    })

    const userMessage = error?.message?.includes('timeout')
      ? 'Generation timed out. Please try again.'
      : error?.message?.includes('Authentication') || error?.message?.includes('401')
        ? 'Service configuration error.'
        : error?.message?.includes('OpenAI API error')
          ? 'Image generation failed. Please try again.'
          : 'Generation failed. Please try again.'

    await supabase
      .from('tryons')
      .update({
        status: 'failed',
        error: userMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tryOnId)
      .eq('user_id', uid)
      .catch((updateError) => {
        console.error('Failed to update try-on status:', updateError)
      })

    return {
      success: false,
      tryOnId,
      status: 'failed',
      error: userMessage,
    }
  }
})
