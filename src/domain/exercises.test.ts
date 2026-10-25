import { describe, expect, it } from 'vitest';
import { BANKS, DAYS } from '@/data';
import { createRng } from './random';
import { normalize, sameSentence } from './text';
import {
  blankOut,
  checkProduction,
  EXERCISES_PER_DAY,
  EXERCISES_PER_KIND,
  generateDay,
  listeningDistractors,
} from './exercises';
import { EXERCISE_KINDS, type ChoiceExercise } from './types';

describe('generateDay', () => {
  it('genera 90 actividades (15 de cada tipo) para todos los días', () => {
    for (const day of DAYS) {
      const exercises = generateDay(day, BANKS);
      const total = EXERCISE_KINDS.reduce((n, kind) => n + exercises[kind].length, 0);
      expect(total).toBe(EXERCISES_PER_DAY);
      for (const kind of EXERCISE_KINDS) expect(exercises[kind]).toHaveLength(EXERCISES_PER_KIND);
    }
  });

  it('es determinista: el mismo día genera siempre lo mismo', () => {
    const day = DAYS[3]!;
    expect(generateDay(day, BANKS)).toEqual(generateDay(day, BANKS));
  });

  it('usa identificadores únicos en toda la ruta', () => {
    const ids = DAYS.flatMap((day) =>
      EXERCISE_KINDS.flatMap((k) => generateDay(day, BANKS)[k].map((e) => e.id)),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('las preguntas de opción múltiple tienen opciones distintas e incluyen la respuesta', () => {
    for (const day of DAYS) {
      const exercises = generateDay(day, BANKS);
      for (const kind of ['meaning', 'fix', 'dialogue', 'listen'] as const) {
        for (const exercise of exercises[kind] as ChoiceExercise[]) {
          const normalized = exercise.options.map(normalize);
          expect(new Set(normalized).size, `${exercise.id}: ${exercise.options.join(' / ')}`).toBe(
            exercise.options.length,
          );
          expect(exercise.options).toContain(exercise.answer);
          expect(exercise.options.length).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });

  it('las fichas de "Construir frases" reconstruyen la respuesta (incluidas preguntas)', () => {
    for (const day of DAYS) {
      for (const exercise of generateDay(day, BANKS).build) {
        if (exercise.kind !== 'build') throw new Error('tipo inesperado');
        const sorted = [...exercise.tokens].sort().join(' ');
        const expected = exercise.answer
          .replace(/[.!?]+$/, '')
          .split(' ')
          .sort()
          .join(' ');
        expect(sorted).toBe(expected);
      }
    }
  });

  it('la escucha activa siempre tiene distractores diferentes a la frase', () => {
    for (const day of DAYS) {
      for (const exercise of generateDay(day, BANKS).listen as ChoiceExercise[]) {
        const wrong = exercise.options.filter((o) => o !== exercise.answer);
        expect(wrong).toHaveLength(2);
        for (const option of wrong) expect(sameSentence(option, exercise.answer)).toBe(false);
      }
    }
  });
});

describe('blankOut', () => {
  it('sustituye la expresión respetando límites de palabra', () => {
    expect(blankOut('I need help with this.', 'help')).toBe('I need _____ with this.');
    expect(blankOut('Hello, nice to meet you.', 'hello')).toBe('_____, nice to meet you.');
    expect(blankOut("Let's go to the cinema.", "Let's")).toBe('_____ go to the cinema.');
  });

  it('no sustituye dentro de otra palabra', () => {
    expect(blankOut('The cathedral is old.', 'cat')).toBeNull();
  });
});

describe('listeningDistractors', () => {
  it('crea pares mínimos cambiando una sola palabra', () => {
    const concept = { en: 'tired', es: 'cansado', example: 'She is tired today.' };
    const result = listeningDistractors(concept.example, concept, [concept], createRng(3));
    expect(result).toHaveLength(2);
    for (const variant of result) {
      const a = variant.split(' ');
      const b = concept.example.split(' ');
      expect(a.length).toBe(b.length);
      expect(a.filter((w, i) => w !== b[i])).toHaveLength(1);
    }
  });
});

describe('checkProduction', () => {
  it('acepta una frase válida que usa el concepto', () => {
    expect(checkProduction('I live in a small flat.', 'live', 5).ok).toBe(true);
  });

  it('explica por qué una frase no es válida', () => {
    const feedback = checkProduction('i like it', 'travel', 5);
    expect(feedback.ok).toBe(false);
    expect(feedback.issues).toHaveLength(2);
    expect(feedback.tips).toContain('El pronombre «I» siempre va en mayúscula.');
  });
});
