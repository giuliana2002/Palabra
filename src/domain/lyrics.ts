/**
 * Análisis de un fragmento de canción pegado por la persona usuaria.
 * Etiqueta pronombres, conectores, verbos frecuentes y contracciones para guiar el estudio.
 * No descarga letras: trabaja solo con el texto que se pega.
 */
import { normalize } from './text';

export type TokenTag = 'pronoun' | 'connector' | 'verb' | 'contraction' | 'question' | null;

export interface LyricToken {
  text: string;
  tag: TokenTag;
}

export interface LyricAnalysis {
  lines: LyricToken[][];
  counts: Record<Exclude<TokenTag, null>, number>;
  topWords: Array<{ word: string; count: number }>;
  repeatedLines: string[];
}

const PRONOUNS = new Set(
  'i you he she it we they me him her us them my your his its our their mine yours'.split(' '),
);
const CONNECTORS = new Set(
  'and but because so or if when while although though then until unless since before after cause'.split(
    ' ',
  ),
);
const QUESTION_WORDS = new Set('what where when who why how which whose'.split(' '));
const VERBS = new Set(
  (
    'be am is are was were been being have has had do does did done go goes went gone come came ' +
    'get got make made take took know knew think thought see saw look want need feel felt love ' +
    'give gave say said tell told find found leave left keep kept let put run ran stay try hold ' +
    'call believe remember forget forgot break broke fall fell lose lost dream dance sing cry ' +
    'live stand stood walk talk hear heard move turn wait hope change start stop can could will ' +
    'would should must might may'
  ).split(' '),
);
const STOPWORDS = new Set([
  ...PRONOUNS,
  ...CONNECTORS,
  ...'the a an to of in on at for with is am are be it oh yeah la na'.split(' '),
]);

export function tagWord(raw: string): TokenTag {
  const word = normalize(raw);
  if (!word) return null;
  if (/'/.test(word) && /(n't|'re|'m|'ll|'ve|'d|'s|in')$/.test(word)) return 'contraction';
  if (PRONOUNS.has(word)) return 'pronoun';
  if (CONNECTORS.has(word)) return 'connector';
  if (QUESTION_WORDS.has(word)) return 'question';
  if (VERBS.has(word) || /^[a-z]{3,}(ing|ed)$/.test(word)) return 'verb';
  return null;
}

export function analyzeLyrics(text: string): LyricAnalysis {
  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const counts = { pronoun: 0, connector: 0, verb: 0, contraction: 0, question: 0 };
  const frequency = new Map<string, number>();
  const lineCount = new Map<string, number>();

  const lines = rawLines.map((line) => {
    const key = normalize(line);
    lineCount.set(key, (lineCount.get(key) ?? 0) + 1);
    return line.split(/\s+/).map((text) => {
      const tag = tagWord(text);
      if (tag) counts[tag]++;
      const word = normalize(text);
      if (word && tag !== 'contraction' && !STOPWORDS.has(word) && word.length > 2)
        frequency.set(word, (frequency.get(word) ?? 0) + 1);
      return { text, tag };
    });
  });

  const topWords = [...frequency.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([word, count]) => ({ word, count }));

  const repeatedLines = rawLines.filter(
    (line, i) =>
      (lineCount.get(normalize(line)) ?? 0) > 1 &&
      rawLines.findIndex((l) => normalize(l) === normalize(line)) === i,
  );

  return { lines, counts, topWords, repeatedLines };
}
