import { describe, expect, it } from 'vitest';
import { parseDictionary, parseTatoeba } from './api';
import { analyzeLyrics, tagWord } from './lyrics';
import { parseRichText } from './richText';

describe('parseRichText', () => {
  it('separa negrita, cursiva y texto plano', () => {
    expect(parseRichText('Usa **can** con *verbo base* siempre')).toEqual([
      { text: 'Usa ', style: 'plain' },
      { text: 'can', style: 'bold' },
      { text: ' con ', style: 'plain' },
      { text: 'verbo base', style: 'italic' },
      { text: ' siempre', style: 'plain' },
    ]);
  });

  it('trata el HTML como texto, sin interpretarlo', () => {
    expect(parseRichText('<img onerror=x>')).toEqual([{ text: '<img onerror=x>', style: 'plain' }]);
  });
});

describe('análisis de canciones', () => {
  it('etiqueta pronombres, conectores, verbos y contracciones', () => {
    expect(tagWord('You')).toBe('pronoun');
    expect(tagWord('because')).toBe('connector');
    expect(tagWord('dancing')).toBe('verb');
    expect(tagWord("don't")).toBe('contraction');
    expect(tagWord('table')).toBeNull();
  });

  it('detecta líneas repetidas (posible estribillo)', () => {
    const analysis = analyzeLyrics('I feel the rhythm\nYou and me\nI feel the rhythm');
    expect(analysis.repeatedLines).toEqual(['I feel the rhythm']);
    expect(analysis.counts.pronoun).toBe(4);
    expect(analysis.topWords[0]).toEqual({ word: 'feel', count: 2 });
  });
});

describe('parsers de APIs', () => {
  it('extrae la información útil de Free Dictionary', () => {
    const entry = parseDictionary([
      {
        word: 'travel',
        phonetics: [{ text: '/ˈtræv.əl/', audio: '' }, { audio: 'https://x/travel.mp3' }],
        meanings: [
          {
            partOfSpeech: 'verb',
            synonyms: ['journey'],
            definitions: [{ definition: 'To be on a journey.', example: 'I travel a lot.' }],
          },
        ],
      },
    ]);
    expect(entry).toMatchObject({
      word: 'travel',
      phonetic: '/ˈtræv.əl/',
      audio: 'https://x/travel.mp3',
    });
    expect(entry?.meanings[0]?.synonyms).toEqual(['journey']);
  });

  it('devuelve null si la respuesta no es válida', () => {
    expect(parseDictionary({ title: 'No Definitions Found' })).toBeNull();
  });

  it('lee el formato v1 de Tatoeba con traducciones anidadas', () => {
    const payload = {
      data: [
        {
          text: 'I like to travel.',
          lang: 'eng',
          translations: [[{ text: 'Me gusta viajar.', lang: 'spa' }], []],
        },
        { text: 'Travel is fun.', lang: 'eng', translations: [] },
      ],
    };
    expect(parseTatoeba(payload)).toEqual([
      { en: 'I like to travel.', es: 'Me gusta viajar.' },
      { en: 'Travel is fun.' },
    ]);
  });
});
