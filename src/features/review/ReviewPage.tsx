import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { toDayKey } from '@/domain/dates';
import { dueCards } from '@/domain/srs';
import { useProgress } from '@/store/progress';
import { DailyReviewQuiz } from '@/features/quiz/DailyReviewQuiz';
import { CardList } from './CardList';
import { Flashcards } from './Flashcards';
import { Mistakes } from './Mistakes';

type Tab = 'quiz' | 'cards' | 'mistakes' | 'all';

export function ReviewPage() {
  const [tab, setTab] = useState<Tab>('quiz');
  const today = toDayKey();
  const due = useProgress((s) => dueCards(Object.values(s.cards), today).length);
  const mistakes = useProgress((s) => s.mistakes.length);
  const total = useProgress((s) => Object.keys(s.cards).length);

  const tabs: Array<[Tab, string, number | null]> = [
    ['quiz', 'Test diario', null],
    ['cards', 'Tarjetas para hoy', due],
    ['mistakes', 'Cuaderno de errores', mistakes],
    ['all', 'Todas las tarjetas', total],
  ];

  return (
    <>
      <PageHeader
        eyebrow="Repaso espaciado · SM-2"
        title="Repaso"
        lead="Cada palabra vuelve justo cuando estás a punto de olvidarla. El test diario te pregunta vocabulario de días anteriores: si fallas una palabra vuelve mañana; si la aciertas, el intervalo crece (1 día, 6 días, 2 semanas…)."
      />
      <div className="tabs" role="tablist" aria-label="Secciones de repaso">
        {tabs.map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`tab ${tab === id ? 'tab--active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
            {count !== null && <span className="tab__count">{count}</span>}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tab === 'quiz' && <DailyReviewQuiz />}
        {tab === 'cards' && <Flashcards />}
        {tab === 'mistakes' && <Mistakes />}
        {tab === 'all' && <CardList />}
      </div>
    </>
  );
}
