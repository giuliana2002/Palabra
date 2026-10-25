import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { SpeakButton } from '@/components/SpeakButton';
import { DAYS, exercisesForDay, TOTAL_DAYS } from '@/data';
import { EXERCISES_PER_DAY } from '@/domain/exercises';
import { EXERCISE_KINDS, KIND_LABELS, type ExerciseKind } from '@/domain/types';
import { useProgress } from '@/store/progress';
import { ExerciseCard } from './ExerciseCard';

export function DayPage() {
  const params = useParams();
  const dayId = Number(params.day);
  const plan = DAYS[dayId];
  const [kind, setKind] = useState<ExerciseKind>('meaning');
  const setCurrentDay = useProgress((s) => s.setCurrentDay);
  const resetDay = useProgress((s) => s.resetDay);
  const results = useProgress((s) => s.results);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (plan) setCurrentDay(plan.id);
  }, [plan, setCurrentDay]);

  const exercises = useMemo(() => (plan ? exercisesForDay(plan.id) : null), [plan]);
  if (!plan || !exercises) return <Navigate to="/ruta" replace />;

  const dayResults = Object.values(results).filter((r) => r.day === plan.id);
  const byKind = (k: ExerciseKind) => dayResults.filter((r) => r.kind === k).length;
  const correct = dayResults.filter((r) => r.ok).length;
  const complete = dayResults.length >= EXERCISES_PER_DAY;

  return (
    <>
      <PageHeader
        eyebrow={`Día ${plan.id} de ${TOTAL_DAYS - 1} · ${plan.grammar}`}
        title={plan.title}
        lead={plan.goal}
        actions={
          <Link className="button button--ghost" to={`/teoria?seccion=${plan.theoryId}`}>
            <Icon name="book" size={18} /> Ver teoría
          </Link>
        }
      />

      <div className="day-summary">
        <ProgressBar
          value={dayResults.length}
          max={EXERCISES_PER_DAY}
          label="Actividades completadas"
        />
        <span className="muted small">
          {dayResults.length
            ? `${Math.round((correct / dayResults.length) * 100)}% de aciertos`
            : 'Sin empezar'}
        </span>
      </div>

      {complete && (
        <div className="callout" role="status">
          <Icon name="check" />
          <p>
            ¡Día completado con {correct} aciertos de {EXERCISES_PER_DAY}! Las palabras que fallaste
            ya están en tu repaso.
          </p>
          {plan.id < TOTAL_DAYS - 1 && (
            <Link className="button button--primary" to={`/ruta/${plan.id + 1}`}>
              Siguiente día <Icon name="arrow" size={18} />
            </Link>
          )}
        </div>
      )}

      <div className="tabs" role="tablist" aria-label="Tipos de actividad">
        {EXERCISE_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            id={`tab-${k}`}
            aria-selected={kind === k}
            aria-controls="exercise-panel"
            className={`tab ${kind === k ? 'tab--active' : ''}`}
            onClick={() => setKind(k)}
          >
            {KIND_LABELS[k]}
            <span className="tab__count">{byKind(k)}/15</span>
          </button>
        ))}
      </div>

      <section
        id="exercise-panel"
        role="tabpanel"
        aria-labelledby={`tab-${kind}`}
        className="task-grid"
      >
        {exercises[kind].map((exercise, i) => (
          <ExerciseCard key={exercise.id} exercise={exercise} index={i} />
        ))}
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Conceptos de esta sesión</h2>
          {dayResults.length > 0 &&
            (confirmReset ? (
              <span className="inline-confirm">
                ¿Borrar las respuestas de este día?
                <button
                  type="button"
                  className="button button--danger"
                  onClick={() => {
                    resetDay(plan.id);
                    setConfirmReset(false);
                  }}
                >
                  Sí, reiniciar
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => setConfirmReset(false)}
                >
                  Cancelar
                </button>
              </span>
            ) : (
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setConfirmReset(true)}
              >
                <Icon name="refresh" size={16} /> Reiniciar día
              </button>
            ))}
        </div>
        <ul className="concept-list">
          {plan.concepts.map((c) => (
            <li key={c.en}>
              <div>
                <strong lang="en">{c.en}</strong> <span className="muted">— {c.es}</span>
                <p lang="en">{c.example}</p>
              </div>
              <SpeakButton text={c.example} compact />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
