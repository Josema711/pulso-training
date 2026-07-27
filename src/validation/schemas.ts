import { z } from 'zod'

export const exerciseSchema = z.object({
  name: z.string().trim().min(1, 'El ejercicio debe tener nombre'), primaryMuscle: z.string().min(1, 'Indica el grupo muscular'),
  minIncrement: z.number().positive('El incremento debe ser superior a cero'), targetMinReps: z.number().int().min(0),
  targetMaxReps: z.number().int().min(0), usualSets: z.number().int().positive(), restSeconds: z.number().min(0),
}).refine((data) => data.targetMaxReps >= data.targetMinReps, { message: 'El máximo no puede ser inferior al mínimo', path: ['targetMaxReps'] })
export const setSchema = z.object({ weight: z.number().min(0, 'El peso no puede ser negativo').nullable(), reps: z.number().int().min(0, 'Las repeticiones no pueden ser negativas').nullable(), rir: z.number().min(0).max(5).nullable(), rpe: z.number().min(1).max(10).nullable() })
export const bodyMeasurementSchema = z.object({ date: z.string().date(), weight: z.number().positive('El peso debe ser superior a cero') })
export const backupSchema = z.object({ version: z.number().int().positive(), exportedAt: z.string(), settings: z.array(z.unknown()), exercises: z.array(z.unknown()), workouts: z.array(z.unknown()), workoutExercises: z.array(z.unknown()), sets: z.array(z.unknown()), cardio: z.array(z.unknown()), wods: z.array(z.unknown()), bodyMeasurements: z.array(z.unknown()), personalRecords: z.array(z.unknown()), recommendations: z.array(z.unknown()) })
