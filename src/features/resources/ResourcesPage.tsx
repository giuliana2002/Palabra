import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { SpeakButton } from '@/components/SpeakButton';
import type { DictionaryEntry, SentenceExample } from '@/domain/api';
import { lookupWord, searchSentences } from '@/lib/publicApis';
import { cardId, useProgress } from '@/store/progress';

type Status<T> =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'done'; data: T };

/** Ejecuta una petición cancelable: una búsqueda nueva cancela la anterior (sin condiciones de carrera). */
function useAsync<T>() {
  const [status, setStatus] = useState<Status<T>>({ state: 'idle' });
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  const run = async (task: (signal: AbortSignal) => Promise<T>) => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setStatus({ state: 'loading' });
    try {
      const data = await task(current.signal);
      if (!current.signal.aborted) setStatus({ state: 'done', data });
    } catch (error) {
      if (current.signal.aborted) return;
      const message =
        navigator.onLine === false
          ? 'Sin conexión a Internet.'
          : (error as Error).message || 'No se pudo completar la búsqueda.';
      setStatus({ state: 'error', message });
    }
  };
  return { status, run };
}

export function ResourcesPage() {
  const [word, setWord] = useState('');
  const [phrase, setPhrase] = useState('');
  const cards = useProgress((s) => s.cards);
  const addCard = useProgress((s) => s.addCard);
  const dictionary = useAsync<DictionaryEntry>();
  const examples = useAsync<SentenceExample[]>();

  const searchWord = (e: FormEvent) => {
    e.preventDefault();
    const q = word.trim();
    if (q) void dictionary.run((signal) => lookupWord(q, signal));
  };
  const searchExamples = (e: FormEvent) => {
    e.preventDefault();
    const q = phrase.trim();
    if (q) void examples.run((signal) => searchSentences(q, signal));
  };

  const entry = dictionary.status.state === 'done' ? dictionary.status.data : null;

  return (
    <>
      <PageHeader
        eyebrow="Fuentes abiertas"
        title="Diccionario y ejemplos reales"
        lead="Consulta definiciones y pronunciación (Free Dictionary API, con Wiktionary como respaldo) y frases auténticas con traducción (Tatoeba). Necesita conexión."
      />
      <div className="resources">
        <section className="panel">
          <h2 className="panel__title">Diccionario</h2>
          <form className="search-form" onSubmit={searchWord} role="search">
            <input
              className="input"
              lang="en"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Palabra en inglés"
              aria-label="Palabra en inglés"
            />
            <button className="button button--primary" type="submit">
              <Icon name="search" size={18} /> Buscar
            </button>
          </form>
          <StatusMessage status={dictionary.status} />
          {entry && (
            <article className="entry">
              <header className="entry__head">
                <h3 lang="en">{entry.word}</h3>
                {entry.phonetic && <span className="muted">{entry.phonetic}</span>}
                <SpeakButton text={entry.word} compact />
                {entry.audio && (
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => void new Audio(entry.audio).play()}
                  >
                    Audio nativo
                  </button>
                )}
                <button
                  type="button"
                  className="button button--ghost"
                  disabled={Boolean(cards[cardId({ en: entry.word })])}
                  onClick={() =>
                    addCard({
                      en: entry.word,
                      es: entry.meanings[0]?.definitions[0]?.definition ?? '',
                      example: entry.meanings[0]?.definitions[0]?.example ?? entry.word,
                    })
                  }
                >
                  <Icon name="plus" size={16} />{' '}
                  {cards[cardId({ en: entry.word })] ? 'En tu repaso' : 'Añadir al repaso'}
                </button>
              </header>
              {entry.meanings.map((m, i) => (
                <div key={i} className="entry__meaning">
                  <p className="eyebrow">{m.partOfSpeech}</p>
                  <ol>
                    {m.definitions.map((d, j) => (
                      <li key={j} lang="en">
                        {d.definition}
                        {d.example && <em className="muted"> “{d.example}”</em>}
                      </li>
                    ))}
                  </ol>
                  {m.synonyms.length > 0 && (
                    <p className="small">
                      Sinónimos: <span lang="en">{m.synonyms.join(', ')}</span>
                    </p>
                  )}
                </div>
              ))}
              {entry.source && (
                <p className="muted small">
                  Fuente:{' '}
                  <a href={entry.source.url} target="_blank" rel="noreferrer">
                    {entry.source.name}
                  </a>
                </p>
              )}
            </article>
          )}
        </section>

        <section className="panel">
          <h2 className="panel__title">Ejemplos reales · Tatoeba</h2>
          <form className="search-form" onSubmit={searchExamples} role="search">
            <input
              className="input"
              lang="en"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="Ej.: travel, could you, although"
              aria-label="Palabra o expresión"
            />
            <button className="button button--primary" type="submit">
              Buscar
            </button>
          </form>
          <StatusMessage status={examples.status} />
          {examples.status.state === 'done' && (
            <ul className="examples">
              {examples.status.data.map((ex) => (
                <li key={ex.en}>
                  <div>
                    <p lang="en">{ex.en}</p>
                    {ex.es && <p className="muted">{ex.es}</p>}
                  </div>
                  <SpeakButton text={ex.en} compact />
                </li>
              ))}
            </ul>
          )}
          {examples.status.state === 'done' && (
            <p className="muted small">
              Fuente:{' '}
              <a href="https://tatoeba.org/" target="_blank" rel="noreferrer">
                Tatoeba
              </a>{' '}
              (CC BY 2.0 FR)
            </p>
          )}
        </section>
      </div>
    </>
  );
}

function StatusMessage<T>({ status }: { status: Status<T> }) {
  if (status.state === 'loading')
    return (
      <p className="muted" role="status">
        Buscando…
      </p>
    );
  if (status.state === 'error')
    return (
      <p className="error" role="alert">
        {status.message}
      </p>
    );
  return null;
}
