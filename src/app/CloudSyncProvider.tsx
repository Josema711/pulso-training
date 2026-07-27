import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, type User } from 'firebase/auth'
import { onSnapshot } from 'firebase/firestore'
import { firebaseAuth, googleProvider } from '../services/firebase'
import { cloudManifestReference, downloadCloudBackup, uploadCloudBackup } from '../services/cloud'
import { exportBackup, importBackup, mergeBackupData } from '../services/backup'
import type { BackupData } from '../types'

type CloudStatus = 'local' | 'connecting' | 'syncing' | 'synced' | 'error'
interface CloudSyncValue { user: User | null; status: CloudStatus; error: string; lastSyncedAt: string | null; login: () => Promise<void>; logout: () => Promise<void>; syncNow: () => Promise<void> }
const CloudSyncContext = createContext<CloudSyncValue | null>(null)
const DEVICE_KEY = 'pulso-device-id'
const USER_KEY = 'pulso-cloud-user'

function getDeviceId() {
  const stored = localStorage.getItem(DEVICE_KEY)
  if (stored) return stored
  const generated = crypto.randomUUID()
  localStorage.setItem(DEVICE_KEY, generated)
  return generated
}
const fingerprint = (backup: BackupData) => JSON.stringify({ ...backup, exportedAt: '' })
function emptyBackup(source: BackupData): BackupData {
  return { ...source, exportedAt: new Date().toISOString(), settings: [], exercises: [], workouts: [], workoutExercises: [], sets: [], cardio: [], wods: [], bodyMeasurements: [], personalRecords: [], recommendations: [] }
}

export function CloudSyncProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<CloudStatus>('local')
  const [error, setError] = useState('')
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const lastFingerprint = useRef('')
  const syncing = useRef(false)
  const deviceId = useRef(getDeviceId())

  useEffect(() => onAuthStateChanged(firebaseAuth, setUser), [])

  const syncNow = useCallback(async () => {
    if (!user || syncing.current) return
    syncing.current = true; setStatus('syncing'); setError('')
    try {
      const local = await exportBackup()
      const nextFingerprint = fingerprint(local)
      if (nextFingerprint !== lastFingerprint.current) {
        await uploadCloudBackup(user.uid, local, deviceId.current)
        lastFingerprint.current = nextFingerprint
      }
      setLastSyncedAt(new Date().toISOString()); setStatus('synced')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se ha podido sincronizar'); setStatus('error')
    } finally { syncing.current = false }
  }, [user])

  useEffect(() => {
    if (!user) { setStatus('local'); return }
    let cancelled = false; let stopRemoteListener: () => void = () => undefined; let timer = 0
    const start = async () => {
      setStatus('connecting'); setError('')
      try {
        const local = await exportBackup()
        const remote = await downloadCloudBackup(user.uid)
        const previousUser = localStorage.getItem(USER_KEY)
        let current: BackupData
        if (!remote && previousUser && previousUser !== user.uid) {
          await importBackup(emptyBackup(local), 'replace')
          current = await exportBackup()
        }
        else if (!remote) current = local
        else if (previousUser && previousUser !== user.uid) { current = remote; await importBackup(remote, 'replace') }
        else { current = mergeBackupData(local, remote); await importBackup(current, 'replace') }
        if (cancelled) return
        await uploadCloudBackup(user.uid, current, deviceId.current)
        lastFingerprint.current = fingerprint(current)
        localStorage.setItem(USER_KEY, user.uid)
        setLastSyncedAt(new Date().toISOString()); setStatus('synced')
        stopRemoteListener = onSnapshot(cloudManifestReference(user.uid), async (snapshot) => {
          if (cancelled || !snapshot.exists() || snapshot.data().deviceId === deviceId.current || syncing.current) return
          try {
            const incoming = await downloadCloudBackup(user.uid)
            if (!incoming || cancelled) return
            const localNow = await exportBackup()
            const hasPendingLocalChanges = fingerprint(localNow) !== lastFingerprint.current
            const current = hasPendingLocalChanges ? mergeBackupData(localNow, incoming) : incoming
            await importBackup(current, 'replace')
            if (hasPendingLocalChanges) await uploadCloudBackup(user.uid, current, deviceId.current)
            lastFingerprint.current = fingerprint(current)
            setLastSyncedAt(new Date().toISOString()); setStatus('synced')
          } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo descargar la copia remota'); setStatus('error') }
        })
        timer = window.setInterval(() => void syncNow(), 12_000)
      } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo iniciar la nube'); setStatus('error') }
    }
    void start()
    const syncWhenVisible = () => { if (document.visibilityState === 'visible') void syncNow() }
    window.addEventListener('online', syncWhenVisible); document.addEventListener('visibilitychange', syncWhenVisible)
    return () => { cancelled = true; stopRemoteListener(); window.clearInterval(timer); window.removeEventListener('online', syncWhenVisible); document.removeEventListener('visibilitychange', syncWhenVisible) }
  }, [syncNow, user])

  const login = async () => {
    setStatus('connecting'); setError('')
    try {
      await signInWithPopup(firebaseAuth, googleProvider)
    } catch (cause) {
      if (cause instanceof Error && (cause as Error & { code?: string }).code === 'auth/popup-blocked') {
        await signInWithRedirect(firebaseAuth, googleProvider)
        return
      }
      const message = cause instanceof Error ? cause.message : 'No se ha podido iniciar sesión con Google'
      setError(message); setStatus('error')
      throw cause
    }
  }
  const logout = async () => { await syncNow(); await signOut(firebaseAuth); setStatus('local') }
  return <CloudSyncContext.Provider value={{ user, status, error, lastSyncedAt, login, logout, syncNow }}>{children}</CloudSyncContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCloudSync() {
  const value = useContext(CloudSyncContext)
  if (!value) throw new Error('useCloudSync debe utilizarse dentro de CloudSyncProvider')
  return value
}
