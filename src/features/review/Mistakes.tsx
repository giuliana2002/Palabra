import { KIND_LABELS } from '@/domain/types';
import { useProgress } from '@/store/progress';

export function Mistakes() {
  const mistakes = useProgress((s) => s.mistakes);
  const clear = useProgress((s) => s.clearMistakes);

  if (!mistakes.length) {
    return (
      <div className="empty">
        <h2>Tu cuaderno está vacío</h2>
        <p className="muted">
          Cada respuesta fallada se guarda aquí con la corrección y su explicación.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="section__head">
        <p className="muted">
          Los errores más recientes primero. Repítelos en voz alta con la versión correcta.
        </p>
        <button type="button" className="button button--ghost" onClick={clear}>
          Vaciar cuaderno
        </button>
      </div>
      <ul className="mistakes">
        {mistakes.map((m) => (
          <li key={m.id + m.at} className="mistake">
            <p className="mistake__meta">
              {KIND_LABELS[m.kind]} · {m.at}
            </p>
            <p lang="en" className="mistake__prompt">
              {m.prompt}
            </p>
            <p>
              <span className="tag tag--ko">Tu respuesta</span> <s lang="en">{m.given}</s>
            </p>
            <p>
              <span className="tag tag--ok">Correcta</span> <strong lang="en">{m.correct}</strong>
            </p>
            {m.explanation && <p className="muted small">{m.explanation}</p>}
          </li>
        ))}
      </ul>
    </>
  );
}
