import { describe, expect, it } from 'vitest';
import { createRng, sample, seedFrom, shuffle } from './random';

describe('rng con semilla', () => {
  it('es determinista para la misma semilla', () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('genera valores en [0, 1)', () => {
    const rng = createRng(seedFrom('palabra'));
    for (let i = 0; i < 1000; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('shuffle conserva los elementos y no muta el original', () => {
    const original = [1, 2, 3, 4, 5];
    const result = shuffle(original, createRng(1));
    expect(original).toEqual([1, 2, 3, 4, 5]);
    expect([...result].sort()).toEqual(original);
  });

  it('sample devuelve elementos distintos', () => {
    const picked = sample(['a', 'b', 'c', 'd'], 3, createRng(7));
    expect(new Set(picked).size).toBe(3);
  });
});
