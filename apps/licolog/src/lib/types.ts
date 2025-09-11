// apps/licolog/src/lib/types.ts
export type LicologPostStatus = 'pending' | 'approved' | 'hidden'

export type LicologPost = {
  id?: string
  body: string
  media?: Array<{ path: string; width?: number; height?: number; bytes?: number }>
  authorUid: string
  orgId: string
  facilityId: string
  status: LicologPostStatus
  createdAt: any // Firestore Timestamp | FieldValue
  updatedAt: any // Firestore Timestamp | FieldValue
}