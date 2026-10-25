import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it } from 'vitest';
import { toDayKey } from '@/domain/dates';
import { initialData, useProgress } from '@/store/progress';
import { Flashcards } from './Flashcards';

beforeEach(() => {
  useProgress.setState(initialData());
  useProgress
    .getState()
    .addCard({ en: 'travel', es: 'viajar', example: 'I travel a lot.' }, toDayKey());
});

it('muestra la respuesta, califica con teclado y termina la sesión', async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <Flashcards />
    </MemoryRouter>,
  );
  expect(screen.getByText('travel')).toBeInTheDocument();
  expect(screen.queryByText('viajar')).not.toBeInTheDocument();

  await user.keyboard(' ');
  expect(screen.getByText('viajar')).toBeInTheDocument();

  await user.keyboard('3'); // "Bien"
  expect(screen.getByText(/Sesión terminada/)).toBeInTheDocument();
  expect(useProgress.getState().cards.travel?.repetitions).toBe(1);
});
