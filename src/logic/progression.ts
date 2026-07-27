import type { AppSettings, CoachRecommendation, Exercise, ExerciseProgressionAnalysis, SetEntry, Workout } from '../types'
import { calculateExerciseVolume, calculatePercentageChange, estimateOneRepMax, roundToIncrement } from './calculations'
import { nowIso, uid } from '../utils'

export interface ExerciseSession { workout: Workout; sets: SetEntry[] }
const workingSets = (sets: SetEntry[]) => sets.filter((set) => set.completed && ['Efectiva', 'Drop set', 'Back-off', 'Al fallo'].includes(set.type) && (set.reps || 0) > 0)

export function detectPlateau(sessions: ExerciseSession[], minimum = 3) {
  const valid = sessions.filter((session) => session.workout.status === 'completed' && !session.workout.pain && workingSets(session.sets).length).slice(0, minimum)
  if (valid.length < minimum) return false
  const scores = valid.map(({ sets }) => Math.max(...workingSets(sets).map((set) => estimateOneRepMax(set.weight || 0, set.reps || 0))))
  return scores.every((score, index) => index === 0 || score <= scores[index - 1] * 1.005)
}

export function generateCoachRecommendation(exercise: Exercise, sessions: ExerciseSession[], settings: AppSettings): CoachRecommendation {
  const comparable = sessions.filter((session) => session.workout.status === 'completed' && !session.workout.pain && workingSets(session.sets).length).slice(0, 3)
  const base = { id: uid(), exerciseId: exercise.id, generatedAt: nowIso(), recommendedMinReps: exercise.targetMinReps, recommendedMaxReps: exercise.targetMaxReps, recommendedSets: exercise.usualSets, sourceWorkoutIds: comparable.map((item) => item.workout.id) }
  if (!comparable.length || exercise.progressionMethod === 'Sin recomendación automática') return { ...base, action: 'insufficient_data', recommendedWeight: null, confidence: 'low', reason: 'Aún no hay sesiones completas comparables. Registra al menos una sesión para obtener una referencia.', percentageChange: null }
  const latest = workingSets(comparable[0].sets)
  const currentWeight = Math.max(...latest.map((set) => set.weight || 0))
  const allAtMax = latest.length >= exercise.usualSets && latest.every((set) => (set.reps || 0) >= exercise.targetMaxReps)
  const averageRir = latest.some((set) => set.rir != null) ? latest.reduce((sum, set) => sum + (set.rir || 0), 0) / latest.filter((set) => set.rir != null).length : null
  const averageRpe = latest.some((set) => set.rpe != null) ? latest.reduce((sum, set) => sum + (set.rpe || 0), 0) / latest.filter((set) => set.rpe != null).length : null
  const consistent = comparable.slice(0, settings.sessionsBeforeIncrease).length >= settings.sessionsBeforeIncrease && comparable.slice(0, settings.sessionsBeforeIncrease).every((session) => workingSets(session.sets).every((set) => (set.reps || 0) >= exercise.targetMaxReps))
  const canIncrease = allAtMax && (averageRir == null || averageRir >= 1) && (averageRpe == null || averageRpe <= 9) && (settings.sessionsBeforeIncrease === 1 || consistent)
  if (canIncrease && currentWeight > 0) {
    const next = roundToIncrement(currentWeight + exercise.minIncrement, exercise.minIncrement, currentWeight, settings.maxIncreasePercent)
    if (next > currentWeight) return { ...base, action: 'increase_weight', recommendedWeight: next, confidence: comparable.length >= 2 ? 'high' : 'medium', reason: `Has completado el límite superior del rango con ${currentWeight} kg${averageRir != null ? ` y RIR medio ${averageRir.toFixed(1)}` : ''}. El incremento respeta tu límite prudente.`, percentageChange: calculatePercentageChange(currentWeight, next) }
    return { ...base, action: 'increase_reps', recommendedWeight: currentWeight, confidence: 'high', reason: `El siguiente incremento disponible (${exercise.minIncrement} kg) supera el ${settings.maxIncreasePercent} % permitido. Mantén la carga y progresa con repeticiones.`, percentageChange: 0 }
  }
  const belowMinimum = latest.filter((set) => (set.reps || 0) < exercise.targetMinReps).length >= Math.ceil(latest.length / 2)
  if (belowMinimum && ((averageRir != null && averageRir === 0) || (averageRpe != null && averageRpe >= 9.5))) {
    const reduced = Math.max(0, roundToIncrement(currentWeight * 0.95, exercise.minIncrement, 0, 100))
    return { ...base, action: 'reduce_weight', recommendedWeight: reduced, confidence: 'medium', reason: 'Varias series quedaron por debajo del rango con un esfuerzo muy alto. Una reducción ligera puede ayudarte a recuperar el rango.', percentageChange: calculatePercentageChange(currentWeight, reduced) }
  }
  return { ...base, action: allAtMax ? 'repeat' : 'increase_reps', recommendedWeight: currentWeight || null, confidence: comparable.length >= 2 ? 'medium' : 'low', reason: allAtMax ? 'Has alcanzado el rango, pero conviene confirmar el rendimiento en otra sesión antes de subir.' : `Mantén ${currentWeight || 'la carga actual'} e intenta acercar todas las series a ${exercise.targetMaxReps} repeticiones.`, percentageChange: 0 }
}

export function analyseExerciseProgression(exercise: Exercise, sessions: ExerciseSession[], settings: AppSettings): ExerciseProgressionAnalysis {
  const recommendation = generateCoachRecommendation(exercise, sessions, settings)
  const vols = sessions.slice(0, 3).map((session) => calculateExerciseVolume(workingSets(session.sets)))
  const trend = vols.length < 2 ? 'unknown' : vols[0] > vols[1] * 1.01 ? 'up' : vols[0] < vols[1] * .99 ? 'down' : 'flat'
  return { action: recommendation.action, trend, plateau: detectPlateau(sessions, settings.plateauSessions), recommendation }
}
