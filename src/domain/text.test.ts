import { describe, expect, it } from 'vitest';
import { levenshtein, normalize, sameSentence, tokenize, usesConcept, wordsMatch } from './text';

describe('normalize', () => {
  it('ignora mayúsculas, puntuación y apóstrofos tipográficos', () => {
    expect(normalize('  I’m READY, “really”!  ')).toBe("i'm ready really");
  });

  it('considera iguales frases con distinta puntuación final', () => {
    expect(sameSentence('Can you repeat that, please?', 'can you repeat that please')).toBe(true);
  });
});

describe('levenshtein', () => {
  it.each([
    ['kitten', 'sitting', 3],
    ['', 'abc', 3],
    ['same', 'same', 0],
    ['flaw', 'lawn', 2],
  ])('distancia(%s, %s) = %i', (a, b, expected) => {
    expect(levenshtein(a, b)).toBe(expected);
  });
});

describe('wordsMatch', () => {
  it('tolera una letra de diferencia en palabras largas', () => {
    expect(wordsMatch('weather', 'whether')).toBe(false);
    expect(wordsMatch('station', 'stations')).toBe(true);
  });

  it('exige coincidencia exacta en palabras cortas', () => {
    expect(wordsMatch('it', 'eat')).toBe(false);
    expect(wordsMatch('the', 'a')).toBe(false);
  });
});

describe('usesConcept', () => {
  it('acepta formas flexionadas del verbo', () => {
    expect(usesConcept('She lives in Seville.', 'live')).toBe(true);
    expect(usesConcept('I studied a lot.', 'study')).toBe(true);
  });

  it('detecta expresiones de varias palabras en orden', () => {
    expect(usesConcept('I usually wake up at seven.', 'wake up')).toBe(true);
    expect(usesConcept('I wake at seven and get up.', 'turn left')).toBe(false);
  });

  it('no da por buena una palabra que solo comparte el inicio', () => {
    expect(usesConcept('I like carpets.', 'car')).toBe(false);
  });
});

describe('tokenize', () => {
  it('quita la puntuación final pero conserva comas internas', () => {
    expect(tokenize('Hello, nice to meet you.')).toEqual(['Hello,', 'nice', 'to', 'meet', 'you']);
  });
});
