export type ExerciseType = 'Fuerza' | 'Hipertrofia' | 'Peso corporal' | 'Cardio' | 'CrossFit' | 'Movilidad' | 'Otro'
export type Equipment = 'Barra' | 'Mancuernas' | 'Máquina' | 'Polea' | 'Kettlebell' | 'Peso corporal' | 'Disco' | 'Banda elástica' | 'Cardio' | 'Otro'
export type ProgressionMethod = 'Doble progresión' | 'Progresión lineal' | 'Progresión por RIR' | 'Progresión por RPE' | 'Progresión por 1RM estimado' | 'Sin recomendación automática'
export type SetType = 'Calentamiento' | 'Aproximación' | 'Efectiva' | 'Drop set' | 'Back-off' | 'Al fallo' | 'Técnica' | 'Otro'
export type SessionType = 'Gimnasio' | 'Fuerza' | 'Hipertrofia' | 'CrossFit' | 'Cardio' | 'Mixto' | 'Otro'
export type RecommendationAction = 'increase_weight' | 'maintain_weight' | 'increase_reps' | 'reduce_weight' | 'repeat' | 'insufficient_data'
export type TrackingMode = 'weight_reps' | 'reps' | 'distance' | 'calories' | 'time' | 'ergometer'
export type SetMetric = 'weight_reps' | 'reps' | 'meters' | 'calories' | 'seconds'

export interface Exercise {
  id: string; name: string; primaryMuscle: string; secondaryMuscles: string[]; type: ExerciseType
  equipment: Equipment; unit: string; minIncrement: number; targetMinReps: number; targetMaxReps: number
  usualSets: number; restSeconds: number; progressionMethod: ProgressionMethod; technicalNotes: string
  active: boolean; favorite: boolean; perDumbbell: boolean; createdAt: string; updatedAt: string
  trackingMode?: TrackingMode
}
export interface Workout {
  id: string; date: string; startTime: string; endTime: string | null; name: string; type: SessionType
  notes: string; status: 'active' | 'completed'; energy: number | null; effort: number | null
  performance: number | null; fatigue: number | null; sleepQuality: number | null; sleepHours: number | null
  pain: string; comments: string; createdAt: string; updatedAt: string
}
export interface WorkoutExercise { id: string; workoutId: string; exerciseId: string; order: number; notes: string; createdAt: string; updatedAt: string }
export interface SetEntry { id: string; workoutExerciseId: string; order: number; type: SetType; weight: number | null; reps: number | null; metric?: SetMetric; metricValue?: number | null; rir: number | null; rpe: number | null; completed: boolean; notes: string; completedAt: string | null; createdAt: string; updatedAt: string }
export interface CardioEntry { id: string; workoutId: string; type: string; durationMinutes: number | null; distance: number | null; pace: number | null; averageSpeed: number | null; calories: number | null; averageHeartRate: number | null; maxHeartRate: number | null; incline: number | null; resistance: number | null; effortZone: string; notes: string; createdAt: string; updatedAt: string }
export interface WodMovement { id: string; name: string; reps: number | null; weight: number | null; distance: number | null; calories: number | null; unit: string; notes: string }
export interface WodEntry { id: string; workoutId: string; name: string; type: string; durationMinutes: number | null; timeCapMinutes: number | null; rounds: number | null; extraReps: number | null; finalTimeSeconds: number | null; rxWeight: number | null; usedWeight: number | null; scale: 'RX' | 'Escalado'; movements: WodMovement[]; result: string; notes: string; createdAt: string; updatedAt: string }
export interface BodyMeasurement { id: string; date: string; time: string; weight: number; bodyFat: number | null; waist: number | null; chest: number | null; hips: number | null; rightArm: number | null; leftArm: number | null; rightThigh: number | null; leftThigh: number | null; neck: number | null; comments: string; conditions: string; createdAt: string; updatedAt: string }
export interface PersonalRecord { id: string; exerciseId: string | null; workoutId: string; type: string; previousValue: number | null; value: number; improvement: number | null; improvementPercentage: number | null; achievedAt: string; createdAt: string }
export interface CoachRecommendation { id: string; exerciseId: string; generatedAt: string; action: RecommendationAction; recommendedWeight: number | null; recommendedMinReps: number | null; recommendedMaxReps: number | null; recommendedSets: number | null; confidence: 'low' | 'medium' | 'high'; reason: string; sourceWorkoutIds: string[]; percentageChange: number | null; dismissed?: boolean }
export interface AppSettings { id: 'settings'; nickname: string; weightUnit: 'kg' | 'lb'; distanceUnit: 'km' | 'mi'; theme: 'dark' | 'light' | 'system'; oneRmFormula: 'Epley' | 'Brzycki' | 'Lombardi'; maxIncreasePercent: number; defaultProgression: ProgressionMethod; preferredEffort: 'RIR' | 'RPE'; autoTimer: boolean; sounds: boolean; vibration: boolean; defaultRestSeconds: number; weekStartsOn: 0 | 1; bodyGoal: string; targetWeight: number | null; weeklyWorkoutGoal: number | null; weeklyCardioGoal: number | null; weightLogGoal: number | null; showAdvanced: boolean; plateauSessions: number; sessionsBeforeIncrease: number; maxOneRmReps: number; onboardingDone: boolean; updatedAt: string }
export interface ProgressSummary { workoutCount: number; volume: number; effectiveSets: number; totalReps: number }
export interface ExerciseProgressionAnalysis { action: RecommendationAction; trend: 'up' | 'flat' | 'down' | 'unknown'; plateau: boolean; recommendation: CoachRecommendation }
export interface WorkoutBundle { workout: Workout; exercises: WorkoutExercise[]; sets: SetEntry[]; cardio: CardioEntry[]; wods: WodEntry[] }
export interface BackupData { version: number; exportedAt: string; settings: AppSettings[]; exercises: Exercise[]; workouts: Workout[]; workoutExercises: WorkoutExercise[]; sets: SetEntry[]; cardio: CardioEntry[]; wods: WodEntry[]; bodyMeasurements: BodyMeasurement[]; personalRecords: PersonalRecord[]; recommendations: CoachRecommendation[] }
