import { afterEach, describe, expect, it, vi } from 'vitest';
import { lookupWord, NotFoundError, searchSentences, tatoebaUrl } from './publicApis';

const json = (body: unknown, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
  );

const wiktionary = {
  en: [
    {
      partOfSpeech: 'Verb',
      definitions: [
        {
          definition: 'To be on a <a href="/wiki/journey">journey</a>.',
          examples: ['I <b>travel</b> by bus.'],
        },
      ],
    },
  ],
};
const freeDictionary = [
  {
    word: 'travel',
    phonetic: '/ˈtræv.əl/',
    meanings: [{ partOfSpeech: 'verb', definitions: [{ definition: 'To go on a trip.' }] }],
  },
];

afterEach(() => vi.unstubAllGlobals());

describe('lookupWord', () => {
  const signal = new AbortController().signal;

  it('usa Free Dictionary API cuando responde', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => json(freeDictionary)),
    );
    const entry = await lookupWord('travel', signal);
    expect(entry).toMatchObject({
      word: 'travel',
      phonetic: '/ˈtræv.əl/',
      source: { name: 'Free Dictionary API' },
    });
  });

  it('recurre a Wiktionary si la API principal está caída', async () => {
    const fetchMock = vi.fn((url: string) =>
      url.includes('dictionaryapi.dev')
        ? Promise.reject(new TypeError('Failed to fetch'))
        : json(wiktionary),
    );
    vi.stubGlobal('fetch', fetchMock);
    const entry = await lookupWord('travel', signal);
    expect(entry.source?.name).toBe('Wiktionary');
    expect(entry.meanings[0]).toMatchObject({
      partOfSpeech: 'verb',
      definitions: [{ definition: 'To be on a journey.', example: 'I travel by bus.' }],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('también recurre a Wiktionary si la principal no conoce la expresión', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        url.includes('dictionaryapi.dev') ? json({}, 404) : json(wiktionary),
      ),
    );
    expect((await lookupWord('look forward to', signal)).source?.name).toBe('Wiktionary');
  });

  it('avisa de que no existe si ninguna fuente la encuentra', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => json({}, 404)),
    );
    await expect(lookupWord('asdfqwer', signal)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('Tatoeba', () => {
  it('usa parámetros válidos de la API v1 (showtrans=spa da error 400)', () => {
    const url = new URL(tatoebaUrl('could you'));
    expect(url.searchParams.get('showtrans')).toBe('matching');
    expect(url.searchParams.get('trans:lang')).toBe('spa');
    expect(url.searchParams.get('q')).toBe('could you');
  });

  it('devuelve las frases y avisa si no hay resultados', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        json({
          data: [
            {
              text: 'I traveled.',
              translations: [{ text: 'Viajé.', lang: 'spa', is_direct: true }],
            },
          ],
        }),
      ),
    );
    expect(await searchSentences('travel', new AbortController().signal)).toEqual([
      { en: 'I traveled.', es: 'Viajé.' },
    ]);
    vi.stubGlobal(
      'fetch',
      vi.fn(() => json({ data: [] })),
    );
    await expect(searchSentences('zzz', new AbortController().signal)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
