import type { SetEntry } from '../types'

export const calculateSetVolume = (set: Pick<SetEntry, 'weight' | 'reps' | 'completed'>) => set.completed && set.weight && set.reps ? set.weight * set.reps : 0
export const calculateExerciseVolume = (sets: SetEntry[]) => sets.reduce((sum, set) => sum + calculateSetVolume(set), 0)
export const calculateWorkoutVolume = (sets: SetEntry[]) => calculateExerciseVolume(sets)
export const effectiveSets = (sets: SetEntry[]) => sets.filter((set) => set.completed && ['Efectiva', 'Drop set', 'Back-off', 'Al fallo'].includes(set.type)).length
export const totalReps = (sets: SetEntry[]) => sets.reduce((sum, set) => sum + (set.completed ? set.reps || 0 : 0), 0)

export function estimateOneRepMax(weight: number, reps: number, formula: 'Epley' | 'Brzycki' | 'Lombardi' = 'Epley') {
  if (weight <= 0 || reps <= 0 || (formula === 'Brzycki' && reps >= 37)) return 0
  if (reps === 1) return weight
  if (formula === 'Brzycki') return weight * 36 / (37 - reps)
  if (formula === 'Lombardi') return weight * Math.pow(reps, 0.1)
  return weight * (1 + reps / 30)
}

export const calculatePercentageChange = (previous: number, current: number) => previous === 0 ? null : ((current - previous) / previous) * 100
export const kgToLb = (kg: number) => kg * 2.2046226218
export const lbToKg = (lb: number) => lb / 2.2046226218

export function roundToIncrement(calculated: number, increment: number, current = 0, maxIncreasePercent = 5) {
  if (increment <= 0) throw new Error('El incremento debe ser superior a cero')
  const rounded = Math.round(calculated / increment) * increment
  if (current > 0 && rounded > current * (1 + maxIncreasePercent / 100)) return current
  return Number(rounded.toFixed(4))
}

export function calculateMovingAverage(values: Array<{ date: string; value: number }>, days = 7) {
  const sorted = [...values].sort((a, b) => a.date.localeCompare(b.date))
  return sorted.map((item, index) => {
    const from = new Date(item.date); from.setDate(from.getDate() - days + 1)
    const window = sorted.slice(0, index + 1).filter((candidate) => new Date(candidate.date) >= from)
    return { date: item.date, value: window.reduce((sum, point) => sum + point.value, 0) / window.length }
  })
}
