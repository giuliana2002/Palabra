/** Utilidades de texto para corregir respuestas de forma tolerante. */

const APOSTROPHES = /[‘’ʼ`´]/g;
const QUOTES = /[“”«»"]/g;

/** Minúsculas, apóstrofos unificados, sin puntuación y con espacios simples. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(APOSTROPHES, "'")
    .replace(QUOTES, '')
    .replace(/[.,!?;:¡¿()[\]{}…—–-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function words(text: string): string[] {
  const clean = normalize(text);
  return clean ? clean.split(' ') : [];
}

export function sameSentence(a: string, b: string): boolean {
  return normalize(a) === normalize(b);
}

/** Distancia de Levenshtein entre dos cadenas (O(n·m) tiempo, O(m) memoria). */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        (current[j - 1] as number) + 1,
        (previous[j] as number) + 1,
        (previous[j - 1] as number) + cost,
      );
    }
    previous = current;
  }
  return previous[b.length] as number;
}

/** Dos palabras se consideran iguales si coinciden o si solo difieren en una letra (palabras largas). */
export function wordsMatch(expected: string, heard: string): boolean {
  if (expected === heard) return true;
  if (expected.length < 4) return false;
  return levenshtein(expected, heard) <= 1;
}

/**
 * Comprueba si un texto libre usa un concepto, aceptando formas flexionadas
 * habituales: live → lives, lived, living; study → studied.
 */
export function usesConcept(text: string, concept: string): boolean {
  const haystack = ` ${normalize(text)} `;
  const target = normalize(concept);
  if (!target) return false;
  if (haystack.includes(` ${target} `)) return true;
  const targetWords = target.split(' ');
  const textWords = haystack.trim().split(' ');
  // Para expresiones de varias palabras basta con que aparezcan todas en orden.
  if (targetWords.length > 1) {
    let index = 0;
    for (const word of textWords) {
      if (isInflectionOf(word, targetWords[index] as string)) index++;
      if (index === targetWords.length) return true;
    }
    return false;
  }
  return textWords.some((word) => isInflectionOf(word, target));
}

const SUFFIXES = ['', 's', 'es', 'd', 'ed', 'ing', 'ies', 'ied', 'er', 'est'];

/** ¿Es `word` una flexión regular de `base`? live→lived, study→studied, stop→stopped. */
export function isInflectionOf(word: string, base: string): boolean {
  const roots = new Set([base, stem(base), base + base.slice(-1)]);
  for (const root of roots) {
    if (!word.startsWith(root)) continue;
    if (SUFFIXES.includes(word.slice(root.length))) return true;
  }
  return false;
}

function stem(word: string): string {
  if (word.length <= 2) return word;
  if (word.endsWith('y') || word.endsWith('e')) return word.slice(0, -1);
  return word;
}

/** Quita el signo final para mostrar fichas de palabras sin puntuación. */
export function tokenize(sentence: string): string[] {
  return sentence
    .replace(/[.!?]+$/, '')
    .split(/\s+/)
    .filter(Boolean);
}
