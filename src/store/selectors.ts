import { EXERCISES_PER_DAY } from '@/domain/exercises';
import type { ProgressData } from './progress';

/** Nº de actividades respondidas por día de la ruta. */
export function answeredByDay(results: ProgressData['results']): Map<number, number> {
  const counts = new Map<number, number>();
  for (const r of Object.values(results)) counts.set(r.day, (counts.get(r.day) ?? 0) + 1);
  return counts;
}

export function isDayComplete(results: ProgressData['results'], day: number): boolean {
  return (answeredByDay(results).get(day) ?? 0) >= EXERCISES_PER_DAY;
}
