import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ExerciseForm } from '../features/exercises/ExerciseForm'

describe('componentes de registro', () => {
  it('valida el nombre del ejercicio en español', async () => { const { container } = render(<ExerciseForm onSave={vi.fn()} onCancel={vi.fn()} />); fireEvent.submit(container.querySelector('form')!); expect(await screen.findByText('El ejercicio debe tener nombre')).toBeInTheDocument() })
  it('crea un ejercicio con datos válidos', async () => { const onSave=vi.fn(); const { container } = render(<ExerciseForm onSave={onSave} onCancel={vi.fn()} />); fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Press en máquina' } }); fireEvent.submit(container.querySelector('form')!); await waitFor(() => expect(onSave).toHaveBeenCalledOnce()) })
})
