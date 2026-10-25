import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { ProgressBar } from '@/components/ProgressBar';
import type { Exercise } from '@/domain/types';
import { ExerciseCard } from '@/features/day/ExerciseCard';
import { useProgress } from '@/store/progress';

/** 12 ejercicios (2 de cada tipo) de uno en uno. */
export function PracticeStep({ exercises, onDone }: { exercises: Exercise[]; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const exercise = exercises[index];
  const answered = useProgress((s) => (exercise ? Boolean(s.results[exercise.id]) : false));
  if (!exercise) return null;
  const last = index === exercises.length - 1;
  const next = () => (last ? onDone() : setIndex((i) => i + 1));

  return (
    <section aria-label="Práctica" className="practice">
      <p className="step-intro">
        <strong>Práctica:</strong> {exercises.length} actividades, dos de cada tipo.
      </p>
      <ProgressBar
        value={index + (answered ? 1 : 0)}
        max={exercises.length}
        label="Progreso de la práctica"
      />
      <ExerciseCard key={exercise.id} exercise={exercise} index={index} />
      <div className="task__actions">
        {!answered && (
          <button type="button" className="link" onClick={next}>
            Saltar
          </button>
        )}
        <button
          type="button"
          className="button button--primary"
          disabled={!answered}
          onClick={next}
        >
          {last ? 'Pasar a hablar' : 'Siguiente'} <Icon name="arrow" size={18} />
        </button>
      </div>
    </section>
  );
}
