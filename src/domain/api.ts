/**
 * Parsers de las APIs públicas. Se separan del `fetch` para poder testearlos
 * y para tolerar cambios de formato (la API de Tatoeba ha cambiado de versión).
 */

export interface DictionaryEntry {
  word: string;
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
      const spanish = flat.find((t) => t?.lang === 'spa' && t.text);
      return spanish?.text ? { en: item.text, es: spanish.text } : { en: item.text };
    })
    .filter((x): x is SentenceExample => x !== null)
    .slice(0, 6);
}
