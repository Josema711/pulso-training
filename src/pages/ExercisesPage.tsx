import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Archive, Copy, Dumbbell, Heart, MoreVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { db } from '../db/database'
import type { Exercise } from '../types'
import { nowIso, uid } from '../utils'
import { Button, Card, EmptyState, Modal, PageHeader, Select } from '../components/ui'
import { ExerciseForm } from '../features/exercises/ExerciseForm'

export function ExercisesPage() {
  const exercises = useLiveQuery(() => db.exercises.orderBy('name').toArray(), []) || []
  const [query, setQuery] = useState(''); const [type, setType] = useState('Todos'); const [editing, setEditing] = useState<Exercise | null | undefined>()
  const filtered = exercises.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()) && (type === 'Todos' || e.type === type))
  async function save(value: Exercise) { await db.exercises.put(value); setEditing(undefined); toast.success(editing ? 'Ejercicio actualizado' : 'Ejercicio creado') }
  async function remove(exercise: Exercise) { if (!confirm(`¿Eliminar ${exercise.name}? Su historial no se eliminará.`)) return; await db.exercises.delete(exercise.id); toast.success('Ejercicio eliminado') }
  return <div className="page"><PageHeader eyebrow="BIBLIOTECA" title="Tus ejercicios" subtitle={`${exercises.filter((e) => e.active).length} activos · todos editables`} action={<Button onClick={() => setEditing(null)}><Plus /> Nuevo ejercicio</Button>} />
    <div className="filter-bar"><div className="search"><Search /><input aria-label="Buscar ejercicios" placeholder="Buscar por nombre…" value={query} onChange={(e) => setQuery(e.target.value)} /></div><Select value={type} onChange={(e) => setType(e.target.value)}><option>Todos</option>{['Fuerza','Hipertrofia','Peso corporal','Cardio','CrossFit','Movilidad','Otro'].map((x) => <option key={x}>{x}</option>)}</Select></div>
    {filtered.length ? <div className="exercise-grid">{filtered.map((exercise) => <Card className={`exercise-card ${!exercise.active ? 'archived' : ''}`} key={exercise.id}><div className="exercise-top"><span className="muscle-badge">{exercise.primaryMuscle}</span><button className="icon-btn" onClick={() => db.exercises.update(exercise.id, { favorite: !exercise.favorite })} aria-label="Favorito"><Heart fill={exercise.favorite ? 'currentColor' : 'none'} /></button></div><Link to={`/ejercicios/${exercise.id}`}><h3>{exercise.name}</h3><p>{exercise.equipment} · {exercise.targetMinReps}–{exercise.targetMaxReps} reps</p><div className="exercise-meta"><span>{exercise.usualSets} series</span><span>{exercise.minIncrement} kg incremento</span><span>{exercise.restSeconds}s descanso</span></div></Link><div className="card-actions"><Button variant="ghost" onClick={() => setEditing(exercise)}><Pencil /> Editar</Button><button title="Duplicar" className="icon-btn" onClick={() => db.exercises.add({ ...exercise, id: uid(), name: `${exercise.name} (copia)`, createdAt: nowIso(), updatedAt: nowIso() })}><Copy /></button><button title={exercise.active ? 'Archivar' : 'Activar'} className="icon-btn" onClick={() => db.exercises.update(exercise.id, { active: !exercise.active, updatedAt: nowIso() })}><Archive /></button><button title="Eliminar" className="icon-btn danger" onClick={() => remove(exercise)}><Trash2 /></button><MoreVertical className="mobile-more" /></div></Card>)}</div> : <EmptyState icon={<Dumbbell />} title="No hay ejercicios aquí" text="Crea tu primer ejercicio o cambia los filtros." action={<Button onClick={() => setEditing(null)}><Plus /> Crear ejercicio</Button>} />}
    {editing !== undefined && <Modal title={editing ? `Editar ${editing.name}` : 'Nuevo ejercicio'} onClose={() => setEditing(undefined)}><ExerciseForm exercise={editing || undefined} onSave={save} onCancel={() => setEditing(undefined)} /></Modal>}
  </div>
}
