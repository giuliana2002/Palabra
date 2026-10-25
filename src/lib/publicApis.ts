/**
 * Llamadas a las APIs públicas, con tiempo límite y servicio de respaldo.
 * Los parsers (puros y testeados) están en `src/domain/api.ts`.
 */
import {
  parseDictionary,
  parseTatoeba,
  parseWiktionary,
  type DictionaryEntry,
  type SentenceExample,
} from '@/domain/api';

export class NotFoundError extends Error {}

const PRIMARY_TIMEOUT_MS = 5000;

/** fetch que se cancela si el usuario hace otra búsqueda o si tarda demasiado. */
async function fetchWithTimeout(
  url: string,
  signal: AbortSignal,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal.addEventListener('abort', onAbort);
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', onAbort);
  }
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException('Búsqueda cancelada', 'AbortError');
}

/**
 * Busca una palabra en Free Dictionary API (fonética y audio nativo) y, si está caída,
 * tarda más de 5 s o no conoce la palabra, recurre a Wiktionary.
 */
export async function lookupWord(word: string, signal: AbortSignal): Promise<DictionaryEntry> {
  try {
    const response = await fetchWithTimeout(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      signal,
      PRIMARY_TIMEOUT_MS,
    );
    if (response.ok) {
      const entry = parseDictionary(await response.json());
      if (entry)
        return {
          ...entry,
          source: { name: 'Free Dictionary API', url: 'https://dictionaryapi.dev/' },
        };
    }
  } catch {
    // Caído, sin respuesta o con un certificado inválido: se usa el respaldo.
  }
  throwIfAborted(signal);

  const response = await fetchWithTimeout(
    `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`,
    signal,
    10_000,
  );
  if (response.status === 404)
    throw new NotFoundError('No se encontró esa palabra en el diccionario.');
  if (!response.ok) throw new Error(`El diccionario respondió con un error (${response.status}).`);
  const entry = parseWiktionary(await response.json(), word);
  if (!entry) throw new NotFoundError('No se encontró esa palabra en el diccionario.');
  return entry;
}

export function tatoebaUrl(query: string): string {
  const params = new URLSearchParams({
    lang: 'eng',
    q: query,
    showtrans: 'matching',
    'trans:lang': 'spa',
    sort: 'relevance',
    limit: '6',
  });
  return `https://api.tatoeba.org/v1/sentences?${params.toString()}`;
}

export async function searchSentences(
  query: string,
  signal: AbortSignal,
): Promise<SentenceExample[]> {
  const response = await fetchWithTimeout(tatoebaUrl(query), signal, 10_000);
  if (!response.ok) throw new Error(`Tatoeba respondió con un error (${response.status}).`);
  const examples = parseTatoeba(await response.json());
  if (examples.length === 0) throw new NotFoundError('No hay ejemplos para esa búsqueda.');
  return examples;
}
