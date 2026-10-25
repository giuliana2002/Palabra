import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { SpeakButton } from '@/components/SpeakButton';
import { sameSentence } from '@/domain/text';
import type { BuildExercise } from '@/domain/types';
import { Feedback } from './Feedback';
import { useExerciseResult } from './useExerciseResult';

export function BuildCard({ exercise }: { exercise: BuildExercise }) {
  const { result, answer } = useExerciseResult(exercise);
  // Guardamos índices (no palabras) para soportar palabras repetidas en la frase.
  const [picked, setPicked] = useState<number[]>([]);
  const built = picked.map((i) => exercise.tokens[i]).join(' ');
  const complete = picked.length === exercise.tokens.length;

  if (result) {
    return (
      <>
        <p className="task__prompt">{exercise.prompt}</p>
        <p className="task__built" lang="en">
          {result.answer || exercise.answer}
        </p>
        <Feedback ok={result.ok} correct={exercise.answer} />
        <SpeakButton text={exercise.answer} label="Escuchar la frase" />
      </>
    );
  }

  return (
    <>
      <p className="task__prompt">
        {exercise.prompt} <span className="muted">{exercise.hint}</span>
      </p>
      <div className="task__built" aria-live="polite" lang="en">
        {picked.length === 0 ? (
          <span className="muted">Pulsa las palabras en orden…</span>
        ) : (
          picked.map((tokenIndex, position) => (
            <button
              key={tokenIndex}
              type="button"
              className="chip chip--placed"
              onClick={() => setPicked((p) => p.filter((_, i) => i !== position))}
              aria-label={`Quitar «${exercise.tokens[tokenIndex]}»`}
            >
              {exercise.tokens[tokenIndex]}
            </button>
          ))
        )}
      </div>
      <div className="chips" role="group" aria-label="Palabras disponibles" lang="en">
        {exercise.tokens.map((token, i) => (
          <button
            key={i}
            type="button"
            className="chip"
            disabled={picked.includes(i)}
            onClick={() => setPicked((p) => [...p, i])}
          >
            {token}
          </button>
        ))}
      </div>
      <div className="task__actions">
        <button
          type="button"
          className="button button--ghost"
          disabled={!picked.length}
          onClick={() => setPicked((p) => p.slice(0, -1))}
        >
          <Icon name="undo" size={16} /> Deshacer
        </button>
        <button
          type="button"
          className="button button--ghost"
          disabled={!picked.length}
          onClick={() => setPicked([])}
        >
          Borrar
        </button>
        <button
          type="button"
          className="button button--primary"
          disabled={!complete}
          onClick={() => answer(sameSentence(built, exercise.answer), built)}
        >
          Comprobar
        </button>
      </div>
    </>
  );
}
