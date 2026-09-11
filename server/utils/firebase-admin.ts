import { initializeApp, cert, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getAuth } from 'firebase-admin/auth'

let app: App | null = null

export function getFirebaseAdmin() {
  if (!app) {
    const config = useRuntimeConfig()

    const projectId = config.firebaseAdminProjectId as string
    const clientEmail = config.firebaseClientEmail as string
    const privateKey = (config.firebasePrivateKey as string).replace(/\\n/g, '\n')
    const storageBucket = config.firebaseStorageBucket as string

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Firebase Admin credentials not configured')
    }

    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket,
    })
  }

  return {
    firestore: getFirestore(app!),
    storage: getStorage(app!),
    auth: getAuth(app!),
  }
}

export async function verifyFirebaseToken(idToken: string) {
  const { auth } = getFirebaseAdmin()
  return auth.verifyIdToken(idToken)
}
