import { describe, expect, it } from 'vitest'
import { mergeBackupData, validateBackup } from '../services/backup'
import type { BackupData } from '../types'

const empty = (): BackupData => ({ version:2,exportedAt:new Date().toISOString(),settings:[],exercises:[],workouts:[],workoutExercises:[],sets:[],cardio:[],wods:[],bodyMeasurements:[],personalRecords:[],recommendations:[] })
describe('copias de seguridad', () => {
  it('valida una copia compatible', () => expect(validateBackup(empty()).version).toBe(2))
  it('rechaza formatos incompatibles', () => expect(() => validateBackup({ hello:'world' })).toThrow())
  it('no duplica identificadores al fusionar', () => { const a=empty(); const exercise={ id:'same' } as never; a.exercises=[exercise]; const b=empty(); b.exercises=[exercise]; expect(mergeBackupData(a,b).exercises).toHaveLength(1) })
})
