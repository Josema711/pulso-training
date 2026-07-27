import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useLiveQuery } from 'dexie-react-hooks'
import { Dumbbell, Library, ShieldCheck } from 'lucide-react'
import { db, getSettings } from '../db/database'
import { basicExercises } from '../db/seeds'
import { nowIso } from '../utils'
import { Button, Modal } from '../components/ui'
import { Layout } from './Layout'
import { DashboardPage } from '../pages/DashboardPage'
import { ExercisesPage } from '../pages/ExercisesPage'
import { WorkoutPage } from '../pages/WorkoutPage'
import { HistoryPage } from '../pages/HistoryPage'
import { ProgressPage } from '../pages/ProgressPage'
import { SettingsPage } from '../pages/SettingsPage'
import { ExerciseDetailPage } from '../pages/ExerciseDetailPage'
import { WorkoutDetailPage } from '../pages/WorkoutDetailPage'
import { CloudSyncProvider } from './CloudSyncProvider'

function Onboarding() {
  const settings = useLiveQuery(() => getSettings(), [])
  useEffect(() => {
    if (!settings) return
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('light', settings.theme === 'light' || (settings.theme === 'system' && !systemDark))
  }, [settings])
  if (!settings || settings.onboardingDone) return null
  const finish = async (withLibrary: boolean) => {
    if (withLibrary) await db.exercises.bulkAdd(basicExercises())
    await db.settings.put({ ...settings, onboardingDone: true, updatedAt: nowIso() })
  }
  return <Modal title="Bienvenido a Pulso" onClose={() => undefined}><div className="onboarding"><div className="onboarding-mark"><Dumbbell /></div><h2>Tu entrenamiento. Tus datos. Tu progreso.</h2><p>Pulso recuerda lo que haces y propone avances prudentes. No crea rutinas ni comparte tus datos con otros usuarios.</p><div className="onboarding-privacy"><ShieldCheck /><span><b>Privado por diseño</b><small>Funciona sin conexión y puedes activar tu copia privada en la nube desde Ajustes.</small></span></div><Button onClick={() => finish(true)}><Library /> Cargar biblioteca básica</Button><Button variant="secondary" onClick={() => finish(false)}>Empezar vacío</Button></div></Modal>
}

export default function App() { return <CloudSyncProvider><HashRouter><Routes><Route element={<Layout />}><Route index element={<DashboardPage />} /><Route path="entrenamiento" element={<WorkoutPage />} /><Route path="historial" element={<HistoryPage />} /><Route path="historial/:id" element={<WorkoutDetailPage />} /><Route path="ejercicios" element={<ExercisesPage />} /><Route path="ejercicios/:id" element={<ExerciseDetailPage />} /><Route path="progreso" element={<ProgressPage />} /><Route path="ajustes" element={<SettingsPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes><Onboarding /><Toaster richColors position="top-center" /></HashRouter></CloudSyncProvider> }
