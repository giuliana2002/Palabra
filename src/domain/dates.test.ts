import { describe, expect, it } from 'vitest';
import { addDays, diffDays, toDayKey } from './dates';

describe('fechas', () => {
  it('formatea en local como YYYY-MM-DD', () => {
    expect(toDayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('suma días cruzando meses y años bisiestos', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('calcula diferencias en días', () => {
    expect(diffDays('2026-01-01', '2026-01-31')).toBe(30);
  });
});
