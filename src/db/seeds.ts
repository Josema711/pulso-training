import type { Equipment, Exercise, ExerciseType } from '../types'
import { nowIso, uid } from '../utils'

const rows: Array<[string, string, ExerciseType, Equipment, number, number, number]> = [
  ['Press banca', 'Pecho', 'Fuerza', 'Barra', 2.5, 6, 10], ['Press inclinado con mancuernas', 'Pecho', 'Hipertrofia', 'Mancuernas', 2, 8, 12],
  ['Sentadilla', 'Cuádriceps', 'Fuerza', 'Barra', 2.5, 5, 8], ['Front squat', 'Cuádriceps', 'Fuerza', 'Barra', 2.5, 3, 8],
  ['Peso muerto', 'Espalda', 'Fuerza', 'Barra', 5, 3, 6], ['Peso muerto rumano', 'Isquiotibiales', 'Hipertrofia', 'Barra', 2.5, 6, 10],
  ['Press militar', 'Hombros', 'Fuerza', 'Barra', 2.5, 5, 10], ['Jalón al pecho', 'Espalda', 'Hipertrofia', 'Polea', 5, 8, 12],
  ['Dominadas', 'Espalda', 'Peso corporal', 'Peso corporal', 1, 5, 12], ['Remo en polea', 'Espalda', 'Hipertrofia', 'Polea', 5, 8, 12],
  ['Prensa de piernas', 'Cuádriceps', 'Hipertrofia', 'Máquina', 5, 8, 15], ['Extensión de cuádriceps', 'Cuádriceps', 'Hipertrofia', 'Máquina', 5, 10, 15],
  ['Curl femoral', 'Isquiotibiales', 'Hipertrofia', 'Máquina', 5, 10, 15], ['Curl de bíceps', 'Bíceps', 'Hipertrofia', 'Mancuernas', 2, 8, 15],
  ['Extensión de tríceps', 'Tríceps', 'Hipertrofia', 'Polea', 2.5, 8, 15], ['Elevaciones laterales', 'Hombros', 'Hipertrofia', 'Mancuernas', 1, 10, 20],
  ['Fondos', 'Pecho', 'Peso corporal', 'Peso corporal', 1, 6, 12], ['Hip thrust', 'Glúteos', 'Hipertrofia', 'Barra', 2.5, 6, 12],
  ['Power clean', 'Cuerpo completo', 'CrossFit', 'Barra', 2.5, 2, 6], ['Hang power clean', 'Cuerpo completo', 'CrossFit', 'Barra', 2.5, 2, 6],
  ['Push press', 'Hombros', 'CrossFit', 'Barra', 2.5, 3, 10], ['Toes to bar', 'Core', 'CrossFit', 'Peso corporal', 1, 5, 15],
  ['Burpees', 'Cuerpo completo', 'CrossFit', 'Peso corporal', 1, 5, 20], ['Box jumps', 'Piernas', 'CrossFit', 'Peso corporal', 1, 5, 20],
  ['Carrera', 'Cardio', 'Cardio', 'Cardio', 1, 1, 1], ['Bicicleta', 'Cardio', 'Cardio', 'Cardio', 1, 1, 1],
  ['Remo', 'Cardio', 'Cardio', 'Cardio', 1, 1, 1], ['Escaladora', 'Cardio', 'Cardio', 'Cardio', 1, 1, 1],
]

export function basicExercises(): Exercise[] {
  const timestamp = nowIso()
  return rows.map(([name, primaryMuscle, type, equipment, minIncrement, targetMinReps, targetMaxReps]) => ({
    id: uid(), name, primaryMuscle, secondaryMuscles: [], type, equipment, unit: type === 'Cardio' ? 'Kilómetros' : type === 'Peso corporal' ? 'Repeticiones' : 'Kilogramos',
    minIncrement, targetMinReps, targetMaxReps, usualSets: 3, restSeconds: type === 'Fuerza' ? 180 : 90,
    progressionMethod: type === 'Cardio' || type === 'CrossFit' ? 'Sin recomendación automática' : 'Doble progresión',
    technicalNotes: '', active: true, favorite: false, perDumbbell: equipment === 'Mancuernas', createdAt: timestamp, updatedAt: timestamp,
  }))
}
