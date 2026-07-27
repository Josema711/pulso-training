import type { Exercise, PersonalRecord, SetEntry } from '../types'
import { calculateSetVolume, estimateOneRepMax } from './calculations'
import { nowIso, uid } from '../utils'
import { effectiveMetric, getTrackingMode } from './tracking'

export function detectPersonalRecords(exerciseId: string, workoutId: string, sets: SetEntry[], previous: PersonalRecord[] = [], exercise?: Exercise) {
  if (exercise && getTrackingMode(exercise) !== 'weight_reps') {
    const completed = sets.filter((set) => set.completed && set.type !== 'Calentamiento')
    const candidates = exercise ? [
      { metric: 'reps', type: 'Más repeticiones' }, { metric: 'meters', type: 'Mayor distancia' }, { metric: 'calories', type: 'Más calorías' }, { metric: 'seconds', type: 'Mayor duración' },
    ].flatMap(({ metric, type }) => { const values = completed.filter((set) => effectiveMetric(set, exercise) === metric).map((set) => metric === 'reps' ? set.reps || 0 : set.metricValue || 0); return values.length ? [{ type, value: Math.max(...values) }] : [] }) : []
    return candidates.flatMap(({ type, value }) => { const old = Math.max(0, ...previous.filter((record) => record.type === type).map((record) => record.value)); if (value <= old) return []; return [{ id: uid(), exerciseId, workoutId, type, previousValue: old || null, value, improvement: old ? value - old : null, improvementPercentage: old ? ((value - old) / old) * 100 : null, achievedAt: nowIso(), createdAt: nowIso() } satisfies PersonalRecord] })
  }
  const valid = sets.filter((set) => set.completed && set.type !== 'Calentamiento' && (set.weight || 0) > 0 && (set.reps || 0) > 0)
  if (!valid.length) return []
  const candidates = [
    { type: 'Mayor peso', value: Math.max(...valid.map((set) => set.weight || 0)) },
    { type: '1RM estimado', value: Math.max(...valid.map((set) => estimateOneRepMax(set.weight || 0, set.reps || 0))) },
    { type: 'Volumen de serie', value: Math.max(...valid.map(calculateSetVolume)) },
  ]
  return candidates.flatMap(({ type, value }) => {
    const old = Math.max(0, ...previous.filter((record) => record.type === type).map((record) => record.value))
    if (value <= old) return []
    return [{ id: uid(), exerciseId, workoutId, type, previousValue: old || null, value, improvement: old ? value - old : null, improvementPercentage: old ? ((value - old) / old) * 100 : null, achievedAt: nowIso(), createdAt: nowIso() } satisfies PersonalRecord]
  })
}
