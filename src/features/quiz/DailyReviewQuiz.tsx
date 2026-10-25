import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DAYS } from '@/data';
import { toDayKey } from '@/domain/dates';
import { buildReviewQuiz, scoreQuiz, type QuizScore } from '@/domain/quiz';
import { useProgress } from '@/store/progress';
import { QuizResult } from './QuizResult';
import { QuizRunner } from './QuizRunner';

interface Props {
  /** Si se indica, al terminar se llama en lugar de mostrar el resultado (modo sesión). */
  onDone?: (score: QuizScore) => void;
}

/** Test diario: 10 preguntas con vocabulario de días anteriores, priorizado por el repaso espaciado. */
export function DailyReviewQuiz({ onDone }: Props) {
  const today = toDayKey();
  const currentDay = useProgress((s) => s.currentDay);
  const answerReview = useProgress((s) => s.answerReview);
  const [attempt, setAttempt] = useState(0);
  // Se toma una foto de las tarjetas al empezar para que el test no cambie mientras se responde.
  const questions = useMemo(
    () => buildReviewQuiz({ days: DAYS, currentDay, cards: useProgress.getState().cards, today }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `attempt` fuerza un test nuevo
    [currentDay, today, attempt],
  );
  const [score, setScore] = useState<QuizScore | null>(null);

  if (questions.length === 0) {
    return (
      <div className="empty">
        <h2>Aún no hay días anteriores que repasar</h2>
        <p className="muted">
          El test diario usa el vocabulario de los días que ya has pasado. Completa tu primera
          sesión y vuelve mañana.
        </p>
        <Link className="button button--primary" to="/sesion">
          Empezar la sesión de hoy
        </Link>
      </div>
    );
  }

  if (score && !onDone) {
    return (
      <QuizResult
        score={score}
        title={
          score.percent >= 80 ? '¡Muy bien!' : score.percent >= 50 ? 'Vas bien' : 'Toca repasar'
        }
        message="Las palabras falladas volverán mañana; las acertadas, más adelante."
        showSkills={false}
        actions={
          <>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => {
                setScore(null);
                setAttempt((a) => a + 1);
              }}
            >
              Repetir test
            </button>
            <Link className="button button--primary" to="/">
              Volver al inicio
            </Link>
          </>
        }
      />
    );
  }

  return (
    <QuizRunner
      key={attempt}
      questions={questions}
      label="Progreso del test de repaso"
      onAnswer={(q, _given, ok) => q.concept && answerReview(q.concept, ok)}
      onFinish={(answers) => {
        const result = scoreQuiz(questions, answers);
        if (onDone) onDone(result);
        else setScore(result);
      }}
      finishLabel={onDone ? 'Continuar' : 'Ver resultado'}
    />
  );
}
