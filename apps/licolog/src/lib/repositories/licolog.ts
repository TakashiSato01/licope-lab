// apps/licolog/src/lib/repositories/licolog.ts
import {
  addDoc, collection, getDocs, limit, orderBy, query,
  serverTimestamp, where, CollectionReference, QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { LicologPost } from '../types'

const col = (orgId: string) =>
  collection(db, 'organizations', orgId, 'licologPosts') as CollectionReference<LicologPost>

// 作成（常に status='pending' で入れる）
export async function createPost(input: Omit<LicologPost, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
  const docRef = await addDoc(col(input.orgId), {
    ...input,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

// 法人横断ウォール（orgId の時系列 desc）
export async function fetchLatest(orgId: string, take = 30) {
  const q = query(
    col(orgId),
    orderBy('createdAt', 'desc'),
    limit(take),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...(d.data()) }))
}