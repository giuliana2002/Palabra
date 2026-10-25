import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { DAYS } from '@/data';
import { addDays, toDayKey } from '@/domain/dates';
import { EXAMS, type QuizScore } from '@/domain/quiz';
import { dueCards } from '@/domain/srs';
import { currentStreak } from '@/domain/stats';
import type { DayPlan, Exercise } from '@/domain/types';
import { useProgress } from '@/store/progress';

interface Props {
  day: DayPlan;
  warmup: QuizScore | null;
  practice: Exercise[];
  speakingScores: number[];
  startedAt: number;
}

export function SummaryStep({ day, warmup, practice, speakingScores, startedAt }: Props) {
  const today = toDayKey();
  const results = useProgress((s) => s.results);
  const completeSession = useProgress((s) => s.completeSession);
  const streak = useProgress((s) => currentStreak(s.activity, today));
  const tomorrow = useProgress((s) => dueCards(Object.values(s.cards), addDays(today, 1)).length);
  const examPassed = useProgress((s) => s.exams);

  const practiced = practice.filter((e) => results[e.id]);
  const practiceOk = practiced.filter((e) => results[e.id]?.ok).length;
  const correct = practiceOk + (warmup?.correct ?? 0);
  const total = practiced.length + (warmup?.total ?? 0);
  const percent = total ? Math.round((correct / total) * 100) : 0;
  const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60_000));
  const speaking = speakingScores.length
    ? Math.round(speakingScores.reduce((a, b) => a + b, 0) / speakingScores.length)
    : null;

  // Se registra una sola vez aunque React vuelva a renderizar.
  const saved = useRef(false);
  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    completeSession({ day: day.id, correct, total, minutes });
  }, [completeSession, day.id, correct, total, minutes]);

  const next = DAYS[day.id + 1];
  const exam = EXAMS.find((e) => e.to === day.id);
  const examPending = exam && !examPassed[exam.id]?.passed;

  return (
    <section className="result" aria-labelledby="summary-title">
      <div className="result__head">
        <div
          className="ring ring--large"
          style={{ '--value': percent } as React.CSSProperties}
          role="img"
          aria-label={`${percent}% de aciertos`}
        >
          <span>{percent}%</span>
        </div>
        <div>
          <h2 id="summary-title">¡Sesión completada!</h2>
          <p className="muted">
            Día {day.id} terminado en {minutes} min.{' '}
            {next
              ? `Mañana te espera el día ${next.id}: ${next.title}.`
              : 'Has llegado al final de la ruta.'}
          </p>
        </div>
      </div>

      <dl className="kpis">
        <div className="kpi">
          <dt>Aciertos</dt>
          <dd>
            <strong>{correct}</strong> <span>de {total}</span>
          </dd>
        </div>
        <div className="kpi">
          <dt>Pronunciación</dt>
          <dd>
            <strong>{speaking ?? '—'}</strong>{' '}
            <span>{speaking === null ? 'sin grabar' : '% media'}</span>
          </dd>
        </div>
        <div className="kpi">
          <dt>Racha</dt>
          <dd>
            <strong>{streak}</strong> <span>{streak === 1 ? 'día' : 'días'}</span>
          </dd>
        </div>
        <div className="kpi">
          <dt>Repaso de mañana</dt>
          <dd>
            <strong>{tomorrow}</strong> <span>palabras</span>
          </dd>
        </div>
      </dl>

      {examPending && exam && (
        <div className="callout" role="note">
          <Icon name="check" />
          <p>
            Has terminado la semana {exam.week}. Haz el examen para comprobar lo que has aprendido.
          </p>
          <Link className="button button--primary" to={`/examen/${exam.week}`}>
            Hacer el examen
          </Link>
        </div>
      )}

      <div className="task__actions task__actions--start">
        <Link className="button button--primary" to="/">
          Volver al inicio
        </Link>
        <Link className="button button--ghost" to={`/ruta/${day.id}`}>
          Práctica extra del día {day.id}
        </Link>
      </div>
    </section>
  );
}
