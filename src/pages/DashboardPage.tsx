import { useLiveQuery } from 'dexie-react-hooks'
import { addDays, formatDistanceToNow, isAfter, startOfMonth, startOfWeek, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowRight, Award, CalendarDays, Dumbbell, Plus, Scale, Sparkles, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { db, getSettings } from '../db/database'
import { getExerciseSessions } from '../services/workouts'
import { generateCoachRecommendation } from '../logic/progression'
import { calculateWorkoutVolume, effectiveSets } from '../logic/calculations'
import { actionLabels, formatNumber } from '../utils'
import { Button, Card, EmptyState, Loading, PageHeader, Stat } from '../components/ui'

export function DashboardPage() {
  const data = useLiveQuery(async () => {
    const [workouts, sets, measurements, records, allExercises, settings] = await Promise.all([db.workouts.where('status').equals('completed').reverse().sortBy('date'), db.sets.toArray(), db.bodyMeasurements.orderBy('date').reverse().toArray(), db.personalRecords.orderBy('achievedAt').reverse().limit(4).toArray(), db.exercises.toArray(), getSettings()])
    const exercises = allExercises.filter((exercise) => exercise.active)
    const now = new Date(); const weekStart = startOfWeek(now, { weekStartsOn: settings.weekStartsOn }); const monthStart = startOfMonth(now)
    const weekWorkouts = workouts.filter((w) => isAfter(new Date(w.date), addDays(weekStart, -1)))
    const monthWorkouts = workouts.filter((w) => isAfter(new Date(w.date), addDays(monthStart, -1)))
    const weekLinks = await db.workoutExercises.where('workoutId').anyOf(weekWorkouts.map((w) => w.id)).toArray(); const weekSets = sets.filter((s) => weekLinks.some((l) => l.id === s.workoutExerciseId))
    const recommendations = (await Promise.all(exercises.slice(0, 8).map(async (exercise) => generateCoachRecommendation(exercise, await getExerciseSessions(exercise.id), settings)))).filter((r) => r.action !== 'insufficient_data').slice(0, 3)
    return { workouts, measurements, records, exercises, weekCount: weekWorkouts.length, monthCount: monthWorkouts.length, weekVolume: calculateWorkoutVolume(weekSets), weekSets: effectiveSets(weekSets), recommendations }
  }, [])
  if (!data) return <Loading />
  const latestWeight = data.measurements[0]; const weightAt = (days: number) => data.measurements.find((m) => m.date <= subDays(new Date(), days).toISOString().slice(0, 10)); const delta = (days: number) => latestWeight && weightAt(days) ? latestWeight.weight - weightAt(days)!.weight : null
  return <div className="page"><PageHeader eyebrow="TU CENTRO DE CONTROL" title="Entrena con memoria." subtitle="Tu historial decide la siguiente mejora. Tú decides el entrenamiento." action={<Link to="/entrenamiento"><Button><Plus /> Registrar entrenamiento</Button></Link>} />
    <div className="hero-grid"><Card className="hero-card"><div><span className="status-dot" /> LISTO PARA ENTRENAR</div><h2>{data.workouts[0] ? `Última sesión: ${data.workouts[0].name || data.workouts[0].type}` : 'Tu próximo registro empieza aquí'}</h2><p>{data.workouts[0] ? `${data.workouts[0].date} · hace ${formatDistanceToNow(new Date(`${data.workouts[0].date}T${data.workouts[0].startTime}`), { locale: es })}` : 'Añade solo lo que hagas. Pulso recordará cargas y repeticiones.'}</p><Link to="/entrenamiento"><Button className="hero-button"><Dumbbell /> {data.workouts[0] ? 'Iniciar nueva sesión' : 'Registrar mi primera sesión'} <ArrowRight /></Button></Link></Card>
      <Card className="week-card"><CalendarDays /><span>Esta semana</span><strong>{data.weekCount}</strong><small>entrenamientos · {formatNumber(data.weekVolume, 0)} kg de volumen</small><div className="week-bars">{[0,1,2,3,4,5,6].map((d) => <i key={d} className={d < Math.min(data.weekCount, 7) ? 'filled' : ''} />)}</div></Card></div>
    <div className="stats-grid"><Stat label="Este mes" value={data.monthCount} detail="sesiones completadas" /><Stat label="Series efectivas" value={data.weekSets} detail="esta semana" /><Stat label="Peso actual" value={latestWeight ? `${formatNumber(latestWeight.weight)} kg` : '—'} detail={delta(7) == null ? 'sin registros suficientes' : `${delta(7)! > 0 ? '+' : ''}${formatNumber(delta(7)!)} kg en 7 días`} /><Stat label="Récords" value={data.records.length} detail="recientes" /></div>
    <div className="dashboard-grid"><Card className="coach-card"><div className="section-title"><div><Sparkles /><span><small>COACH DE PROGRESIÓN</small><h2>La siguiente mejora</h2></span></div></div>{data.recommendations.length ? data.recommendations.map((r) => { const ex = data.exercises.find((e) => e.id === r.exerciseId); return <Link to={`/ejercicios/${r.exerciseId}`} className="recommendation-row" key={r.id}><div className="recommendation-icon"><TrendingUp /></div><div><strong>{ex?.name}</strong><p><b>{actionLabels[r.action]}</b>{r.recommendedWeight ? ` · ${formatNumber(r.recommendedWeight)} kg` : ''}</p><small>{r.reason}</small></div><span className={`confidence ${r.confidence}`}>{r.confidence}</span></Link> }) : <EmptyState icon={<Sparkles />} title="El coach espera tus datos" text="Tras completar ejercicios, aquí aparecerán recomendaciones prudentes basadas solo en tu historial." />}</Card>
      <Card><div className="section-title"><div><Award /><span><small>ÚLTIMAS MARCAS</small><h2>Récords personales</h2></span></div></div>{data.records.length ? data.records.map((record) => <div className="record-row" key={record.id}><Award /><div><strong>{record.type}</strong><small>{record.achievedAt.slice(0,10)}</small></div><b>{formatNumber(record.value)}</b></div>) : <EmptyState icon={<Award />} title="Aún sin récords" text="Las marcas aparecerán automáticamente al completar series." />}</Card></div>
    {!latestWeight && <Card className="body-cta"><Scale /><div><h3>Registra tu cambio físico</h3><p>El peso es el único campo obligatorio. No añadimos consejos médicos ni nutricionales.</p></div><Link to="/progreso"><Button variant="secondary">Añadir peso</Button></Link></Card>}
  </div>
}
