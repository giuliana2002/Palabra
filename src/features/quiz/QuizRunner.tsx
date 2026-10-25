import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { ProgressBar } from '@/components/ProgressBar';
import { NoVoiceFallback } from '@/components/NoVoiceFallback';
import { SpeakButton } from '@/components/SpeakButton';
import type { QuizQuestion } from '@/domain/quiz';
import { useSpeech } from '@/hooks/useSpeech';

interface Props {
  questions: QuizQuestion[];
  label: string;
  onAnswer?: (question: QuizQuestion, given: string, ok: boolean) => void;
  onFinish: (answers: Record<string, string>) => void;
  finishLabel?: string;
}

/**
 * Presenta un test pregunta a pregunta con corrección inmediata.
 * Teclado: 1–4 para elegir, Enter para continuar.
 */
export function QuizRunner({
  questions,
  label,
  onAnswer,
  onFinish,
  finishLabel = 'Ver resultado',
}: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const nextButton = useRef<HTMLButtonElement>(null);
  const { speak, status } = useSpeech();
  const noVoice = status === 'missing';
  const speakRef = useRef(speak);
  speakRef.current = speak;
  const question = questions[index];
  const given = question ? answers[question.id] : undefined;
  const last = index === questions.length - 1;

  // Las preguntas de escucha se reproducen solas al aparecer.
  useEffect(() => {
    if (question?.audioOnly && question.audio) speakRef.current(question.audio);
  }, [question]);

  const choose = useCallback(
    (option: string) => {
      if (!question || given !== undefined) return;
      const ok = option === question.answer;
      setAnswers((a) => ({ ...a, [question.id]: option }));
      onAnswer?.(question, option, ok);
      requestAnimationFrame(() => nextButton.current?.focus());
    },
    [question, given, onAnswer],
  );

  const next = useCallback(() => {
    if (given === undefined) return;
    if (last) onFinish(answers);
    else setIndex((i) => i + 1);
  }, [given, last, onFinish, answers]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const n = Number(e.key);
      if (question && n >= 1 && n <= question.options.length)
        choose(question.options[n - 1] as string);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [question, choose]);

  if (!question) return null;
  const ok = given === question.answer;

  return (
    <div className="quiz">
      <ProgressBar
        value={index + (given !== undefined ? 1 : 0)}
        max={questions.length}
        label={label}
      />
      <article
        className={`quiz__card ${given === undefined ? '' : ok ? 'task--ok' : 'task--ko'}`}
        aria-live="polite"
      >
        <p className="task__meta">
          <span>
            Pregunta {index + 1} de {questions.length}
          </span>
        </p>
        <p className="quiz__prompt">{question.prompt}</p>
        {question.context && !question.audioOnly && (
          <p className="quiz__context" lang="en">
            {question.context}
          </p>
        )}
        {question.audio && noVoice && question.audioOnly && (
          <NoVoiceFallback text={question.audio} />
        )}
        {question.audio && !noVoice && (
          <div className="task__audio">
            <SpeakButton
              text={question.audio}
              label={question.audioOnly ? 'Escuchar otra vez' : 'Escuchar'}
            />
            {question.audioOnly && <SpeakButton text={question.audio} label="Despacio" slow />}
          </div>
        )}
        <div className="options" role="group" aria-label="Opciones">
          {question.options.map((option, i) => {
            const state =
              given === undefined
                ? ''
                : option === question.answer
                  ? 'option--right'
                  : option === given
                    ? 'option--wrong'
                    : 'option--muted';
            return (
              <button
                key={option}
                type="button"
                className={`option ${state}`}
                disabled={given !== undefined}
                aria-pressed={given === option}
                onClick={() => choose(option)}
              >
                <kbd aria-hidden="true">{i + 1}</kbd> {option}
              </button>
            );
          })}
        </div>
        {given !== undefined && (
          <div className={`feedback ${ok ? 'feedback--ok' : 'feedback--ko'}`} role="status">
            <Icon name={ok ? 'check' : 'x'} size={18} />
            <div>
              <p>
                {ok ? (
                  '¡Correcto!'
                ) : (
                  <>
                    La respuesta correcta es: <strong>{question.answer}</strong>
                  </>
                )}
              </p>
              {question.explanation && (
                <p className="feedback__explanation">{question.explanation}</p>
              )}
            </div>
          </div>
        )}
        <div className="task__actions">
          <button
            ref={nextButton}
            type="button"
            className="button button--primary"
            disabled={given === undefined}
            onClick={next}
          >
            {last ? finishLabel : 'Siguiente'} <Icon name="arrow" size={18} />
          </button>
        </div>
      </article>
    </div>
  );
}
