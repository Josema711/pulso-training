import Dexie, { type EntityTable } from 'dexie'
import type { AppSettings, BodyMeasurement, CardioEntry, CoachRecommendation, Exercise, PersonalRecord, SetEntry, WodEntry, Workout, WorkoutExercise } from '../types'
import { nowIso } from '../utils'

class PulsoDatabase extends Dexie {
  exercises!: EntityTable<Exercise, 'id'>
  workouts!: EntityTable<Workout, 'id'>
  workoutExercises!: EntityTable<WorkoutExercise, 'id'>
  sets!: EntityTable<SetEntry, 'id'>
  cardio!: EntityTable<CardioEntry, 'id'>
  wods!: EntityTable<WodEntry, 'id'>
  bodyMeasurements!: EntityTable<BodyMeasurement, 'id'>
  personalRecords!: EntityTable<PersonalRecord, 'id'>
  recommendations!: EntityTable<CoachRecommendation, 'id'>
  settings!: EntityTable<AppSettings, 'id'>

  constructor() {
    super('pulso-training')
    this.version(1).stores({
      exercises: 'id, name, primaryMuscle, type, equipment, active, favorite, updatedAt',
      workouts: 'id, date, status, type, updatedAt',
      workoutExercises: 'id, workoutId, exerciseId, [workoutId+exerciseId], order',
      sets: 'id, workoutExerciseId, [workoutExerciseId+order], completed',
      cardio: 'id, workoutId, type', wods: 'id, workoutId, type',
      bodyMeasurements: 'id, date, weight', personalRecords: 'id, exerciseId, workoutId, type, achievedAt',
      recommendations: 'id, exerciseId, generatedAt', settings: 'id',
    })
    this.version(2).stores({ workouts: 'id, date, status, type, updatedAt, createdAt' }).upgrade(async (tx) => {
      await tx.table('workouts').toCollection().modify((workout) => { workout.createdAt ||= workout.updatedAt || nowIso() })
    })
  }
}

export const db = new PulsoDatabase()

export const defaultSettings: AppSettings = {
  id: 'settings', nickname: '', weightUnit: 'kg', distanceUnit: 'km', theme: 'dark', oneRmFormula: 'Epley',
  maxIncreasePercent: 5, defaultProgression: 'Doble progresión', preferredEffort: 'RIR', autoTimer: true,
  sounds: false, vibration: true, defaultRestSeconds: 90, weekStartsOn: 1, bodyGoal: 'Mantener peso',
  targetWeight: null, weeklyWorkoutGoal: null, weeklyCardioGoal: null, weightLogGoal: null, showAdvanced: true,
  plateauSessions: 3, sessionsBeforeIncrease: 2, maxOneRmReps: 15, onboardingDone: false, updatedAt: nowIso(),
}

export async function getSettings() {
  const stored = await db.settings.get('settings')
  if (stored) return stored
  await db.settings.put(defaultSettings)
  return defaultSettings
}

export async function deleteWorkoutCascade(workoutId: string) {
  await db.transaction('rw', [db.workouts, db.workoutExercises, db.sets, db.cardio, db.wods, db.personalRecords], async () => {
    const workoutExercises = await db.workoutExercises.where('workoutId').equals(workoutId).toArray()
    await db.sets.where('workoutExerciseId').anyOf(workoutExercises.map((item) => item.id)).delete()
    await db.workoutExercises.where('workoutId').equals(workoutId).delete()
    await Promise.all([db.cardio.where('workoutId').equals(workoutId).delete(), db.wods.where('workoutId').equals(workoutId).delete(), db.personalRecords.where('workoutId').equals(workoutId).delete()])
    await db.workouts.delete(workoutId)
  })
}
