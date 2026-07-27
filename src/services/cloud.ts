import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore'
import { firestore } from './firebase'
import type { BackupData } from '../types'
import { validateBackup } from './backup'

const CHUNK_SIZE = 400_000
const manifestReference = (userId: string) => doc(firestore, 'users', userId, 'sync', 'manifest')
const chunksReference = (userId: string) => collection(manifestReference(userId), 'chunks')

function splitPayload(payload: string) {
  const chunks: string[] = []
  for (let index = 0; index < payload.length; index += CHUNK_SIZE) chunks.push(payload.slice(index, index + CHUNK_SIZE))
  return chunks.length ? chunks : ['']
}

export async function uploadCloudBackup(userId: string, backup: BackupData, deviceId: string) {
  const chunks = splitPayload(JSON.stringify(backup))
  const existing = await getDocs(chunksReference(userId))
  const currentIds = new Set(chunks.map((_, index) => String(index).padStart(6, '0')))
  for (let offset = 0; offset < chunks.length; offset += 400) {
    const batch = writeBatch(firestore)
    chunks.slice(offset, offset + 400).forEach((data, relativeIndex) => {
      const index = offset + relativeIndex
      batch.set(doc(chunksReference(userId), String(index).padStart(6, '0')), { index, data })
    })
    await batch.commit()
  }
  await Promise.all(existing.docs.filter((item) => !currentIds.has(item.id)).map((item) => deleteDoc(item.ref)))
  await setDoc(manifestReference(userId), { chunkCount: chunks.length, schemaVersion: backup.version, deviceId, updatedAt: serverTimestamp() })
}

export async function downloadCloudBackup(userId: string): Promise<BackupData | null> {
  const manifest = await getDoc(manifestReference(userId))
  if (!manifest.exists()) return null
  const chunks = await getDocs(query(chunksReference(userId), orderBy('index', 'asc')))
  if (!chunks.size) return null
  return validateBackup(JSON.parse(chunks.docs.map((item) => String(item.data().data || '')).join('')))
}

export const cloudManifestReference = (userId: string) => manifestReference(userId)
