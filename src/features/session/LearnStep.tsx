import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { SpeakButton } from '@/components/SpeakButton';
import type { Concept } from '@/domain/types';

/** Presenta las palabras nuevas una a una: palabra, audio, traducción y ejemplo. */
export function LearnStep({ concepts, onDone }: { concepts: Concept[]; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const concept = concepts[index];
  if (!concept) return null;
  const last = index === concepts.length - 1;

  return (
    <section aria-label="Palabras nuevas">
      <p className="step-intro">
        <strong>Palabras nuevas:</strong> escucha cada palabra, lee el ejemplo en voz alta y pasa a
        la siguiente.
      </p>
      <div className="flash">
        <p className="muted small">
          {index + 1} de {concepts.length}
        </p>
        <div className="flashcard flashcard--revealed" aria-live="polite">
          <p className="flashcard__front" lang="en">
            {concept.en}
          </p>
          <SpeakButton text={concept.en} compact />
          <p className="flashcard__back">{concept.es}</p>
          <p className="flashcard__example" lang="en">
            {concept.example}
          </p>
          <SpeakButton text={concept.example} label="Escuchar el ejemplo" />
        </div>
        <div className="task__actions task__actions--center">
          <button
            type="button"
            className="button button--ghost"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
          >
            Anterior
          </button>
          {last ? (
            <button type="button" className="button button--primary" onClick={onDone}>
              Empezar la práctica <Icon name="arrow" size={18} />
            </button>
          ) : (
            <button
              type="button"
              className="button button--primary"
              onClick={() => setIndex((i) => i + 1)}
            >
              Siguiente <Icon name="arrow" size={18} />
            </button>
          )}
        </div>
        {!last && (
          <button type="button" className="link" onClick={onDone}>
            Ya me las sé, ir a la práctica
          </button>
        )}
      </div>
    </section>
  );
}
