import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { initialData, useProgress } from '@/store/progress';
import { renderRoute } from '@/test/render';

describe('navegación', () => {
  beforeEach(() => useProgress.setState(initialData()));

  it('muestra el panel de inicio con el día actual', async () => {
    renderRoute('/');
    expect(await screen.findByRole('heading', { name: 'Tu sesión de hoy' })).toBeInTheDocument();
    expect(screen.getByText(/Día 0 · Diagnóstico y supervivencia/)).toBeInTheDocument();
  });

  it('abre un día de la ruta y lo marca como día actual', async () => {
    renderRoute('/ruta/12');
    expect(await screen.findByRole('heading', { level: 1, name: 'Casa' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(15);
    expect(useProgress.getState().currentDay).toBe(12);
  });

  it('redirige días inexistentes a la ruta', async () => {
    renderRoute('/ruta/99');
    expect(await screen.findByRole('heading', { name: 'Ruta de 31 días' })).toBeInTheDocument();
  });

  it('carga la teoría bajo demanda', async () => {
    renderRoute('/teoria');
    expect(
      await screen.findByRole('heading', { name: '4. Presente simple y continuo' }),
    ).toBeInTheDocument();
  });
});
