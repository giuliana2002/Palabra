import { useId, useState } from 'react';
import { SpeakButton } from '@/components/SpeakButton';
import { checkProduction, type ProductionFeedback } from '@/domain/exercises';
import { words } from '@/domain/text';
import type { ProduceExercise } from '@/domain/types';
import { Feedback } from './Feedback';
import { useExerciseResult } from './useExerciseResult';

export function ProduceCard({ exercise }: { exercise: ProduceExercise }) {
  const { result, answer } = useExerciseResult(exercise);
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState<ProductionFeedback | null>(null);
  const inputId = useId();

  if (result) {
    return (
      <>
        <p className="task__prompt">{exercise.prompt}</p>
        <p className="task__built" lang="en">
          {result.answer}
        </p>
        <Feedback ok okText="Frase guardada. Léela en voz alta tres veces." />
        <div className="task__actions">
          <SpeakButton text={result.answer ?? ''} label="Escuchar mi frase" />
        </div>
        {exercise.concept && (
          <p className="muted small" lang="en">
            Modelo: {exercise.concept.example}
          </p>
        )}
      </>
    );
  }

  const submit = () => {
    const check = checkProduction(text, exercise.target, exercise.minWords);
    setFeedback(check);
    if (check.ok) answer(true, text.trim());
  };

  return (
    <>
      <label className="task__prompt" htmlFor={inputId}>
        {exercise.prompt}
      </label>
      <textarea
        id={inputId}
        className="textarea"
        lang="en"
        rows={2}
        value={text}
        placeholder="Escribe en inglés…"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <div className="task__actions">
        <span className="muted small">{words(text).length} palabras</span>
        <button
          type="button"
          className="button button--primary"
          onClick={submit}
          disabled={!text.trim()}
        >
          Revisar
        </button>
      </div>
      {feedback && !feedback.ok && (
        <div className="feedback feedback--ko" role="status">
          <ul>
            {[...feedback.issues, ...feedback.tips].map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
