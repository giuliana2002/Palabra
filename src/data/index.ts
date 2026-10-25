import { generateDay, type ContentBanks } from '@/domain/exercises';
import type { DayExercises } from '@/domain/types';
import { DAYS } from './days';
import { DIALOGUES } from './dialogues';
import { ERRORS } from './errors';

export { DAYS, TOTAL_DAYS, getDay } from './days';
export { DIALOGUES } from './dialogues';
export { ERRORS } from './errors';

export const BANKS: ContentBanks = { errors: ERRORS, dialogues: DIALOGUES };

const cache = new Map<number, DayExercises>();

/** Ejercicios de un día, memorizados: generarlos es determinista. */
export function exercisesForDay(dayId: number): DayExercises {
  const cached = cache.get(dayId);
  if (cached) return cached;
  const plan = DAYS[dayId];
  if (!plan) throw new Error(`Día inexistente: ${dayId}`);
  const result = generateDay(plan, BANKS);
  cache.set(dayId, result);
  return result;
}
