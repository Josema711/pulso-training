import { db, defaultSettings } from '../db/database'
import type { BackupData } from '../types'
import { backupSchema } from '../validation/schemas'

export async function exportBackup(): Promise<BackupData> {
  const [settings, exercises, workouts, workoutExercises, sets, cardio, wods, bodyMeasurements, personalRecords, recommendations] = await Promise.all([
    db.settings.toArray(), db.exercises.toArray(), db.workouts.toArray(), db.workoutExercises.toArray(), db.sets.toArray(), db.cardio.toArray(), db.wods.toArray(), db.bodyMeasurements.toArray(), db.personalRecords.toArray(), db.recommendations.toArray(),
  ])
  return { version: 2, exportedAt: new Date().toISOString(), settings, exercises, workouts, workoutExercises, sets, cardio, wods, bodyMeasurements, personalRecords, recommendations }
}
export function validateBackup(value: unknown) { return backupSchema.parse(value) as BackupData }
const uniqueById = <T extends { id: string }>(items: T[]) => [...new Map(items.map((item) => [item.id, item])).values()]
const exerciseKey = (name: string) => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('es')
function deduplicateExercises(items: BackupData['exercises']) {
  const groups = new Map<string, BackupData['exercises']>()
  items.forEach((exercise) => { const key = exerciseKey(exercise.name); groups.set(key, [...(groups.get(key) || []), exercise]) })
  const idMap = new Map<string, string>()
  const exercises = [...groups.values()].map((group) => {
    const canonicalId = group.map((exercise) => exercise.id).sort()[0]
    group.forEach((exercise) => idMap.set(exercise.id, canonicalId))
    const newest = [...group].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
    return { ...newest, id: canonicalId, active: group.some((exercise) => exercise.active), favorite: group.some((exercise) => exercise.favorite) }
  })
  return { exercises, idMap }
}
export function mergeBackupData(current: BackupData, incoming: BackupData): BackupData {
  const { exercises, idMap } = deduplicateExercises(uniqueById([...current.exercises, ...incoming.exercises]))
  const exerciseId = (id: string) => idMap.get(id) || id
  const workoutExercises = uniqueById([...current.workoutExercises, ...incoming.workoutExercises]).map((link) => ({ ...link, exerciseId: exerciseId(link.exerciseId) }))
  const personalRecords = uniqueById([...current.personalRecords, ...incoming.personalRecords]).map((record) => ({ ...record, exerciseId: record.exerciseId ? exerciseId(record.exerciseId) : null }))
  const recommendations = uniqueById([...current.recommendations, ...incoming.recommendations]).map((item) => ({ ...item, exerciseId: exerciseId(item.exerciseId) }))
  return { version: Math.max(current.version, incoming.version), exportedAt: new Date().toISOString(), settings: incoming.settings.length ? incoming.settings : current.settings, exercises, workouts: uniqueById([...current.workouts, ...incoming.workouts]), workoutExercises, sets: uniqueById([...current.sets, ...incoming.sets]), cardio: uniqueById([...current.cardio, ...incoming.cardio]), wods: uniqueById([...current.wods, ...incoming.wods]), bodyMeasurements: uniqueById([...current.bodyMeasurements, ...incoming.bodyMeasurements]), personalRecords, recommendations }
}
export async function importBackup(data: BackupData, mode: 'merge' | 'replace') {
  const valid = validateBackup(data)
  const finalData = mode === 'merge' ? mergeBackupData(await exportBackup(), valid) : valid
  await db.transaction('rw', db.tables, async () => {
    if (mode === 'replace') await Promise.all(db.tables.map((table) => table.clear()))
    await Promise.all([
      db.settings.bulkPut(finalData.settings.length ? finalData.settings : [defaultSettings]), db.exercises.bulkPut(finalData.exercises), db.workouts.bulkPut(finalData.workouts), db.workoutExercises.bulkPut(finalData.workoutExercises), db.sets.bulkPut(finalData.sets), db.cardio.bulkPut(finalData.cardio), db.wods.bulkPut(finalData.wods), db.bodyMeasurements.bulkPut(finalData.bodyMeasurements), db.personalRecords.bulkPut(finalData.personalRecords), db.recommendations.bulkPut(finalData.recommendations),
    ])
  })
}
export function downloadFile(name: string, content: string, type: string) {
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type })); link.download = name; link.click(); URL.revokeObjectURL(link.href)
}
const cell = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
export function toCsv(rows: Record<string, unknown>[]) { if (!rows.length) return ''; const headers = Object.keys(rows[0]); return [headers.map(cell).join(','), ...rows.map((row) => headers.map((header) => cell(row[header])).join(','))].join('\n') }
