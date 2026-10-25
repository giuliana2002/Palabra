/**
 * Compara la frase esperada con la transcripción del reconocimiento de voz.
 * Alinea palabra a palabra con programación dinámica (subsecuencia común más larga
 * con coincidencia aproximada) para indicar qué palabras se reconocieron.
 */
import { words, wordsMatch } from './text';

export interface WordResult {
  word: string;
  matched: boolean;
}

export interface PronunciationResult {
  score: number;
  words: WordResult[];
  heard: string;
  verdict: 'excelente' | 'bien' | 'mejorable' | 'repite';
}

export function scorePronunciation(expected: string, heard: string): PronunciationResult {
  const target = words(expected);
  const spoken = words(heard);
  const n = target.length;
  const m = spoken.length;

  // lcs[i][j] = longitud de la mejor alineación entre target[i..] y spoken[j..]
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      const row = lcs[i] as number[];
      const next = lcs[i + 1] as number[];
      row[j] = wordsMatch(target[i] as string, spoken[j] as string)
        ? (next[j + 1] as number) + 1
        : Math.max(next[j] as number, row[j + 1] as number);
    }
  }

  const result: WordResult[] = [];
  let i = 0;
  let j = 0;
  while (i < n) {
    if (j < m && wordsMatch(target[i] as string, spoken[j] as string)) {
      result.push({ word: target[i] as string, matched: true });
      i++;
      j++;
    } else if (j < m && (lcs[i]?.[j + 1] ?? 0) >= (lcs[i + 1]?.[j] ?? 0)) {
      j++;
    } else {
      result.push({ word: target[i] as string, matched: false });
      i++;
    }
  }

  const matched = result.filter((w) => w.matched).length;
  // Penaliza ligeramente las palabras de más para no premiar hablar sin parar.
  const extra = Math.max(0, m - matched);
  const score = n === 0 ? 0 : Math.round((matched / (n + extra * 0.5)) * 100);
  return { score, words: result, heard, verdict: verdictFor(score) };
}

function verdictFor(score: number): PronunciationResult['verdict'] {
  if (score >= 90) return 'excelente';
  if (score >= 70) return 'bien';
  if (score >= 40) return 'mejorable';
  return 'repite';
}
