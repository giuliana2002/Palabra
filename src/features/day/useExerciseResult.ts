import { useCallback } from 'react';
import type { Exercise } from '@/domain/types';
import { useProgress } from '@/store/progress';

/** Conecta un ejercicio con el store: resultado guardado + función para responder. */
export function useExerciseResult(exercise: Exercise) {
  const result = useProgress((s) => s.results[exercise.id]);
  const recordAnswer = useProgress((s) => s.recordAnswer);

  const answer = useCallback(
    (ok: boolean, given: string) => {
      const correct = 'answer' in exercise ? exercise.answer : given;
      recordAnswer({
        exerciseId: exercise.id,
        kind: exercise.kind,
        day: exercise.day,
        ok,
        given,
        correct,
        prompt: 'context' in exercise && exercise.context ? exercise.context : exercise.prompt,
        explanation: 'explanation' in exercise ? exercise.explanation : undefined,
        concept: exercise.concept,
      });
    },
    [exercise, recordAnswer],
  );

  return { result, answer };
}
