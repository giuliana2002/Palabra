import { SpeakButton } from '@/components/SpeakButton';
import type { ChoiceExercise } from '@/domain/types';
import { Feedback } from './Feedback';
import { useExerciseResult } from './useExerciseResult';

export function ChoiceCard({ exercise }: { exercise: ChoiceExercise }) {
  const { result, answer } = useExerciseResult(exercise);
  const answered = Boolean(result);

  return (
    <>
      <p className="task__prompt">{exercise.prompt}</p>
      {exercise.audio && (
        <div className="task__audio">
          <SpeakButton text={exercise.audio} label="Escuchar" />
          <SpeakButton text={exercise.audio} label="Más despacio" slow />
        </div>
      )}
      {exercise.context && (
        <p className="task__context" lang="en">
          {exercise.context}
        </p>
      )}
      <div className="options" role="group" aria-label="Opciones">
        {exercise.options.map((option) => {
          const isAnswer = option === exercise.answer;
          const chosen = result?.answer === option;
          const state = !answered
            ? ''
            : isAnswer
              ? 'option--right'
              : chosen
                ? 'option--wrong'
                : 'option--muted';
          return (
            <button
              key={option}
              type="button"
              lang="en"
              className={`option ${state}`}
              disabled={answered}
              aria-pressed={chosen}
              onClick={() => answer(isAnswer, option)}
            >
              {option}
            </button>
          );
        })}
      </div>
      {result && (
        <Feedback ok={result.ok} correct={exercise.answer} explanation={exercise.explanation} />
      )}
    </>
  );
}
