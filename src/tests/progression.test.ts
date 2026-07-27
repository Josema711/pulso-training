import { describe, expect, it } from 'vitest'
import { defaultSettings } from '../db/database'
import { detectPlateau, generateCoachRecommendation, type ExerciseSession } from '../logic/progression'
import type { Exercise, SetEntry, Workout } from '../types'

const exercise: Exercise = { id:'e', name:'Press banca', primaryMuscle:'Pecho', secondaryMuscles:[], type:'Fuerza', equipment:'Barra', unit:'Kilogramos', minIncrement:2.5, targetMinReps:8, targetMaxReps:10, usualSets:3, restSeconds:120, progressionMethod:'Doble progresión', technicalNotes:'', active:true, favorite:false, perDumbbell:false, createdAt:'', updatedAt:'' }
const session = (id:string, reps:number, weight=60, rir:number|null=2): ExerciseSession => ({ workout:{ id,date:`2026-01-0${id}`,startTime:'10:00',endTime:'11:00',name:'',type:'Fuerza',notes:'',status:'completed',energy:null,effort:null,performance:null,fatigue:null,sleepQuality:null,sleepHours:null,pain:'',comments:'',createdAt:'',updatedAt:'' } as Workout, sets:[0,1,2].map((order)=>({ id:`${id}-${order}`,workoutExerciseId:'we',order,type:'Efectiva',weight,reps,rir,rpe:null,completed:true,notes:'',completedAt:'',createdAt:'',updatedAt:'' } as SetEntry)) })
describe('progresión', () => {
  it('devuelve datos insuficientes sin sesiones', () => expect(generateCoachRecommendation(exercise, [], defaultSettings).action).toBe('insufficient_data'))
  it('propone subida tras dos sesiones completas', () => { const result=generateCoachRecommendation(exercise,[session('2',10),session('1',10)],defaultSettings); expect(result.action).toBe('increase_weight'); expect(result.recommendedWeight).toBe(62.5) })
  it('mantiene carga y sube repeticiones dentro del rango', () => expect(generateCoachRecommendation(exercise,[session('1',9)],defaultSettings).action).toBe('increase_reps'))
  it('reduce con fallo y esfuerzo máximo', () => expect(generateCoachRecommendation(exercise,[session('1',6,60,0)],defaultSettings).action).toBe('reduce_weight'))
  it('detecta estancamiento tras tres sesiones comparables', () => expect(detectPlateau([session('3',8),session('2',8),session('1',8)],3)).toBe(true))
  it('no detecta estancamiento con solo dos sesiones', () => expect(detectPlateau([session('2',8),session('1',8)],3)).toBe(false))
})
