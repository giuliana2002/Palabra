import { describe, expect, it } from 'vitest';
import { scorePronunciation } from './pronunciation';

describe('scorePronunciation', () => {
  it('da 100 a una transcripción perfecta, sin importar mayúsculas ni puntuación', () => {
    const result = scorePronunciation(
      'Could you repeat that, please?',
      'could you repeat that please',
    );
    expect(result.score).toBe(100);
    expect(result.verdict).toBe('excelente');
    expect(result.words.every((w) => w.matched)).toBe(true);
  });

  it('marca las palabras que no se reconocieron', () => {
    const result = scorePronunciation('I want to learn English', 'I want learn English');
    expect(result.words.find((w) => w.word === 'to')?.matched).toBe(false);
    expect(result.score).toBe(80);
  });

  it('tolera pequeños fallos del reconocedor en palabras largas', () => {
    const result = scorePronunciation('The station is near', 'the stations is near');
    expect(result.score).toBe(100);
  });

  it('penaliza añadir muchas palabras', () => {
    const exact = scorePronunciation('I need help', 'I need help').score;
    const noisy = scorePronunciation('I need help', 'well I really need some help now').score;
    expect(noisy).toBeLessThan(exact);
  });

  it('da 0 si no se reconoce nada', () => {
    expect(scorePronunciation('Hello', '').score).toBe(0);
  });
});
