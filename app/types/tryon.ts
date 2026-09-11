export type TryOnStatus =
  | 'uploading'
  | 'ready'
  | 'generating'
  | 'completed'
  | 'failed'

export type TryOnCategory = 'auto' | 'tops' | 'bottoms' | 'one-pieces'

export type TryOnMode = 'performance' | 'balanced' | 'quality'

export type TryOnOutputFormat = 'png' | 'jpeg'

export interface TryOnDocument {
  id: string
  userId: string
  personImageUrl: string
  garmentImageUrl: string
  resultImageUrl: string | null
  fashnPredictionId: string | null
  status: TryOnStatus
  category: TryOnCategory
  mode: TryOnMode
  outputFormat: TryOnOutputFormat
  error: string | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export interface TryOnGenerateRequest {
  tryOnId: string
}

export interface TryOnGenerateResponse {
  success: boolean
  tryOnId: string
  status: TryOnStatus
  resultImageUrl?: string
  predictionId?: string
  error?: string
}

export interface RecentPhoto {
  id: string
  userId: string
  imageUrl: string
  createdAt: string
}

export interface SavedGarment {
  id: string
  userId: string
  imageUrl: string
  name: string
  createdAt: string
}
