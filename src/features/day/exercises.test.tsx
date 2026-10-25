import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import type { BuildExercise, ChoiceExercise } from '@/domain/types';
import { initialData, useProgress } from '@/store/progress';
import { ExerciseCard } from './ExerciseCard';

const concept = { en: 'repeat', es: 'repetir', example: 'Can you repeat that, please?' };

const build: BuildExercise = {
  id: 'test-build',
  day: 0,
  kind: 'build',
  concept,
  prompt: 'Ordena las palabras.',
  tokens: ['please', 'Can', 'that,', 'repeat', 'you'],
  answer: 'Can you repeat that, please?',
  hint: '',
};

const choice: ChoiceExercise = {
  id: 'test-choice',
  day: 0,
  kind: 'meaning',
  concept,
  prompt: '¿Qué significa «repetir»?',
  options: ['learn', 'repeat', 'ready'],
  answer: 'repeat',
};

describe('Construir frases', () => {
  beforeEach(() => useProgress.setState(initialData()));

  it('acepta preguntas (antes nunca se podían acertar) y permite deshacer', async () => {
    const user = userEvent.setup();
    render(<ExerciseCard exercise={build} index={0} />);
    const bank = screen.getByRole('group', { name: 'Palabras disponibles' });

    await user.click(within(bank).getByRole('button', { name: 'please' }));
    await user.click(screen.getByRole('button', { name: /Deshacer/ }));
    for (const word of ['Can', 'you', 'repeat', 'that,', 'please']) {
      await user.click(within(bank).getByRole('button', { name: word }));
    }
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));

    expect(useProgress.getState().results['test-build']?.ok).toBe(true);
    expect(screen.getByRole('status')).toHaveTextContent('¡Correcto!');
  });

  it('una ficha colocada se puede quitar pulsándola', async () => {
    const user = userEvent.setup();
    render(<ExerciseCard exercise={build} index={0} />);
    await user.click(screen.getByRole('button', { name: 'Can' }));
    await user.click(screen.getByRole('button', { name: 'Quitar «Can»' }));
    expect(screen.getByText('Pulsa las palabras en orden…')).toBeInTheDocument();
  });
});

describe('Opción múltiple', () => {
  beforeEach(() => useProgress.setState(initialData()));

  it('guarda el fallo, muestra la corrección y crea la tarjeta de repaso', async () => {
    const user = userEvent.setup();
    render(<ExerciseCard exercise={choice} index={0} />);
    await user.click(screen.getByRole('button', { name: 'learn' }));

    expect(screen.getByRole('status')).toHaveTextContent('La respuesta correcta es: repeat');
    for (const option of choice.options)
      expect(screen.getByRole('button', { name: option })).toBeDisabled();
    const state = useProgress.getState();
    expect(state.mistakes[0]).toMatchObject({ given: 'learn', correct: 'repeat' });
    expect(state.cards.repeat).toBeDefined();
  });
});
