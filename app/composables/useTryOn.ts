import { ref, computed } from 'vue'
import type {
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

function validateImage(file: File): string | null {
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
    return personFile.value && garmentFile.value && !generating.value && !uploading.value && authStore.isAuthenticated
  })

  const isReady = computed(() => {
    return status.value === 'completed' && resultImageUrl.value
  })

  function setPersonFile(file: File | null) {
    if (file) {
      const validationError = validateImage(file)
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
      const validationError = validateImage(file)
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

  async function generateTryOn(): Promise<boolean> {
    if (!authStore.user || !authStore.token) {
      authStore.loadFromStorage()
    }

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

    const token = authStore.token
    if (!token) {
      error.value = 'Authentication token expired. Please sign in again.'
      generating.value = false
      uploading.value = false
      return false
    }

    try {
      statusMessage.value = 'Generating your try-on...'
      status.value = 'generating'

      const formData = new FormData()
      formData.append('personImage', personFile.value)
      formData.append('garmentImage', garmentFile.value)

      const response = await $fetch<{
        success: boolean
        tryOnId: string
        status: TryOnStatus
        resultImageUrl?: string
        error?: string
      }>('/api/tryon/generate-direct', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.success && response.resultImageUrl) {
        currentTryOnId.value = response.tryOnId
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
      return false
    } finally {
      generating.value = false
      uploading.value = false
    }
  }

  async function loadRecentPhotos() {
    if (!authStore.user || !authStore.token) {
      authStore.loadFromStorage()
    }
    if (!authStore.user || !authStore.token) return

    try {
      const response = await $fetch<{
        success: boolean
        photos: Array<{ id: string; userId: string; imageUrl: string; createdAt: string }>
      }>('/api/photos/list', {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })

      if (response.success) {
        recentPhotos.value = response.photos.map((p) => ({
          id: p.id,
          userId: p.userId,
          imageUrl: p.imageUrl,
          createdAt: p.createdAt,
        })) as RecentPhoto[]
      }
    } catch (e) {
      console.error('Failed to load recent photos:', e)
    }
  }

  async function saveRecentPhoto(imageUrl: string) {
    if (!authStore.user || !authStore.token) {
      authStore.loadFromStorage()
    }
    if (!authStore.user || !authStore.token) return

    try {
      const response = await $fetch<{
        success: boolean
        photo: { id: string; userId: string; imageUrl: string; createdAt: string }
      }>('/api/photos/save', {
        method: 'POST',
        body: { imageUrl },
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })

      if (response.success && response.photo) {
        recentPhotos.value.unshift({
          id: response.photo.id,
          userId: response.photo.userId,
          imageUrl: response.photo.imageUrl,
          createdAt: response.photo.createdAt,
        } as RecentPhoto)
      }
    } catch (e) {
      console.error('Failed to save recent photo:', e)
    }
  }

  async function loadSavedGarments() {
    if (!authStore.user || !authStore.token) {
      authStore.loadFromStorage()
    }
    if (!authStore.user || !authStore.token) return

    try {
      const response = await $fetch<{
        success: boolean
        garments: Array<{ id: string; userId: string; imageUrl: string; name: string; createdAt: string }>
      }>('/api/garments/list', {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })

      if (response.success) {
        savedGarments.value = response.garments.map((g) => ({
          id: g.id,
          userId: g.userId,
          imageUrl: g.imageUrl,
          name: g.name,
          createdAt: g.createdAt,
        })) as SavedGarment[]
      }
    } catch (e) {
      console.error('Failed to load saved garments:', e)
    }
  }

  async function saveGarment(imageUrl: string, name: string) {
    if (!authStore.user || !authStore.token) {
      authStore.loadFromStorage()
    }
    if (!authStore.user || !authStore.token) return

    try {
      const response = await $fetch<{
        success: boolean
        garment: { id: string; userId: string; imageUrl: string; name: string; createdAt: string }
      }>('/api/garments/save', {
        method: 'POST',
        body: { imageUrl, name },
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })

      if (response.success && response.garment) {
        savedGarments.value.unshift({
          id: response.garment.id,
          userId: response.garment.userId,
          imageUrl: response.garment.imageUrl,
          name: response.garment.name,
          createdAt: response.garment.createdAt,
        } as SavedGarment)
      }
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
