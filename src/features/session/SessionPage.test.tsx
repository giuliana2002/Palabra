import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { toDayKey } from '@/domain/dates';
import { initialData, useProgress } from '@/store/progress';
import { renderRoute } from '@/test/render';

async function answerQuiz(user: ReturnType<typeof userEvent.setup>, finish: string) {
  for (;;) {
    const options = within(screen.getByRole('group', { name: 'Opciones' })).getAllByRole('button');
    await user.click(options[0]!);
    const finishButton = screen.queryByRole('button', { name: new RegExp(finish) });
    if (finishButton) return user.click(finishButton);
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));
  }
}

describe('sesión guiada', () => {
  beforeEach(() => useProgress.setState({ ...initialData(), currentDay: 1 }));

  it('recorre los 5 pasos, actualiza el repaso y avanza al día siguiente', async () => {
    const user = userEvent.setup();
    renderRoute('/sesion');

    // 1. Calentamiento: test de repaso con vocabulario del día 0
    expect(await screen.findByText(/Calentamiento:/)).toBeInTheDocument();
    await answerQuiz(user, 'Continuar');
    expect(Object.keys(useProgress.getState().cards)).toHaveLength(10);

    // 2. Palabras nuevas
    expect(screen.getByText(/Palabras nuevas:/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ya me las sé, ir a la práctica' }));

    // 3. Práctica: 12 actividades (2 de cada tipo); las saltamos
    expect(screen.getByText(/12 actividades/)).toBeInTheDocument();
    for (let i = 0; i < 11; i++) await user.click(screen.getByRole('button', { name: 'Saltar' }));
    await user.click(screen.getByRole('button', { name: 'Saltar' }));

    // 4. Habla (jsdom no tiene reconocimiento de voz: modo escuchar y repetir)
    for (let i = 0; i < 3; i++)
      await user.click(screen.getByRole('button', { name: 'Ya la he repetido' }));

    // 5. Resumen
    expect(screen.getByRole('heading', { name: '¡Sesión completada!' })).toBeInTheDocument();
    const state = useProgress.getState();
    expect(state.currentDay).toBe(2);
    expect(state.sessions[toDayKey()]).toMatchObject({ day: 1, total: 10 });
  });

  it('el día 0 empieza directamente por las palabras nuevas', async () => {
    useProgress.setState({ currentDay: 0 });
    renderRoute('/sesion');
    expect(await screen.findByText(/Palabras nuevas:/)).toBeInTheDocument();
    expect(screen.queryByText(/Calentamiento:/)).not.toBeInTheDocument();
  });
});

describe('examen semanal', () => {
  beforeEach(() => useProgress.setState(initialData()));

  it('se hace de principio a fin y guarda la nota', async () => {
    const user = userEvent.setup();
    renderRoute('/examen/1');
    await user.click(await screen.findByRole('button', { name: /Empezar examen/ }));
    await answerQuiz(user, 'Ver resultado');
    expect(screen.getByRole('heading', { name: /Aprobado|Todavía no/ })).toBeInTheDocument();
    expect(useProgress.getState().exams['semana-1']).toMatchObject({ attempts: 1 });
  });

  it('una semana inexistente vuelve a la ruta', async () => {
    renderRoute('/examen/9');
    expect(await screen.findByRole('heading', { name: 'Ruta de 31 días' })).toBeInTheDocument();
  });
});
