export const uid = () => crypto.randomUUID()
export const nowIso = () => new Date().toISOString()
export const localDate = () => new Date().toISOString().slice(0, 10)
export const localTime = () => new Date().toTimeString().slice(0, 5)
export const formatNumber = (value: number, digits = 1) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: digits }).format(value)
export const formatWeight = (value: number, unit = 'kg') => `${formatNumber(value)} ${unit}`
export const actionLabels = { increase_weight: 'Subir peso', maintain_weight: 'Mantener peso', increase_reps: 'Aumentar repeticiones', reduce_weight: 'Reducir peso', repeat: 'Repetir sesión', insufficient_data: 'Datos insuficientes' } as const
