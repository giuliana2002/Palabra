/** Cálculos de estadísticas a partir de los resultados guardados. */
import { addDays, type DayKey } from './dates';
import { EXERCISE_KINDS, type ExerciseKind } from './types';

export interface ExerciseResult {
  ok: boolean;
  kind: ExerciseKind;
  day: number;
  at: DayKey;
}

/** Días consecutivos con actividad terminando hoy (o ayer, para no romper la racha a primera hora). */
export function currentStreak(activity: Record<DayKey, number>, today: DayKey): number {
  let cursor = (activity[today] ?? 0) > 0 ? today : addDays(today, -1);
  let streak = 0;
  while ((activity[cursor] ?? 0) > 0) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreak(activity: Record<DayKey, number>): number {
  const days = Object.keys(activity)
    .filter((k) => (activity[k] ?? 0) > 0)
    .sort();
  let best = 0;
  let run = 0;
  let previous: DayKey | null = null;
  for (const day of days) {
    run = previous && addDays(previous, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }
  return best;
}

export interface KindAccuracy {
  kind: ExerciseKind;
  total: number;
  correct: number;
  accuracy: number;
}

export function accuracyByKind(results: Iterable<ExerciseResult>): KindAccuracy[] {
  const totals = new Map<ExerciseKind, { total: number; correct: number }>(
    EXERCISE_KINDS.map((k) => [k, { total: 0, correct: 0 }]),
  );
  for (const r of results) {
    const entry = totals.get(r.kind);
    if (!entry) continue;
    entry.total++;
    if (r.ok) entry.correct++;
  }
  return EXERCISE_KINDS.map((kind) => {
    const { total, correct } = totals.get(kind) ?? { total: 0, correct: 0 };
    return { kind, total, correct, accuracy: total ? Math.round((correct / total) * 100) : 0 };
  });
}

/** Actividad de los últimos `length` días, del más antiguo al más reciente. */
export function activitySeries(
  activity: Record<DayKey, number>,
  today: DayKey,
  length = 14,
): Array<{ day: DayKey; count: number }> {
  return Array.from({ length }, (_, i) => {
    const day = addDays(today, i - length + 1);
    return { day, count: activity[day] ?? 0 };
  });
}

export function dayCompletion(
  results: Iterable<ExerciseResult>,
  day: number,
  perDay: number,
): number {
  let n = 0;
  for (const r of results) if (r.day === day) n++;
  return Math.min(100, Math.round((n / perDay) * 100));
}
