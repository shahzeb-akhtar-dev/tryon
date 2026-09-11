import { getFirebaseAdmin, verifyFirebaseToken } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { idToken } = body as { idToken?: string }

  if (!idToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID token is required.',
    })
  }

  const config = useRuntimeConfig()
  const apiKey = config.public.firebaseApiKey as string

  let user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }

  try {
    const lookupResponse = await $fetch<any>(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        body: { idToken },
      }
    )

    if (!lookupResponse.users || lookupResponse.users.length === 0) {
      throw new Error('No user found for token')
    }

    const firebaseUser = lookupResponse.users[0]
    user = {
      uid: firebaseUser.localId,
      email: firebaseUser.email || null,
      displayName: firebaseUser.displayName || null,
      photoURL: firebaseUser.photoUrl || null,
    }
  } catch (restError: any) {
    console.error('Google auth REST API error:', {
      message: restError?.message,
      data: restError?.data,
      status: restError?.statusCode,
    })

    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token. Please sign in again.',
    })
  }

  try {
    const { firestore } = getFirebaseAdmin()
    await firestore.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      updatedAt: new Date().toISOString(),
    }, { merge: true })
  } catch (e: any) {
    console.warn('Could not upsert user document:', e?.message)
  }

  return {
    success: true,
    user,
  }
})
