import { useDeferredValue, useMemo, useState } from 'react';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { SpeakButton } from '@/components/SpeakButton';
import { DAYS } from '@/data';
import { VOCAB_CATEGORIES, VOCABULARY } from '@/data/vocabulary';
import { normalize } from '@/domain/text';
import { cardId, useProgress } from '@/store/progress';

/** Todo el vocabulario: categorías temáticas + conceptos de la ruta (sin duplicados). */
const ROUTE_WORDS = DAYS.flatMap((d) => d.concepts.map((c) => ({ ...c, category: `Día ${d.id}` })));
const ALL = [
  ...VOCABULARY.map((v) => ({ ...v, example: '' })),
  ...ROUTE_WORDS.filter((r) => !VOCABULARY.some((v) => normalize(v.en) === normalize(r.en))),
];

export function VocabularyPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const deferred = useDeferredValue(query);
  const cards = useProgress((s) => s.cards);
  const addCard = useProgress((s) => s.addCard);
  const removeCard = useProgress((s) => s.removeCard);

  const items = useMemo(() => {
    const q = normalize(deferred);
    return ALL.filter(
      (item) =>
        (!category ||
          item.category === category ||
          (category === 'Ruta' && item.category.startsWith('Día'))) &&
        (!q || normalize(`${item.en} ${item.es} ${item.category}`).includes(q)),
    );
  }, [deferred, category]);

  return (
    <>
      <PageHeader
        eyebrow={`${ALL.length} conceptos`}
        title="Vocabulario"
        lead="Busca en inglés o en español. Añade al repaso las palabras que quieras fijar: entrarán en tus tarjetas con repaso espaciado."
      />
      <input
        className="input input--large"
        type="search"
        placeholder="Buscar: travel, viaje, work…"
        aria-label="Buscar vocabulario"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="filters" role="group" aria-label="Filtrar por categoría">
        {[null, 'Ruta', ...VOCAB_CATEGORIES].map((c) => (
          <button
            key={c ?? 'all'}
            type="button"
            className={`filter ${category === c ? 'filter--active' : ''}`}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c ?? 'Todas'}
          </button>
        ))}
      </div>
      <p className="muted small" aria-live="polite">
        {items.length} resultados
      </p>
      <ul className="concept-grid">
        {items.slice(0, 240).map((item) => {
          const inReview = Boolean(cards[cardId(item)]);
          return (
            <li key={item.category + item.en} className="concept">
              <div>
                <strong lang="en">{item.en}</strong>
                <span>{item.es}</span>
                <small>{item.category}</small>
              </div>
              <div className="concept__actions">
                <SpeakButton text={item.en} compact />
                <button
                  type="button"
                  className={`icon-button ${inReview ? 'icon-button--on' : ''}`}
                  aria-pressed={inReview}
                  aria-label={
                    inReview ? `Quitar ${item.en} del repaso` : `Añadir ${item.en} al repaso`
                  }
                  title={inReview ? 'En tu repaso' : 'Añadir al repaso'}
                  onClick={() =>
                    inReview
                      ? removeCard(cardId(item))
                      : addCard({ en: item.en, es: item.es, example: item.example || item.en })
                  }
                >
                  <Icon name={inReview ? 'check' : 'plus'} size={16} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {items.length > 240 && (
        <p className="muted small">Mostrando 240. Usa el buscador para afinar.</p>
      )}
    </>
  );
}
