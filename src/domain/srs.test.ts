import { describe, expect, it } from 'vitest';
import { createCard, dueCards, INITIAL_EASE, isMastered, MIN_EASE, reviewCard } from './srs';

const base = createCard({ id: 'hello', front: 'hello', back: 'hola' }, '2026-01-01');

describe('SM-2', () => {
  it('sigue la secuencia de intervalos 1 → 6 → 6·EF', () => {
    const first = reviewCard(base, 4, '2026-01-01');
    expect(first).toMatchObject({ repetitions: 1, interval: 1, due: '2026-01-02' });
    const second = reviewCard(first, 4, '2026-01-02');
    expect(second).toMatchObject({ repetitions: 2, interval: 6, due: '2026-01-08' });
    const third = reviewCard(second, 4, '2026-01-08');
    expect(third.interval).toBe(Math.round(6 * second.ease));
  });

  it('una tarjeta nueva marcada como fácil salta directamente a 4 días', () => {
    expect(reviewCard(base, 5, '2026-01-01')).toMatchObject({ interval: 4, due: '2026-01-05' });
  });

  it('reinicia la tarjeta cuando se falla y cuenta el fallo', () => {
    const learned = reviewCard(reviewCard(base, 4, '2026-01-01'), 4, '2026-01-02');
    const failed = reviewCard(learned, 1, '2026-01-08');
    expect(failed).toMatchObject({ repetitions: 0, interval: 1, due: '2026-01-09', lapses: 1 });
  });

  it('ajusta el factor de facilidad según la calidad', () => {
    expect(reviewCard(base, 5, '2026-01-01').ease).toBeCloseTo(INITIAL_EASE + 0.1);
    expect(reviewCard(base, 4, '2026-01-01').ease).toBeCloseTo(INITIAL_EASE);
    expect(reviewCard(base, 3, '2026-01-01').ease).toBeCloseTo(INITIAL_EASE - 0.14);
  });

  it('nunca baja el factor de facilidad de 1,3', () => {
    let card = base;
    for (let i = 0; i < 20; i++) card = reviewCard(card, 0, '2026-01-01');
    expect(card.ease).toBe(MIN_EASE);
  });

  it('dueCards devuelve solo las pendientes, de la más antigua a la más reciente', () => {
    const cards = [
      { ...base, id: 'a', due: '2026-01-05' },
      { ...base, id: 'b', due: '2026-01-01' },
      { ...base, id: 'c', due: '2026-02-01' },
    ];
    expect(dueCards(cards, '2026-01-10').map((c) => c.id)).toEqual(['b', 'a']);
  });

  it('marca como dominada una tarjeta con intervalo ≥ 21 días', () => {
    expect(isMastered({ ...base, interval: 21 })).toBe(true);
    expect(isMastered({ ...base, interval: 6 })).toBe(false);
  });
});
