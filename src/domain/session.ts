/**
 * Plan de la sesión guiada diaria (≈25 min):
 * calentamiento (repaso) → palabras nuevas → práctica → habla → resumen.
 */
import { createRng, seedFrom, shuffle } from './random';
import { EXERCISE_KINDS, type Concept, type DayExercises, type Exercise } from './types';

export const SESSION_STEPS = ['warmup', 'learn', 'practice', 'speak', 'summary'] as const;
export type SessionStep = (typeof SESSION_STEPS)[number];

export const STEP_LABELS: Record<SessionStep, string> = {
  warmup: 'Calentamiento',
  learn: 'Palabras nuevas',
  practice: 'Práctica',
  speak: 'Habla',
  summary: 'Resumen',
};

export const PRACTICE_PER_KIND = 2;
export const SPEAKING_SENTENCES = 3;

/**
 * Elige 2 ejercicios de cada tipo (12 en total), priorizando los que aún no se han hecho
 * para que repetir la sesión de un día siempre traiga práctica nueva.
 */
export function pickPracticeExercises(
  exercises: DayExercises,
  answered: ReadonlySet<string>,
  perKind = PRACTICE_PER_KIND,
): Exercise[] {
  return EXERCISE_KINDS.flatMap((kind) => {
    const list = exercises[kind];
    const pending = list.filter((e) => !answered.has(e.id));
    const done = list.filter((e) => answered.has(e.id));
    return [...pending, ...done].slice(0, perKind);
  });
}

/** Frases para decir en voz alta: varían cada día pero son estables durante el mismo día. */
export function pickSpeakingSentences(
  concepts: readonly Concept[],
  seed: string,
  count = SPEAKING_SENTENCES,
): Concept[] {
  return shuffle(concepts, createRng(seedFrom(seed))).slice(0, count);
}

export function nextStep(step: SessionStep): SessionStep {
  const index = SESSION_STEPS.indexOf(step);
  return SESSION_STEPS[Math.min(index + 1, SESSION_STEPS.length - 1)] as SessionStep;
}

/** El día 0 no hay vocabulario anterior, así que la sesión empieza en "Palabras nuevas". */
export function firstStep(hasReview: boolean): SessionStep {
  return hasReview ? 'warmup' : 'learn';
}
