import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { SpeakButton } from '@/components/SpeakButton';
import { DAYS } from '@/data';
import { scorePronunciation, type PronunciationResult } from '@/domain/pronunciation';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useProgress } from '@/store/progress';

const VERDICT_TEXT: Record<PronunciationResult['verdict'], string> = {
  excelente: '¡Excelente! Se ha entendido perfectamente.',
  bien: 'Bien. Repite fijándote en las palabras marcadas.',
  mejorable: 'Se entiende a medias. Escucha el modelo despacio y repite por bloques.',
  repite: 'No se ha entendido. Habla más despacio y cerca del micrófono.',
};

export function PronunciationPage() {
  const [params] = useSearchParams();
  const currentDay = useProgress((s) => s.currentDay);
  const logActivity = useProgress((s) => s.logActivity);
  const [dayId, setDayId] = useState(currentDay);
  const sentences = useMemo(() => (DAYS[dayId]?.concepts ?? []).map((c) => c.example), [dayId]);
  const [target, setTarget] = useState(
    params.get('frase') ?? sentences[0] ?? 'Could you repeat that, please?',
  );
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [history, setHistory] = useState<Array<{ sentence: string; score: number }>>([]);
  const recognition = useSpeechRecognition();

  const record = () =>
    recognition.start((heard) => {
      const scored = scorePronunciation(target, heard);
      setResult(scored);
      setHistory((h) => [{ sentence: target, score: scored.score }, ...h].slice(0, 8));
      logActivity();
    });

  return (
    <>
      <PageHeader
        eyebrow="Reconocimiento de voz"
        title="Pronunciación"
        lead="Escucha el modelo, grábate y comprueba qué palabras se han entendido. La puntuación compara palabra a palabra lo que dices con la frase."
      />

      {!recognition.supported && (
        <div className="callout callout--warn" role="note">
          <Icon name="lightbulb" />
          <p>
            Tu navegador no tiene reconocimiento de voz. Funciona en Chrome, Edge y Safari. Mientras
            tanto puedes escuchar los modelos y practicar la repetición (shadowing).
          </p>
        </div>
      )}

      <div className="pron">
        <section className="panel">
          <div className="field-row">
            <label className="field">
              <span>Frases del día</span>
              <select
                className="input"
                value={dayId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setDayId(id);
                  setTarget(DAYS[id]?.concepts[0]?.example ?? '');
                  setResult(null);
                }}
              >
                {DAYS.map((d) => (
                  <option key={d.id} value={d.id}>
                    Día {d.id} · {d.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <ul className="sentence-list">
            {sentences.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  lang="en"
                  className={`sentence ${s === target ? 'sentence--active' : ''}`}
                  aria-pressed={s === target}
                  onClick={() => {
                    setTarget(s);
                    setResult(null);
                  }}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
          <label className="field">
            <span>O escribe tu propia frase</span>
            <input
              className="input"
              lang="en"
              value={target}
              onChange={(e) => {
                setTarget(e.target.value);
                setResult(null);
              }}
            />
          </label>
        </section>

        <section className="panel pron__stage" aria-live="polite">
          <p className="pron__target" lang="en">
            {result
              ? result.words.map((w, i) => (
                  <span key={i} className={w.matched ? 'word word--ok' : 'word word--ko'}>
                    {w.word}{' '}
                  </span>
                ))
              : target}
          </p>
          <div className="task__actions task__actions--center">
            <SpeakButton text={target} label="Modelo" />
            <SpeakButton text={target} label="Despacio" slow />
            {recognition.supported && (
              <button
                type="button"
                className={`button ${recognition.listening ? 'button--danger' : 'button--primary'}`}
                onClick={recognition.listening ? recognition.stop : record}
                disabled={!target.trim()}
              >
                <Icon name="mic" size={18} />
                {recognition.listening ? 'Parar' : 'Grabar'}
              </button>
            )}
          </div>
          {recognition.listening && <p className="muted">Escuchando… {recognition.transcript}</p>}
          {recognition.error && <p className="error">{recognition.error}</p>}
          {result && (
            <div className="score">
              <div
                className="ring ring--large"
                style={{ '--value': result.score } as React.CSSProperties}
              >
                <span>{result.score}%</span>
              </div>
              <div>
                <p>
                  <strong>{VERDICT_TEXT[result.verdict]}</strong>
                </p>
                <p className="muted small">
                  Se ha entendido: <em lang="en">«{result.heard}»</em>
                </p>
              </div>
            </div>
          )}
          {history.length > 0 && (
            <details className="history">
              <summary>Intentos de esta sesión ({history.length})</summary>
              <ul>
                {history.map((h, i) => (
                  <li key={i}>
                    <span lang="en">{h.sentence}</span> <strong>{h.score}%</strong>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      </div>
    </>
  );
}
