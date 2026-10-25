import { describe, expect, it } from 'vitest';
import {
  accuracyByKind,
  activitySeries,
  currentStreak,
  dayCompletion,
  longestStreak,
} from './stats';

describe('rachas', () => {
  const activity = { '2026-03-01': 3, '2026-03-02': 5, '2026-03-03': 1, '2026-03-05': 2 };

  it('cuenta días consecutivos hasta hoy', () => {
    expect(currentStreak(activity, '2026-03-03')).toBe(3);
  });

  it('mantiene la racha si hoy aún no se ha practicado', () => {
    expect(currentStreak(activity, '2026-03-04')).toBe(3);
  });

  it('la rompe si ayer no hubo práctica', () => {
    expect(currentStreak(activity, '2026-03-07')).toBe(0);
  });

  it('calcula la racha más larga', () => {
    expect(longestStreak(activity)).toBe(3);
  });
});

describe('precisión y actividad', () => {
  it('agrupa aciertos por tipo de ejercicio', () => {
    const results = [
      { ok: true, kind: 'fix', day: 0, at: '2026-03-01' },
      { ok: false, kind: 'fix', day: 0, at: '2026-03-01' },
      { ok: true, kind: 'listen', day: 0, at: '2026-03-01' },
    ] as const;
    const byKind = accuracyByKind(results);
    expect(byKind.find((k) => k.kind === 'fix')).toMatchObject({
      total: 2,
      correct: 1,
      accuracy: 50,
    });
    expect(byKind.find((k) => k.kind === 'meaning')).toMatchObject({ total: 0, accuracy: 0 });
  });

  it('genera una serie de días contiguos terminando hoy', () => {
    const series = activitySeries({ '2026-03-02': 4 }, '2026-03-03', 3);
    expect(series).toEqual([
      { day: '2026-03-01', count: 0 },
      { day: '2026-03-02', count: 4 },
      { day: '2026-03-03', count: 0 },
    ]);
  });

  it('calcula el porcentaje completado de un día', () => {
    const results = Array.from({ length: 45 }, () => ({
      ok: true,
      kind: 'fix' as const,
      day: 2,
      at: 'x',
    }));
    expect(dayCompletion(results, 2, 90)).toBe(50);
  });
});
