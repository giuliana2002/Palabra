import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { SpeakButton } from '@/components/SpeakButton';
import { analyzeLyrics, type LyricAnalysis, type TokenTag } from '@/domain/lyrics';
import { useProgress } from '@/store/progress';

const LEGEND: Array<{ tag: Exclude<TokenTag, null>; label: string }> = [
  { tag: 'pronoun', label: 'Pronombres' },
  { tag: 'verb', label: 'Verbos' },
  { tag: 'connector', label: 'Conectores' },
  { tag: 'question', label: 'Interrogativos' },
  { tag: 'contraction', label: 'Contracciones' },
];

const SAMPLE = `I wake up early when the city is asleep
I walk alone and I listen to the rain
Because I know that I'm gonna find my way
I wake up early when the city is asleep`;

const TASKS = [
  'Escucha la canción una vez sin mirar la letra. ¿De qué trata? Resúmelo en una frase en español.',
  'Localiza tres verbos y di en qué tiempo están.',
  'Busca un conector y explica qué ideas une.',
  'Elige una expresión completa y úsala en una frase sobre tu vida.',
  'Repite la línea más repetida imitando el ritmo.',
];

export function SongsPage() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<LyricAnalysis | null>(null);
  const [checked, setChecked] = useState<boolean[]>(() => TASKS.map(() => false));
  const logActivity = useProgress((s) => s.logActivity);

  const analyse = (value = text) => {
    if (!value.trim()) return;
    setAnalysis(analyzeLyrics(value));
    logActivity();
  };

  return (
    <>
      <PageHeader
        eyebrow="Laboratorio"
        title="Canciones"
        lead="Pega un fragmento breve de una canción que estés escuchando. Palabra marca pronombres, verbos, conectores y contracciones para que lo estudies por partes. No se descarga ni se guarda ninguna letra."
      />
      <div className="songs">
        <section className="panel">
          <label className="field">
            <span>Fragmento de la canción</span>
            <textarea
              className="textarea"
              rows={8}
              lang="en"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Pega aquí unas líneas en inglés…"
            />
          </label>
          <div className="task__actions">
            <button
              type="button"
              className="button button--ghost"
              onClick={() => {
                setText(SAMPLE);
                analyse(SAMPLE);
              }}
            >
              Probar con un ejemplo
            </button>
            <button
              type="button"
              className="button button--primary"
              disabled={!text.trim()}
              onClick={() => analyse()}
            >
              Analizar
            </button>
          </div>
        </section>

        {analysis && (
          <section className="panel" aria-live="polite">
            <ul className="legend">
              {LEGEND.map((l) => (
                <li key={l.tag} className={`tok tok--${l.tag}`}>
                  {l.label} <strong>{analysis.counts[l.tag]}</strong>
                </li>
              ))}
            </ul>
            <div className="lyrics" lang="en">
              {analysis.lines.map((line, i) => (
                <p key={i}>
                  {line.map((token, j) => (
                    <span key={j} className={token.tag ? `tok tok--${token.tag}` : undefined}>
                      {token.text}{' '}
                    </span>
                  ))}
                  <SpeakButton text={line.map((t) => t.text).join(' ')} compact />
                </p>
              ))}
            </div>
            {analysis.repeatedLines.length > 0 && (
              <p className="muted small">
                <strong>Posible estribillo:</strong>{' '}
                <em lang="en">{analysis.repeatedLines.join(' / ')}</em>
              </p>
            )}
            {analysis.topWords.length > 0 && (
              <p className="muted small">
                <strong>Palabras clave:</strong>{' '}
                {analysis.topWords.map((w) => `${w.word} (${w.count})`).join(', ')}
              </p>
            )}
          </section>
        )}
      </div>

      <section className="section">
        <h2>Método en cinco pasos</h2>
        <ul className="checklist">
          {TASKS.map((task, i) => (
            <li key={task}>
              <label>
                <input
                  type="checkbox"
                  checked={checked[i]}
                  onChange={() => setChecked((c) => c.map((v, n) => (n === i ? !v : v)))}
                />
                <span>{task}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
