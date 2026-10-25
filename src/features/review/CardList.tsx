import { useState } from 'react';
import { toDayKey } from '@/domain/dates';
import { isMastered } from '@/domain/srs';
import { useProgress } from '@/store/progress';

export function CardList() {
  const cards = useProgress((s) => s.cards);
  const removeCard = useProgress((s) => s.removeCard);
  const [query, setQuery] = useState('');
  const today = toDayKey();
  const list = Object.values(cards)
    .filter((c) => `${c.front} ${c.back}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.due.localeCompare(b.due));

  if (!Object.keys(cards).length) {
    return (
      <div className="empty">
        <h2>Aún no hay tarjetas</h2>
        <p className="muted">
          Completa actividades o añade palabras desde Vocabulario o el Diccionario.
        </p>
      </div>
    );
  }

  return (
    <>
      <input
        className="input"
        type="search"
        placeholder="Buscar tarjeta…"
        aria-label="Buscar tarjeta"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Inglés</th>
              <th scope="col">Español</th>
              <th scope="col">Próximo repaso</th>
              <th scope="col">Intervalo</th>
              <th scope="col">Facilidad</th>
              <th scope="col">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td lang="en">
                  <strong>{c.front}</strong>{' '}
                  {isMastered(c) && <span className="tag tag--ok">dominada</span>}
                </td>
                <td>{c.back}</td>
                <td>{c.due <= today ? <span className="tag tag--due">hoy</span> : c.due}</td>
                <td>{c.interval ? `${c.interval} d` : 'nueva'}</td>
                <td>{c.ease.toFixed(2)}</td>
                <td>
                  <button
                    type="button"
                    className="link"
                    onClick={() => removeCard(c.id)}
                    aria-label={`Eliminar ${c.front}`}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
