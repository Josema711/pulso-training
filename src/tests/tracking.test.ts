import { describe, expect, it } from 'vitest'
import { defaultSetMetric, exerciseSummary, formatSetPerformance, getTrackingMode } from '../logic/tracking'
import type { Exercise, SetEntry } from '../types'

const exercise = (name: string, trackingMode?: Exercise['trackingMode']) => ({ name, trackingMode, type: 'CrossFit' } as Exercise)
const set = (metric: SetEntry['metric'], metricValue: number) => ({ metric, metricValue, completed: true, reps: null, weight: null } as SetEntry)

describe('métricas por ejercicio', () => {
  it('reconoce movimientos y ergómetros antiguos', () => {
    expect(getTrackingMode(exercise('Box jumps'))).toBe('reps')
    expect(getTrackingMode(exercise('SkiErg'))).toBe('ergometer')
    expect(getTrackingMode(exercise('Bicicleta'))).toBe('ergometer')
  })
  it('permite metros, kcal y tiempo en un ergómetro', () => {
    const ski = exercise('SkiErg', 'ergometer')
    expect(defaultSetMetric(getTrackingMode(ski))).toBe('meters')
    expect(formatSetPerformance(set('meters', 500), ski)).toBe('500 m')
    expect(formatSetPerformance(set('calories', 24), ski)).toBe('24 kcal')
    expect(formatSetPerformance(set('seconds', 95), ski)).toBe('1:35 min')
    expect(exerciseSummary([set('meters', 500), set('calories', 24)], ski)).toBe('500 m · 24 kcal')
  })
})
