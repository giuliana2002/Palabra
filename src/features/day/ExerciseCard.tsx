import { memo } from 'react';
import { KIND_LABELS, type Exercise } from '@/domain/types';
import { useProgress } from '@/store/progress';
import { BuildCard } from './BuildCard';
import { ChoiceCard } from './ChoiceCard';
import { ProduceCard } from './ProduceCard';

export const ExerciseCard = memo(function ExerciseCard({
  exercise,
  index,
}: {
  exercise: Exercise;
  index: number;
}) {
  const result = useProgress((s) => s.results[exercise.id]);
  const state = result ? (result.ok ? 'task--ok' : 'task--ko') : '';
  return (
    <article className={`task ${state}`} aria-labelledby={`${exercise.id}-title`}>
      <header className="task__meta">
        <span id={`${exercise.id}-title`}>Actividad {index + 1}</span>
        <span>{KIND_LABELS[exercise.kind]}</span>
      </header>
      {exercise.kind === 'build' ? (
        <BuildCard exercise={exercise} />
      ) : exercise.kind === 'produce' ? (
        <ProduceCard exercise={exercise} />
      ) : (
        <ChoiceCard exercise={exercise} />
      )}
    </article>
  );
});
