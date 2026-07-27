import { describe, expect, it } from 'vitest'
import { mergeBackupData, validateBackup } from '../services/backup'
import type { BackupData } from '../types'

const empty = (): BackupData => ({ version:2,exportedAt:new Date().toISOString(),settings:[],exercises:[],workouts:[],workoutExercises:[],sets:[],cardio:[],wods:[],bodyMeasurements:[],personalRecords:[],recommendations:[] })
describe('copias de seguridad', () => {
  it('valida una copia compatible', () => expect(validateBackup(empty()).version).toBe(2))
  it('rechaza formatos incompatibles', () => expect(() => validateBackup({ hello:'world' })).toThrow())
  it('no duplica identificadores al fusionar', () => { const a=empty(); const exercise={ id:'same',name:'Sentadilla',updatedAt:'2026-01-01',active:true,favorite:false } as never; a.exercises=[exercise]; const b=empty(); b.exercises=[exercise]; expect(mergeBackupData(a,b).exercises).toHaveLength(1) })
  it('fusiona ejercicios equivalentes y conserva sus referencias', () => {
    const a=empty(); const b=empty()
    a.exercises=[{ id:'z-device',name:'Press de banca',updatedAt:'2026-01-01',active:true,favorite:false } as never]
    b.exercises=[{ id:'a-device',name:'  PRÉSS   DE BANCA ',updatedAt:'2026-01-02',active:true,favorite:false } as never]
    a.workoutExercises=[{ id:'link-a',exerciseId:'z-device' } as never]
    b.recommendations=[{ id:'coach-a',exerciseId:'a-device' } as never]
    const merged=mergeBackupData(a,b)
    expect(merged.exercises).toHaveLength(1)
    expect(merged.exercises[0].id).toBe('a-device')
    expect(merged.workoutExercises[0].exerciseId).toBe('a-device')
    expect(merged.recommendations[0].exerciseId).toBe('a-device')
  })
})
