import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DAYS, exercisesForDay } from '@/data';
import { buildReviewQuiz, type QuizScore } from '@/domain/quiz';
import { toDayKey } from '@/domain/dates';
import {
  firstStep,
  nextStep,
  pickPracticeExercises,
  pickSpeakingSentences,
  SESSION_STEPS,
  STEP_LABELS,
  type SessionStep,
} from '@/domain/session';
import { DailyReviewQuiz } from '@/features/quiz/DailyReviewQuiz';
import { useProgress } from '@/store/progress';
import { LearnStep } from './LearnStep';
import { PracticeStep } from './PracticeStep';
import { SpeakStep } from './SpeakStep';
import { SummaryStep } from './SummaryStep';

export function SessionPage() {
  const today = toDayKey();
  const currentDay = useProgress((s) => s.currentDay);
  // La sesión se planifica una vez al entrar: el día no cambia aunque al terminar avance la ruta.
  const [dayId] = useState(currentDay);
  const plan = DAYS[dayId] ?? DAYS[0]!;
  const [startedAt] = useState(() => Date.now());

  const hasReview = useMemo(
    () => buildReviewQuiz({ days: DAYS, currentDay: dayId, cards: {}, today }).length > 0,
    [dayId, today],
  );
  const practice = useMemo(
    () =>
      pickPracticeExercises(
        exercisesForDay(plan.id),
        new Set(Object.keys(useProgress.getState().results)),
      ),
    [plan.id],
  );
  const sentences = useMemo(
    () => pickSpeakingSentences(plan.concepts, `${today}-${plan.id}`),
    [plan, today],
  );

  const [step, setStep] = useState<SessionStep>(firstStep(hasReview));
  const [warmup, setWarmup] = useState<QuizScore | null>(null);
  const [speakingScores, setSpeakingScores] = useState<number[]>([]);
  const advance = () => {
    setStep((s) => nextStep(s));
    window.scrollTo({ top: 0 });
  };
  const steps = SESSION_STEPS.filter((s) => hasReview || s !== 'warmup');

  return (
    <>
      <PageHeader
        eyebrow={`Sesión guiada · Día ${plan.id}`}
        title={plan.title}
        lead={
          step === firstStep(hasReview)
            ? `${plan.goal} Unos 25 minutos en ${steps.length} pasos.`
            : undefined
        }
      />

      <ol className="stepper" aria-label="Pasos de la sesión">
        {steps.map((s, i) => {
          const index = steps.indexOf(step);
          const state =
            i < index ? 'stepper__item--done' : i === index ? 'stepper__item--current' : '';
          return (
            <li
              key={s}
              className={`stepper__item ${state}`}
              aria-current={s === step ? 'step' : undefined}
            >
              <span className="stepper__dot">{i + 1}</span>
              <span className="stepper__label">{STEP_LABELS[s]}</span>
            </li>
          );
        })}
      </ol>

      {step === 'warmup' && (
        <section aria-label="Calentamiento">
          <p className="step-intro">
            <strong>Calentamiento:</strong> 10 palabras de días anteriores. Las que falles volverán
            mañana.
          </p>
          <DailyReviewQuiz
            onDone={(score) => {
              setWarmup(score);
              advance();
            }}
          />
        </section>
      )}
      {step === 'learn' && <LearnStep concepts={plan.concepts} onDone={advance} />}
      {step === 'practice' && <PracticeStep exercises={practice} onDone={advance} />}
      {step === 'speak' && (
        <SpeakStep
          sentences={sentences}
          onDone={(scores) => {
            setSpeakingScores(scores);
            advance();
          }}
        />
      )}
      {step === 'summary' && (
        <SummaryStep
          day={plan}
          warmup={warmup}
          practice={practice}
          speakingScores={speakingScores}
          startedAt={startedAt}
        />
      )}
    </>
  );
}
