import { ref, computed } from 'vue'
import { getApp } from 'firebase/app'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import type {
  TryOnDocument,
  TryOnStatus,
  RecentPhoto,
  SavedGarment,
} from '~/types/tryon'

const personFile = ref<File | null>(null)
const garmentFile = ref<File | null>(null)
const personPreviewUrl = ref<string | null>(null)
const garmentPreviewUrl = ref<string | null>(null)
const currentTryOnId = ref<string | null>(null)
const resultImageUrl = ref<string | null>(null)
const generating = ref(false)
const uploading = ref(false)
const status = ref<TryOnStatus | null>(null)
const statusMessage = ref('')
const error = ref<string | null>(null)
const recentPhotos = ref<RecentPhoto[]>([])
const savedGarments = ref<SavedGarment[]>([])

function getFirebaseServices() {
  const app = getApp()
  return {
    storage: getStorage(app),
    firestore: getFirestore(app),
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10)
}

function validateImage(file: File, type: 'person' | 'garment'): string | null {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return `Please upload a JPEG, PNG, or WebP image.`
  }
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return `Image is too large. Maximum size is 10MB.`
  }
  if (file.size < 1024) {
    return `Unable to read this image.`
  }
  return null
}

export function useTryOn() {
  const authStore = useAuthStore()

  const canGenerate = computed(() => {
    return personFile.value && garmentFile.value && !generating.value && !uploading.value
  })

  const isReady = computed(() => {
    return status.value === 'completed' && resultImageUrl.value
  })

  function setPersonFile(file: File | null) {
    if (file) {
      const validationError = validateImage(file, 'person')
      if (validationError) {
        error.value = validationError
        return false
      }
      personFile.value = file
      if (personPreviewUrl.value) {
        URL.revokeObjectURL(personPreviewUrl.value)
      }
      personPreviewUrl.value = URL.createObjectURL(file)
      error.value = null
    } else {
      personFile.value = null
      if (personPreviewUrl.value) {
        URL.revokeObjectURL(personPreviewUrl.value)
      }
      personPreviewUrl.value = null
    }
    return true
  }

  function setGarmentFile(file: File | null) {
    if (file) {
      const validationError = validateImage(file, 'garment')
      if (validationError) {
        error.value = validationError
        return false
      }
      garmentFile.value = file
      if (garmentPreviewUrl.value) {
        URL.revokeObjectURL(garmentPreviewUrl.value)
      }
      garmentPreviewUrl.value = URL.createObjectURL(file)
      error.value = null
    } else {
      garmentFile.value = null
      if (garmentPreviewUrl.value) {
        URL.revokeObjectURL(garmentPreviewUrl.value)
      }
      garmentPreviewUrl.value = null
    }
    return true
  }

  async function uploadToStorage(file: File, path: string): Promise<string> {
    const { storage } = getFirebaseServices()
    const fileRef = storageRef(storage, path)
    const snapshot = await uploadBytes(fileRef, file)
    const downloadUrl = await getDownloadURL(snapshot.ref)
    return downloadUrl
  }

  async function generateTryOn(): Promise<boolean> {
    if (!authStore.isAuthenticated || !authStore.user) {
      error.value = 'Please sign in before generating a try-on.'
      return false
    }

    if (!personFile.value) {
      error.value = 'Please upload a full-body photo.'
      return false
    }

    if (!garmentFile.value) {
      error.value = 'Please upload a garment image.'
      return false
    }

    if (generating.value) {
      return false
    }

    generating.value = true
    uploading.value = true
    error.value = null
    resultImageUrl.value = null
    statusMessage.value = 'Preparing your images...'

    const uid = authStore.user.uid
    const tryOnId = generateId()

    try {
      statusMessage.value = 'Uploading your photo...'
      const personPath = `users/${uid}/tryons/${tryOnId}/person.${personFile.value.name.split('.').pop() || 'jpg'}`
      const personImageUrl = await uploadToStorage(personFile.value, personPath)

      statusMessage.value = 'Uploading the garment...'
      const garmentPath = `users/${uid}/tryons/${tryOnId}/garment.${garmentFile.value.name.split('.').pop() || 'jpg'}`
      const garmentImageUrl = await uploadToStorage(garmentFile.value, garmentPath)

      statusMessage.value = 'Analyzing the garment...'

      const { firestore } = getFirebaseServices()
      const tryOnDoc: Omit<TryOnDocument, 'id'> = {
        userId: uid,
        personImageUrl,
        garmentImageUrl,
        resultImageUrl: null,
        fashnPredictionId: null,
        status: 'ready',
        category: 'auto',
        mode: 'balanced',
        outputFormat: 'jpeg',
        error: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
      }

      await setDoc(doc(firestore, 'users', uid, 'tryons', tryOnId), tryOnDoc)

      currentTryOnId.value = tryOnId
      status.value = 'ready'
      uploading.value = false

      statusMessage.value = 'Creating your try-on...'
      status.value = 'generating'

      const token = authStore.token
      if (!token) {
        throw new Error('Authentication token expired. Please sign in again.')
      }

      const response = await $fetch<{
        success: boolean
        tryOnId: string
        status: TryOnStatus
        resultImageUrl?: string
        predictionId?: string
        error?: string
      }>('/api/tryon/generate', {
        method: 'POST',
        body: { tryOnId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.success && response.resultImageUrl) {
        resultImageUrl.value = response.resultImageUrl
        status.value = 'completed'
        statusMessage.value = ''
        return true
      } else {
        status.value = 'failed'
        error.value = response.error || 'Generation failed. Please try again.'
        statusMessage.value = ''
        return false
      }
    } catch (e: any) {
      console.error('Try-on generation error:', e)
      status.value = 'failed'
      error.value = e?.data?.statusMessage || e?.message || 'Generation failed. Please try again.'
      statusMessage.value = ''

      if (currentTryOnId.value) {
        try {
          const { firestore } = getFirebaseServices()
          await updateDoc(
            doc(firestore, 'users', uid, 'tryons', currentTryOnId.value),
            {
              status: 'failed',
              error: error.value,
              updatedAt: new Date().toISOString(),
            }
          )
        } catch (updateError) {
          console.error('Failed to update try-on status:', updateError)
        }
      }

      return false
    } finally {
      generating.value = false
      uploading.value = false
    }
  }

  async function loadRecentPhotos() {
    if (!authStore.user) return

    try {
      const { firestore } = getFirebaseServices()
      const q = query(
        collection(firestore, 'users', authStore.user.uid, 'photos'),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      recentPhotos.value = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as RecentPhoto[]
    } catch (e) {
      console.error('Failed to load recent photos:', e)
    }
  }

  async function saveRecentPhoto(imageUrl: string) {
    if (!authStore.user) return

    try {
      const { firestore } = getFirebaseServices()
      const photoId = generateId()
      const photoData = {
        id: photoId,
        userId: authStore.user.uid,
        imageUrl,
        createdAt: new Date().toISOString(),
      }
      await setDoc(
        doc(firestore, 'users', authStore.user.uid, 'photos', photoId),
        photoData
      )
      recentPhotos.value.unshift(photoData as RecentPhoto)
    } catch (e) {
      console.error('Failed to save recent photo:', e)
    }
  }

  async function loadSavedGarments() {
    if (!authStore.user) return

    try {
      const { firestore } = getFirebaseServices()
      const q = query(
        collection(firestore, 'users', authStore.user.uid, 'garments'),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      savedGarments.value = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as SavedGarment[]
    } catch (e) {
      console.error('Failed to load saved garments:', e)
    }
  }

  async function saveGarment(imageUrl: string, name: string) {
    if (!authStore.user) return

    try {
      const { firestore } = getFirebaseServices()
      const garmentId = generateId()
      const garmentData = {
        id: garmentId,
        userId: authStore.user.uid,
        imageUrl,
        name,
        createdAt: new Date().toISOString(),
      }
      await setDoc(
        doc(firestore, 'users', authStore.user.uid, 'garments', garmentId),
        garmentData
      )
      savedGarments.value.unshift(garmentData as SavedGarment)
    } catch (e) {
      console.error('Failed to save garment:', e)
    }
  }

  function resetTryOn() {
    personFile.value = null
    garmentFile.value = null
    if (personPreviewUrl.value) URL.revokeObjectURL(personPreviewUrl.value)
    if (garmentPreviewUrl.value) URL.revokeObjectURL(garmentPreviewUrl.value)
    personPreviewUrl.value = null
    garmentPreviewUrl.value = null
    currentTryOnId.value = null
    resultImageUrl.value = null
    generating.value = false
    uploading.value = false
    status.value = null
    statusMessage.value = ''
    error.value = null
  }

  function selectRecentPhoto(photo: RecentPhoto) {
    personFile.value = null
    if (personPreviewUrl.value) URL.revokeObjectURL(personPreviewUrl.value)
    personPreviewUrl.value = photo.imageUrl
  }

  function selectSavedGarment(garment: SavedGarment) {
    garmentFile.value = null
    if (garmentPreviewUrl.value) URL.revokeObjectURL(garmentPreviewUrl.value)
    garmentPreviewUrl.value = garment.imageUrl
  }

  return {
    personFile,
    garmentFile,
    personPreviewUrl,
    garmentPreviewUrl,
    currentTryOnId,
    resultImageUrl,
    generating,
    uploading,
    status,
    statusMessage,
    error,
    recentPhotos,
    savedGarments,
    canGenerate,
    isReady,
    setPersonFile,
    setGarmentFile,
    generateTryOn,
    loadRecentPhotos,
    saveRecentPhoto,
    loadSavedGarments,
    saveGarment,
    resetTryOn,
    selectRecentPhoto,
    selectSavedGarment,
  }
}
