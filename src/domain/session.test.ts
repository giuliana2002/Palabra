import { describe, expect, it } from 'vitest';
import { DAYS, exercisesForDay } from '@/data';
import { firstStep, nextStep, pickPracticeExercises, pickSpeakingSentences } from './session';

describe('sesión guiada', () => {
  const exercises = exercisesForDay(4);

  it('elige 2 ejercicios de cada uno de los 6 tipos', () => {
    const picked = pickPracticeExercises(exercises, new Set());
    expect(picked).toHaveLength(12);
    expect(new Set(picked.map((e) => e.kind)).size).toBe(6);
  });

  it('prioriza los ejercicios que aún no se han hecho', () => {
    const answered = new Set(exercises.meaning.slice(0, 5).map((e) => e.id));
    const meaning = pickPracticeExercises(exercises, answered).filter((e) => e.kind === 'meaning');
    expect(meaning.map((e) => e.id)).toEqual(exercises.meaning.slice(5, 7).map((e) => e.id));
  });

  it('si ya se hizo todo, repite en lugar de quedarse vacía', () => {
    const all = new Set(Object.values(exercises).flatMap((list) => list.map((e) => e.id)));
    expect(pickPracticeExercises(exercises, all)).toHaveLength(12);
  });

  it('elige 3 frases para hablar, estables con la misma semilla', () => {
    const a = pickSpeakingSentences(DAYS[4]!.concepts, '2026-10-25');
    expect(a).toHaveLength(3);
    expect(pickSpeakingSentences(DAYS[4]!.concepts, '2026-10-25')).toEqual(a);
  });

  it('salta el calentamiento si no hay días anteriores y avanza en orden', () => {
    expect(firstStep(false)).toBe('learn');
    expect(firstStep(true)).toBe('warmup');
    expect(nextStep('warmup')).toBe('learn');
    expect(nextStep('practice')).toBe('speak');
    expect(nextStep('summary')).toBe('summary');
  });
});
