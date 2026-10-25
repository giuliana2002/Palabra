/**
 * Repaso espaciado con el algoritmo SM-2 (SuperMemo 2, Piotr Woźniak, 1987),
 * el mismo en el que se basa Anki.
 *
 * Cada tarjeta guarda un factor de facilidad (ease). Si la respuesta es buena, el intervalo
 * crece multiplicándose por ese factor; si se falla, la tarjeta vuelve a empezar.
 */
import { addDays, type DayKey } from './dates';

export interface ReviewCard {
  id: string;
  front: string;
  back: string;
  example?: string;
  /** Días hasta la próxima revisión. */
  interval: number;
  /** Repeticiones correctas seguidas. */
  repetitions: number;
  /** Factor de facilidad; nunca baja de 1,3. */
  ease: number;
  due: DayKey;
  lapses: number;
}

/** 0–5 según SM-2. En la interfaz se usan 1 (otra vez), 3 (difícil), 4 (bien) y 5 (fácil). */
export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export const MIN_EASE = 1.3;
export const INITIAL_EASE = 2.5;
/** Variante tomada de Anki: si una tarjeta nueva es "fácil", no hace falta verla mañana. */
export const EASY_FIRST_INTERVAL = 4;

export function createCard(
  data: Pick<ReviewCard, 'id' | 'front' | 'back' | 'example'>,
  due: DayKey,
): ReviewCard {
  return { ...data, interval: 0, repetitions: 0, ease: INITIAL_EASE, due, lapses: 0 };
}

export function reviewCard(card: ReviewCard, quality: Quality, today: DayKey): ReviewCard {
  const ease = Math.max(
    MIN_EASE,
    round2(card.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))),
  );

  if (quality < 3) {
    return {
      ...card,
      ease,
      repetitions: 0,
      interval: 1,
      due: addDays(today, 1),
      lapses: card.lapses + 1,
    };
  }

  const repetitions = card.repetitions + 1;
  const interval =
    repetitions === 1
      ? quality === 5
        ? EASY_FIRST_INTERVAL
        : 1
      : repetitions === 2
        ? 6
        : Math.round(card.interval * card.ease);
  return { ...card, ease, repetitions, interval, due: addDays(today, interval) };
}

export function isDue(card: ReviewCard, today: DayKey): boolean {
  return card.due <= today;
}

export function dueCards(cards: Iterable<ReviewCard>, today: DayKey): ReviewCard[] {
  return [...cards].filter((c) => isDue(c, today)).sort((a, b) => a.due.localeCompare(b.due));
}

/** Una tarjeta se considera "dominada" cuando su intervalo supera las tres semanas. */
export function isMastered(card: ReviewCard): boolean {
  return card.interval >= 21;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
