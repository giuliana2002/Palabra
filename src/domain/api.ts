/**
 * Parsers de las APIs públicas. Se separan del `fetch` para poder testearlos
 * y para tolerar cambios de formato (la API de Tatoeba ha cambiado de versión).
 */

export interface DictionaryEntry {
  word: string;
  /** De dónde salen los datos (se muestra como atribución). */
  source?: { name: string; url: string };
  phonetic?: string;
  audio?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{ definition: string; example?: string }>;
    synonyms: string[];
  }>;
}

interface RawDictionaryEntry {
  word?: string;
  phonetic?: string;
  phonetics?: Array<{ text?: string; audio?: string }>;
  meanings?: Array<{
    partOfSpeech?: string;
    synonyms?: string[];
    definitions?: Array<{ definition?: string; example?: string; synonyms?: string[] }>;
  }>;
}

export function parseDictionary(payload: unknown): DictionaryEntry | null {
  if (!Array.isArray(payload) || payload.length === 0) return null;
  const entry = payload[0] as RawDictionaryEntry;
  if (!entry.word) return null;
  const phonetic = entry.phonetic ?? entry.phonetics?.find((p) => p.text)?.text;
  const audio = entry.phonetics?.find((p) => p.audio)?.audio || undefined;
  return {
    word: entry.word,
    phonetic,
    audio,
    meanings: (entry.meanings ?? []).slice(0, 3).map((m) => ({
      partOfSpeech: m.partOfSpeech ?? '',
      synonyms: [
        ...(m.synonyms ?? []),
        ...(m.definitions ?? []).flatMap((d) => d.synonyms ?? []),
      ].slice(0, 6),
      definitions: (m.definitions ?? [])
        .filter((d): d is { definition: string; example?: string } => Boolean(d.definition))
        .slice(0, 2)
        .map((d) => ({ definition: d.definition, example: d.example })),
    })),
  };
}

export interface SentenceExample {
  en: string;
  es?: string;
}

interface RawTatoebaSentence {
  text?: string;
  lang?: string;
  is_direct?: boolean;
  translations?: unknown;
}

export function parseTatoeba(payload: unknown): SentenceExample[] {
  const data =
    (payload as { data?: unknown; results?: unknown } | null)?.data ??
    (payload as { results?: unknown } | null)?.results ??
    payload;
  if (!Array.isArray(data)) return [];
  return data
    .map((item: RawTatoebaSentence): SentenceExample | null => {
      if (!item?.text) return null;
      // v1 devuelve un array de arrays (traducciones directas e indirectas); v0 un array plano.
      const flat = Array.isArray(item.translations)
        ? (item.translations.flat(2) as RawTatoebaSentence[])
        : [];
      // Se prefieren las traducciones directas (hechas de esa frase) a las indirectas.
      const candidates = flat.filter((t) => t?.lang === 'spa' && t.text);
      const spanish = candidates.find((t) => t.is_direct) ?? candidates[0];
      return spanish?.text ? { en: item.text, es: spanish.text } : { en: item.text };
    })
    .filter((x): x is SentenceExample => x !== null)
    .slice(0, 6);
}

/* ------------------------------------------------------------------ */
/* Wiktionary (respaldo del diccionario)                               */
/* ------------------------------------------------------------------ */

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'",
  nbsp: ' ',
};

/** Convierte el HTML de Wiktionary en texto plano (sin interpretarlo como HTML). */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_m, name: string) => ENTITIES[name] ?? '')
    .replace(/&#(\d+);/g, (_m, code: string) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim();
}

interface RawWiktionaryUsage {
  partOfSpeech?: string;
  language?: string;
  definitions?: Array<{ definition?: string; examples?: string[] }>;
}

export function parseWiktionary(payload: unknown, word: string): DictionaryEntry | null {
  const usages = (payload as { en?: RawWiktionaryUsage[] } | null)?.en;
  if (!Array.isArray(usages)) return null;
  const meanings = usages
    .map((usage) => ({
      partOfSpeech: (usage.partOfSpeech ?? '').toLowerCase(),
      synonyms: [] as string[],
      definitions: (usage.definitions ?? [])
        .map((d) => ({
          definition: stripHtml(d.definition ?? ''),
          example: d.examples?.[0] ? stripHtml(d.examples[0]) : undefined,
        }))
        .filter((d) => d.definition.length > 0)
        .slice(0, 2),
    }))
    .filter((m) => m.definitions.length > 0)
    .slice(0, 3);
  if (meanings.length === 0) return null;
  return {
    word,
    meanings,
    source: {
      name: 'Wiktionary',
      url: `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`,
    },
  };
}
