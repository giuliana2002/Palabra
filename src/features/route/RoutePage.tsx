import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { DAYS } from '@/data';
import { EXERCISES_PER_DAY } from '@/domain/exercises';
import { EXAMS } from '@/domain/quiz';
import { useProgress } from '@/store/progress';
import { answeredByDay } from '@/store/selectors';

const LEVEL_LABEL = { 1: 'Base', 2: 'Intermedio', 3: 'Avanzado' } as const;

export function RoutePage() {
  const results = useProgress((s) => s.results);
  const currentDay = useProgress((s) => s.currentDay);
  const exams = useProgress((s) => s.exams);
  const sessions = useProgress((s) => s.sessions);
  const sessionDays = new Set(Object.values(sessions).map((s) => s.day));
  const counts = answeredByDay(results);
  const isDone = (day: number) =>
    sessionDays.has(day) || (counts.get(day) ?? 0) >= EXERCISES_PER_DAY;
  const completed = DAYS.filter((d) => isDone(d.id)).length;

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
          const done100 = isDone(day.id);
          const status = done100
            ? 'day-card--done'
            : day.id === currentDay
              ? 'day-card--current'
              : '';
          const exam = EXAMS.find((e) => e.to === day.id);
          const record = exam ? exams[exam.id] : undefined;
          return (
            <Fragment key={day.id}>
              <li>
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
                  {done100 && <Icon name="check" className="day-card__check" />}
                </Link>
              </li>
              {exam && (
                <li>
                  <Link
                    to={`/examen/${exam.week}`}
                    className={`day-card day-card--exam ${record?.passed ? 'day-card--done' : ''}`}
                  >
                    <span className="day-card__number">
                      <Icon name="exam" size={28} />
                    </span>
                    <span className="day-card__title">{exam.title}</span>
                    <span className="day-card__meta">
                      Días {exam.from}–{exam.to} · 20 preguntas
                    </span>
                    <span className="day-card__meta">
                      {record ? `Mejor nota: ${record.best}%` : 'Sin hacer'}
                      {record?.passed && ' · aprobado'}
                    </span>
                  </Link>
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </>
  );
}
