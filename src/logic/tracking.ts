import type { Exercise, SetEntry, SetMetric, TrackingMode } from '../types'
import { formatNumber } from '../utils'

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export function getTrackingMode(exercise: Exercise): TrackingMode {
  if (exercise.trackingMode) return exercise.trackingMode
  const name = normalize(exercise.name)
  if (['burpee', 'box jump', 'salto', 'toes to bar'].some((term) => name.includes(term))) return 'reps'
  if (name.includes('ski erg') || name.includes('skierg') || name === 'remo' || name.includes('row erg') || name.includes('assault bike') || name.includes('bike erg') || name.includes('bicicleta')) return 'ergometer'
  if (name.includes('carrera')) return 'distance'
  if (exercise.type === 'Cardio') return 'time'
  return 'weight_reps'
}

export const trackingLabels: Record<TrackingMode, string> = {
  weight_reps: 'Peso + repeticiones', reps: 'Solo repeticiones', distance: 'Distancia (metros)', calories: 'Calorías', time: 'Tiempo', ergometer: 'Ergómetro: metros, kcal o tiempo',
}

export function defaultSetMetric(mode: TrackingMode): SetMetric {
  if (mode === 'reps') return 'reps'
  if (mode === 'distance' || mode === 'ergometer') return 'meters'
  if (mode === 'calories') return 'calories'
  if (mode === 'time') return 'seconds'
  return 'weight_reps'
}

export const metricUnit = (metric: SetMetric) => metric === 'meters' ? 'm' : metric === 'calories' ? 'kcal' : metric === 'seconds' ? 's' : metric === 'reps' ? 'reps' : 'kg'
export const metricStep = (metric: SetMetric) => metric === 'meters' ? 50 : metric === 'seconds' ? 5 : 1

export function effectiveMetric(set: SetEntry, exercise: Exercise): SetMetric {
  const mode = getTrackingMode(exercise)
  if (mode === 'ergometer' && set.metric && ['meters', 'calories', 'seconds'].includes(set.metric)) return set.metric
  return defaultSetMetric(mode)
}

export function formatSetPerformance(set: SetEntry, exercise: Exercise) {
  const metric = effectiveMetric(set, exercise)
  if (metric === 'weight_reps') return `${formatNumber(set.weight || 0)} kg × ${set.reps ?? '—'}`
  if (metric === 'reps') return `${set.reps ?? '—'} reps`
  const value = set.metricValue ?? 0
  if (metric === 'seconds') {
    const minutes = Math.floor(value / 60); const seconds = Math.round(value % 60)
    return minutes ? `${minutes}:${String(seconds).padStart(2, '0')} min` : `${seconds} s`
  }
  return `${formatNumber(value, 0)} ${metricUnit(metric)}`
}

export function exerciseSummary(sets: SetEntry[], exercise: Exercise) {
  const completed = sets.filter((set) => set.completed)
  if (getTrackingMode(exercise) === 'weight_reps') return `${formatNumber(completed.reduce((sum, set) => sum + (set.weight || 0) * (set.reps || 0), 0), 0)} kg volumen`
  const totals = new Map<SetMetric, number>()
  completed.forEach((set) => { const metric = effectiveMetric(set, exercise); const value = metric === 'reps' ? set.reps || 0 : set.metricValue || 0; totals.set(metric, (totals.get(metric) || 0) + value) })
  return [...totals].map(([metric, value]) => metric === 'seconds' ? formatSetPerformance({ ...completed[0], metric, metricValue: value }, exercise) : `${formatNumber(value, 0)} ${metricUnit(metric)}`).join(' · ') || 'Sin registros'
}
