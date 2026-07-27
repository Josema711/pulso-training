import { useState, type FormEvent } from 'react'
import type { Equipment, Exercise, ExerciseType, ProgressionMethod, TrackingMode } from '../../types'
import { nowIso, uid } from '../../utils'
import { Button, Input, Select } from '../../components/ui'
import { exerciseSchema } from '../../validation/schemas'
import { getTrackingMode, trackingLabels } from '../../logic/tracking'

const types: ExerciseType[] = ['Fuerza', 'Hipertrofia', 'Peso corporal', 'Cardio', 'CrossFit', 'Movilidad', 'Otro']
const equipment: Equipment[] = ['Barra', 'Mancuernas', 'Máquina', 'Polea', 'Kettlebell', 'Peso corporal', 'Disco', 'Banda elástica', 'Cardio', 'Otro']
const methods: ProgressionMethod[] = ['Doble progresión', 'Progresión lineal', 'Progresión por RIR', 'Progresión por RPE', 'Progresión por 1RM estimado', 'Sin recomendación automática']
const trackingModes = Object.keys(trackingLabels) as TrackingMode[]
const initial = { name: '', primaryMuscle: 'Pecho', type: 'Hipertrofia' as ExerciseType, equipment: 'Mancuernas' as Equipment, trackingMode: 'weight_reps' as TrackingMode, minIncrement: 2, targetMinReps: 8, targetMaxReps: 12, usualSets: 3, restSeconds: 90, progressionMethod: 'Doble progresión' as ProgressionMethod, technicalNotes: '', perDumbbell: true }
export function ExerciseForm({ exercise, onSave, onCancel }: { exercise?: Exercise; onSave: (value: Exercise) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState(() => exercise ? { ...exercise, trackingMode: getTrackingMode(exercise) } : initial); const [error, setError] = useState('')
  const set = (key: string, value: unknown) => setForm((old) => ({ ...old, [key]: value }))
  async function submit(event: FormEvent) { event.preventDefault(); const result = exerciseSchema.safeParse(form); if (!result.success) { setError(result.error.issues[0].message); return } const timestamp = nowIso(); const units: Record<TrackingMode, string> = { weight_reps:'Kilogramos',reps:'Repeticiones',distance:'Metros',calories:'Kilocalorías',time:'Segundos',ergometer:'Variable' }; await onSave({ secondaryMuscles: [], unit: units[form.trackingMode], active: true, favorite: false, createdAt: timestamp, id: uid(), ...form, updatedAt: timestamp } as Exercise) }
  return <form onSubmit={submit} className="form-grid">
    <Input label="Nombre *" value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />
    <Input label="Grupo muscular principal *" value={form.primaryMuscle} onChange={(e) => set('primaryMuscle', e.target.value)} />
    <Select label="Tipo" value={form.type} onChange={(e) => set('type', e.target.value)}>{types.map((item) => <option key={item}>{item}</option>)}</Select>
    <Select label="Equipamiento" value={form.equipment} onChange={(e) => { set('equipment', e.target.value); set('perDumbbell', e.target.value === 'Mancuernas') }}>{equipment.map((item) => <option key={item}>{item}</option>)}</Select>
    <Select label="Cómo se registra" value={form.trackingMode} onChange={(e) => { const mode = e.target.value as TrackingMode; set('trackingMode', mode); if (mode !== 'weight_reps') set('progressionMethod', 'Sin recomendación automática') }}>{trackingModes.map((item) => <option key={item} value={item}>{trackingLabels[item]}</option>)}</Select>
    {form.trackingMode === 'weight_reps' && <Input label="Incremento mínimo (kg)" type="number" step="0.25" min="0.01" value={form.minIncrement} onChange={(e) => set('minIncrement', Number(e.target.value))} />}
    {(form.trackingMode === 'weight_reps' || form.trackingMode === 'reps') && <div className="split"><Input label="Reps mín." type="number" min="0" value={form.targetMinReps} onChange={(e) => set('targetMinReps', Number(e.target.value))} /><Input label="Reps máx." type="number" min="0" value={form.targetMaxReps} onChange={(e) => set('targetMaxReps', Number(e.target.value))} /></div>}
    <Input label="Series habituales" type="number" min="1" value={form.usualSets} onChange={(e) => set('usualSets', Number(e.target.value))} />
    <Input label="Descanso (segundos)" type="number" min="0" step="15" value={form.restSeconds} onChange={(e) => set('restSeconds', Number(e.target.value))} />
    {form.trackingMode === 'weight_reps' && <Select label="Método de progresión" value={form.progressionMethod} onChange={(e) => set('progressionMethod', e.target.value)}>{methods.map((item) => <option key={item}>{item}</option>)}</Select>}
    <label className="field full"><span>Notas técnicas</span><textarea value={form.technicalNotes} onChange={(e) => set('technicalNotes', e.target.value)} /></label>
    {form.trackingMode === 'weight_reps' && form.equipment === 'Mancuernas' && <label className="check full"><input type="checkbox" checked={form.perDumbbell} onChange={(e) => set('perDumbbell', e.target.checked)} /> El peso corresponde a cada mancuerna</label>}
    {error && <p className="error full">{error}</p>}
    <div className="form-actions full"><Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button><Button type="submit">{exercise ? 'Guardar cambios' : 'Crear ejercicio'}</Button></div>
  </form>
}
