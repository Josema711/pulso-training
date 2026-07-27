import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, Activity, Flame, Pencil, Trophy } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db } from '../db/database'
import { getWorkoutBundle } from '../services/workouts'
import { calculateWorkoutVolume, effectiveSets, totalReps } from '../logic/calculations'
import { formatNumber } from '../utils'
import { Button, Card, Loading, PageHeader, Stat } from '../components/ui'

export function WorkoutDetailPage() {
  const { id = '' } = useParams(); const navigate = useNavigate(); const bundle = useLiveQuery(() => getWorkoutBundle(id), [id]); const exercises = useLiveQuery(() => db.exercises.toArray(), []) || []; const records = useLiveQuery(() => db.personalRecords.where('workoutId').equals(id).toArray(), [id]) || []
  if (bundle === undefined) return <Loading />; if (!bundle) return <div className="page"><p>Sesión no encontrada.</p></div>
  const { workout, sets, cardio, wods } = bundle
  async function editWorkout() { const other = await db.workouts.where('status').equals('active').first(); if (other && other.id !== workout.id) { alert('Finaliza primero la sesión que está en curso.'); return } await db.workouts.update(workout.id, { status: 'active', endTime: null }); navigate('/entrenamiento') }
  return <div className="page"><Link to="/historial" className="back-link"><ArrowLeft /> Volver al historial</Link><PageHeader eyebrow={workout.status === 'completed' ? 'SESIÓN COMPLETADA' : 'BORRADOR'} title={workout.name || workout.type} subtitle={`${workout.date} · ${workout.startTime}${workout.endTime ? `–${workout.endTime}` : ''}`} action={<Button onClick={editWorkout}><Pencil /> {workout.status === 'active' ? 'Continuar editando' : 'Editar sesión'}</Button>} />
    <div className="stats-grid"><Stat label="Volumen" value={`${formatNumber(calculateWorkoutVolume(sets), 0)} kg`} /><Stat label="Series efectivas" value={effectiveSets(sets)} /><Stat label="Repeticiones" value={totalReps(sets)} /><Stat label="Ejercicios" value={bundle.exercises.length} /></div>
    {records.length > 0 && <Card className="pr-summary"><Trophy /><div><small>RÉCORDS DE LA SESIÓN</small><h3>{records.length} nuevas marcas</h3><p>{records.map((r) => `${r.type}: ${formatNumber(r.value)}`).join(' · ')}</p></div></Card>}
    <div className="detail-grid">{bundle.exercises.map((link) => { const exercise = exercises.find((e) => e.id === link.exerciseId); const exerciseSets = sets.filter((s) => s.workoutExerciseId === link.id).sort((a,b) => a.order-b.order); return <Card key={link.id}><h3>{exercise?.name || 'Ejercicio eliminado'}</h3><div className="detail-sets">{exerciseSets.map((set) => <div key={set.id}><span>{set.order + 1}</span><b>{set.weight ?? '—'} kg × {set.reps ?? '—'}</b><small>{set.type}{set.rir != null ? ` · RIR ${set.rir}` : ''}{set.rpe != null ? ` · RPE ${set.rpe}` : ''}</small><i className={set.completed ? 'yes' : ''}>{set.completed ? 'Hecha' : 'Pendiente'}</i></div>)}</div></Card> })}</div>
    {(cardio.length > 0 || wods.length > 0) && <div className="detail-grid">{cardio.map((x) => <Card key={x.id}><Activity /><h3>{x.type}</h3><p>{x.durationMinutes} min · {x.distance} km{x.pace ? ` · ${formatNumber(x.pace)} min/km` : ''}</p></Card>)}{wods.map((x) => <Card key={x.id}><Flame /><h3>{x.name}</h3><p>{x.type} · {x.result}</p></Card>)}</div>}
    <Card className="session-context"><h3>Contexto registrado</h3><div className="context-grid"><span>Energía <b>{workout.energy ?? '—'}/5</b></span><span>Esfuerzo <b>{workout.effort ?? '—'}/10</b></span><span>Rendimiento <b>{workout.performance ?? '—'}/5</b></span><span>Fatiga <b>{workout.fatigue ?? '—'}/5</b></span></div>{workout.pain && <p><b>Molestias:</b> {workout.pain}</p>}{workout.comments && <p>{workout.comments}</p>}</Card>
  </div>
}
