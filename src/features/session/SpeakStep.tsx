import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { SpeakButton } from '@/components/SpeakButton';
import { scorePronunciation, type PronunciationResult } from '@/domain/pronunciation';
import type { Concept } from '@/domain/types';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

/** Decir en voz alta 3 frases del día. Sin reconocimiento de voz, se practica escuchar y repetir. */
export function SpeakStep({
  sentences,
  onDone,
}: {
  sentences: Concept[];
  onDone: (scores: number[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const recognition = useSpeechRecognition();
  const sentence = sentences[index];
  if (!sentence) return null;
  const last = index === sentences.length - 1;

  const next = (score: number | null) => {
    const all = score === null ? scores : [...scores, score];
    setScores(all);
    setResult(null);
    if (last) onDone(all);
    else setIndex((i) => i + 1);
  };

  return (
    <section aria-label="Habla">
      <p className="step-intro">
        <strong>Habla:</strong> escucha el modelo y dilo en voz alta.{' '}
        {recognition.supported
          ? 'Pulsa «Grabar» y la app te dirá qué palabras se entendieron.'
          : 'Repite cada frase tres veces.'}
      </p>
      <div className="panel pron__stage" aria-live="polite">
        <p className="muted small">
          Frase {index + 1} de {sentences.length}
        </p>
        <p className="pron__target" lang="en">
          {result
            ? result.words.map((w, i) => (
                <span key={i} className={w.matched ? 'word word--ok' : 'word word--ko'}>
                  {w.word}{' '}
                </span>
              ))
            : sentence.example}
        </p>
        <p className="muted">
          {sentence.es}: «{sentence.en}»
        </p>
        <div className="task__actions task__actions--center">
          <SpeakButton text={sentence.example} label="Modelo" />
          <SpeakButton text={sentence.example} label="Despacio" slow />
          {recognition.supported && (
            <button
              type="button"
              className={`button ${recognition.listening ? 'button--danger' : 'button--primary'}`}
              onClick={
                recognition.listening
                  ? recognition.stop
                  : () =>
                      recognition.start((heard) =>
                        setResult(scorePronunciation(sentence.example, heard)),
                      )
              }
            >
              <Icon name="mic" size={18} />{' '}
              {recognition.listening ? 'Parar' : result ? 'Repetir' : 'Grabar'}
            </button>
          )}
        </div>
        {recognition.error && <p className="error">{recognition.error}</p>}
        {result && (
          <p>
            <strong>{result.score}%</strong>{' '}
            <span className="muted">· se entendió «{result.heard}»</span>
          </p>
        )}
        <div className="task__actions task__actions--center">
          {result ? (
            <button
              type="button"
              className="button button--primary"
              onClick={() => next(result.score)}
            >
              {last ? 'Ver resumen' : 'Siguiente frase'} <Icon name="arrow" size={18} />
            </button>
          ) : (
            <button type="button" className="button button--ghost" onClick={() => next(null)}>
              {recognition.supported ? 'Saltar' : 'Ya la he repetido'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
