import Fashn from 'fashn'
import { getFirebaseAdmin } from '../../utils/firebase-admin'

const FASHN_MODEL = 'tryon-max' as const

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
  const fashnApiKey = config.fashnApiKey as string

  if (!fashnApiKey || fashnApiKey === 'your_fashn_api_key_here') {
    throw createError({
      statusCode: 500,
      statusMessage: 'FASHN API key not configured',
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

  const { firestore, storage } = getFirebaseAdmin()

  const tryOnRef = firestore.collection('users').doc(uid).collection('tryons').doc(tryOnId)
  const tryOnDoc = await tryOnRef.get()

  if (!tryOnDoc.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Try-on not found',
    })
  }

  const tryOnData = tryOnDoc.data()!

  if (tryOnData.userId !== uid) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }

  if (tryOnData.status === 'generating') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Generation already in progress',
    })
  }

  if (!tryOnData.personImageUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Person image is missing',
    })
  }

  if (!tryOnData.garmentImageUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Garment image is missing',
    })
  }

  await tryOnRef.update({
    status: 'generating',
    error: null,
    updatedAt: new Date().toISOString(),
  })

  try {
    const client = new Fashn({ apiKey: fashnApiKey })

    const response = await client.predictions.subscribe({
      inputs: {
        model_image: tryOnData.personImageUrl,
        product_image: tryOnData.garmentImageUrl,
      },
      model_name: FASHN_MODEL,
    })

    const predictionId = response.id || null
    const outputUrl = response.output as string | null

    if (!outputUrl) {
      await tryOnRef.update({
        status: 'failed',
        error: 'Generation produced no output. Please try again.',
        fashnPredictionId: predictionId,
        updatedAt: new Date().toISOString(),
      })

      return {
        success: false,
        tryOnId,
        status: 'failed',
        error: 'Generation produced no output. Please try again.',
      }
    }

    const resultResponse = await fetch(outputUrl)
    if (!resultResponse.ok) {
      throw new Error(`Failed to download result image: ${resultResponse.status}`)
    }

    const resultBuffer = Buffer.from(await resultResponse.arrayBuffer())

    const resultPath = `users/${uid}/tryons/${tryOnId}/result.jpg`
    const bucket = storage.bucket()
    const file = bucket.file(resultPath)

    await file.save(resultBuffer, {
      metadata: {
        contentType: 'image/jpeg',
      },
    })

    await file.makePublic()
    const resultDownloadUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(resultPath).replace(/%2F/g, '/')}`

    const signedUrl = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500',
    })

    await tryOnRef.update({
      resultImageUrl: signedUrl[0],
      fashnPredictionId: predictionId,
      status: 'completed',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return {
      success: true,
      tryOnId,
      status: 'completed',
      resultImageUrl: signedUrl[0],
      predictionId,
    }
  } catch (error: any) {
    console.error('FASHN generation error:', {
      uid,
      tryOnId,
      error: error?.message || 'Unknown error',
      stack: error?.stack,
    })

    const userMessage = error?.message?.includes('timeout')
      ? 'Generation timed out. Please try again.'
      : error?.message?.includes('Authentication')
        ? 'Service configuration error.'
        : 'Generation failed. Please try again.'

    await tryOnRef.update({
      status: 'failed',
      error: userMessage,
      updatedAt: new Date().toISOString(),
    }).catch((updateError) => {
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
