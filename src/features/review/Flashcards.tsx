import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SpeakButton } from '@/components/SpeakButton';
import { addDays, toDayKey } from '@/domain/dates';
import { dueCards, reviewCard, type Quality } from '@/domain/srs';
import { useProgress } from '@/store/progress';

const GRADES: Array<{ quality: Quality; label: string; key: string; tone: string }> = [
  { quality: 1, label: 'Otra vez', key: '1', tone: 'grade--again' },
  { quality: 3, label: 'Difícil', key: '2', tone: 'grade--hard' },
  { quality: 4, label: 'Bien', key: '3', tone: 'grade--good' },
  { quality: 5, label: 'Fácil', key: '4', tone: 'grade--easy' },
];

export function Flashcards() {
  const today = toDayKey();
  const cards = useProgress((s) => s.cards);
  const review = useProgress((s) => s.review);
  // La sesión se fija al empezar para que la cola no cambie mientras se repasa.
  const [queue, setQueue] = useState(() => dueCards(Object.values(cards), today).map((c) => c.id));
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const card = queue[0] ? cards[queue[0]] : undefined;

  const grade = useCallback(
    (quality: Quality) => {
      if (!card) return;
      review(card.id, quality, today);
      setReviewed((n) => n + 1);
      setRevealed(false);
      // "Otra vez" vuelve al final de la cola de hoy.
      setQueue((q) => (quality < 3 ? [...q.slice(1), card.id] : q.slice(1)));
    },
    [card, review, today],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!revealed && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed) {
        const g = GRADES.find((x) => x.key === e.key);
        if (g) grade(g.quality);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, grade]);

  const preview = useMemo(
    () => (card ? GRADES.map((g) => reviewCard(card, g.quality, today).interval) : []),
    [card, today],
  );

  if (!card) {
    const tomorrow = dueCards(Object.values(cards), addDays(today, 1)).length;
    return (
      <div className="empty">
        <h2>
          {reviewed
            ? `¡Sesión terminada! Has repasado ${reviewed} tarjetas.`
            : 'No tienes tarjetas pendientes hoy.'}
        </h2>
        <p className="muted">
          {Object.keys(cards).length === 0
            ? 'Las palabras que trabajes en la ruta aparecerán aquí automáticamente.'
            : `Mañana te esperan ${tomorrow} ${tomorrow === 1 ? 'tarjeta' : 'tarjetas'}.`}
        </p>
        <Link className="button button--primary" to="/ruta">
          Ir a la ruta
        </Link>
      </div>
    );
  }

  return (
    <div className="flash">
      <p className="muted small">
        Quedan {queue.length} · repasadas {reviewed}
      </p>
      <div className={`flashcard ${revealed ? 'flashcard--revealed' : ''}`} aria-live="polite">
        <p className="flashcard__front" lang="en">
          {card.front}
        </p>
        <SpeakButton text={card.front} compact />
        {revealed ? (
          <>
            <p className="flashcard__back">{card.back}</p>
            {card.example && (
              <p className="flashcard__example" lang="en">
                {card.example}
              </p>
            )}
          </>
        ) : (
          <button
            type="button"
            className="button button--primary"
            onClick={() => setRevealed(true)}
          >
            Mostrar respuesta <kbd>Espacio</kbd>
          </button>
        )}
      </div>
      {revealed && (
        <div className="grades" role="group" aria-label="¿Qué tal la recordabas?">
          {GRADES.map((g, i) => (
            <button
              key={g.quality}
              type="button"
              className={`grade ${g.tone}`}
              onClick={() => grade(g.quality)}
            >
              <span>{g.label}</span>
              <small>{g.quality < 3 ? 'otra vez hoy' : formatInterval(preview[i] ?? 1)}</small>
              <kbd>{g.key}</kbd>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatInterval(days: number): string {
  if (days <= 1) return '1 día';
  if (days < 30) return `${days} días`;
  return `${Math.round(days / 30)} mes${days >= 60 ? 'es' : ''}`;
}
