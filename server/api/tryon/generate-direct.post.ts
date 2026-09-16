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

  const formData = await readMultipartFormData(event)

  if (!formData || formData.length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Both person and garment images are required',
    })
  }

  const personFile = formData.find((item) => item.name === 'personImage')
  const garmentFile = formData.find((item) => item.name === 'garmentImage')

  if (!personFile || !garmentFile) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Both person and garment images are required',
    })
  }

  const supabase = getSupabaseAdmin()

  const { data: tryOnData, error: insertError } = await supabase
    .from('tryons')
    .insert({
      user_id: uid,
      status: 'generating',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError || !tryOnData) {
    console.error('Supabase insert error:', {
      message: insertError?.message,
      details: insertError?.details,
      hint: insertError?.hint,
      code: insertError?.code,
    })
    throw createError({
      statusCode: 500,
      statusMessage: insertError?.message || 'Failed to create try-on record',
    })
  }

  const tryOnId = tryOnData.id

  try {
    const personBuffer = Buffer.from(personFile.data)
    const garmentBuffer = Buffer.from(garmentFile.data)

    const openaiFormData = new FormData()
    openaiFormData.append('model', OPENAI_MODEL)
    openaiFormData.append('prompt', 'Virtual try-on: Place the garment from the second image onto the person in the first image. Keep the person\'s body, face, and pose unchanged. Make the garment fit naturally on the person\'s body with realistic draping, lighting, and shadows.')
    openaiFormData.append('quality', OPENAI_QUALITY)
    openaiFormData.append('size', OPENAI_SIZE)
    openaiFormData.append('n', '1')

    openaiFormData.append(
      'image[]',
      new Blob([personBuffer], { type: personFile.type || 'image/jpeg' }),
      'person.jpg',
    )
    openaiFormData.append(
      'image[]',
      new Blob([garmentBuffer], { type: garmentFile.type || 'image/jpeg' }),
      'garment.jpg',
    )

    const openaiResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: openaiFormData,
    })

    if (!openaiResponse.ok) {
      let errorMessage = 'Failed to create try-on record'
      let errorDetails = ''
      
      try {
        const errorBody = await openaiResponse.json()
        console.error('OpenAI error response:', JSON.stringify(errorBody, null, 2))
        
        errorMessage = errorBody?.error?.message || errorBody?.message || errorMessage
        errorDetails = JSON.stringify(errorBody)
      } catch (parseError) {
        const errorText = await openaiResponse.text()
        console.error('OpenAI API error (text):', {
          status: openaiResponse.status,
          body: errorText,
        })
        errorDetails = errorText
      }
      
      throw new Error(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`)
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
        throw new Error(`Failed to download result: ${imgResponse.status}`)
      }
      resultBuffer = Buffer.from(await imgResponse.arrayBuffer())
    } else {
      throw new Error('OpenAI returned neither b64_json nor url')
    }

    const resultPath = `users/${uid}/tryons/${tryOnId}/result.jpg`
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

    const resultImageUrl = publicUrlData.publicUrl

    await supabase
      .from('tryons')
      .update({
        result_image_url: resultImageUrl,
        openai_model: OPENAI_MODEL,
        openai_quality: OPENAI_QUALITY,
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', tryOnId)

    return {
      success: true,
      tryOnId,
      status: 'completed',
      resultImageUrl,
    }
  } catch (error: any) {
    console.error('Generation error caught:', {
      uid,
      tryOnId,
      errorMessage: error?.message,
      errorStack: error?.stack,
      errorType: typeof error,
      errorKeys: error ? Object.keys(error) : [],
    })

    const errorMessage = error?.message || 'Failed to create try-on record'

    await supabase
      .from('tryons')
      .update({
        status: 'failed',
        error: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tryOnId)

    return {
      success: false,
      tryOnId,
      status: 'failed',
      error: errorMessage,
    }
  }
})
