import { describe, expect, it } from 'vitest'
import { calculateExerciseVolume, calculateMovingAverage, calculatePercentageChange, estimateOneRepMax, kgToLb, lbToKg, roundToIncrement } from '../logic/calculations'
import type { SetEntry } from '../types'

const makeSet = (weight: number, reps: number, completed = true): SetEntry => ({ id: crypto.randomUUID(), workoutExerciseId: 'we', order: 0, type: 'Efectiva', weight, reps, rir: null, rpe: null, completed, notes: '', completedAt: completed ? new Date().toISOString() : null, createdAt: '', updatedAt: '' })
describe('cálculos deportivos', () => {
  it('calcula volumen e ignora series pendientes', () => expect(calculateExerciseVolume([makeSet(60, 10), makeSet(60, 8), makeSet(100, 10, false)])).toBe(1080))
  it('calcula Epley', () => expect(estimateOneRepMax(100, 10, 'Epley')).toBeCloseTo(133.33, 1))
  it('calcula Brzycki', () => expect(estimateOneRepMax(100, 10, 'Brzycki')).toBeCloseTo(133.33, 1))
  it('calcula Lombardi', () => expect(estimateOneRepMax(100, 10, 'Lombardi')).toBeCloseTo(125.89, 1))
  it('redondea al incremento disponible', () => expect(roundToIncrement(61.8, 2.5, 60, 5)).toBe(62.5))
  it('bloquea incrementos sobre el límite', () => expect(roundToIncrement(12.5, 2.5, 10, 5)).toBe(10))
  it('calcula cambio porcentual y evita división por cero', () => { expect(calculatePercentageChange(100, 108)).toBe(8); expect(calculatePercentageChange(0, 5)).toBeNull() })
  it('convierte kg y lb de forma reversible', () => expect(lbToKg(kgToLb(82))).toBeCloseTo(82, 6))
  it('calcula media móvil temporal', () => { const result = calculateMovingAverage([{ date: '2026-01-01', value: 80 },{ date: '2026-01-02', value: 82 }], 7); expect(result[1].value).toBe(81) })
})
