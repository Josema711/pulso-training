import { db } from '../db/database'
import type { ExerciseSession } from '../logic/progression'
import type { SetEntry, WorkoutBundle } from '../types'

export async function getWorkoutBundle(workoutId: string): Promise<WorkoutBundle | null> {
  const workout = await db.workouts.get(workoutId)
  if (!workout) return null
  const exercises = await db.workoutExercises.where('workoutId').equals(workoutId).sortBy('order')
  const sets = exercises.length ? await db.sets.where('workoutExerciseId').anyOf(exercises.map((item) => item.id)).sortBy('order') : []
  const [cardio, wods] = await Promise.all([db.cardio.where('workoutId').equals(workoutId).toArray(), db.wods.where('workoutId').equals(workoutId).toArray()])
  return { workout, exercises, sets, cardio, wods }
}

export async function getExerciseSessions(exerciseId: string): Promise<ExerciseSession[]> {
  const links = await db.workoutExercises.where('exerciseId').equals(exerciseId).toArray()
  const result = await Promise.all(links.map(async (link) => ({ workout: await db.workouts.get(link.workoutId), sets: await db.sets.where('workoutExerciseId').equals(link.id).sortBy('order') })))
  return result.filter((item): item is { workout: NonNullable<typeof item.workout>; sets: SetEntry[] } => Boolean(item.workout)).sort((a, b) => b.workout.date.localeCompare(a.workout.date) || b.workout.startTime.localeCompare(a.workout.startTime))
}
