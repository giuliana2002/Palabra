import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { DAYS } from '@/data';
import { EXERCISES_PER_DAY } from '@/domain/exercises';
import { useProgress } from '@/store/progress';
import { answeredByDay } from '@/store/selectors';

const LEVEL_LABEL = { 1: 'Base', 2: 'Intermedio', 3: 'Avanzado' } as const;

export function RoutePage() {
  const results = useProgress((s) => s.results);
  const currentDay = useProgress((s) => s.currentDay);
  const counts = answeredByDay(results);
  const completed = DAYS.filter((d) => (counts.get(d.id) ?? 0) >= EXERCISES_PER_DAY).length;

  return (
    <>
      <PageHeader
        eyebrow={`${completed} de ${DAYS.length} días completados`}
        title="Ruta de 31 días"
        lead="Del saludo a una conversación de tres minutos. Cada día añade 15 conceptos nuevos y una estructura gramatical; puedes saltar a cualquier día."
      />
      <ol className="day-grid">
        {DAYS.map((day) => {
          const done = counts.get(day.id) ?? 0;
          const percent = Math.round((done / EXERCISES_PER_DAY) * 100);
          const status =
            percent >= 100 ? 'day-card--done' : day.id === currentDay ? 'day-card--current' : '';
          return (
            <li key={day.id}>
              <Link to={`/ruta/${day.id}`} className={`day-card ${status}`}>
                <span className="day-card__number">{String(day.id).padStart(2, '0')}</span>
                <span className="day-card__title">{day.title}</span>
                <span className="day-card__meta">
                  {LEVEL_LABEL[day.level]} · {day.grammar}
                </span>
                <span className="day-card__bar" aria-hidden="true">
                  <span style={{ width: `${percent}%` }} />
                </span>
                <span className="sr-only">{percent}% completado</span>
                {percent >= 100 && <Icon name="check" className="day-card__check" />}
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
