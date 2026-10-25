/** Fechas como claves "YYYY-MM-DD" en hora local: sencillas de guardar, comparar y ordenar. */
export type DayKey = string;

export function toDayKey(date: Date = new Date()): DayKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromDayKey(key: DayKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y as number, (m as number) - 1, d as number);
}

export function addDays(key: DayKey, days: number): DayKey {
  const date = fromDayKey(key);
  date.setDate(date.getDate() + days);
  return toDayKey(date);
}

export function diffDays(from: DayKey, to: DayKey): number {
  const ms = fromDayKey(to).getTime() - fromDayKey(from).getTime();
  return Math.round(ms / 86_400_000);
}
