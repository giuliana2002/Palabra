import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { SpeakButton } from '@/components/SpeakButton';
import { PHRASE_LEVEL_LABELS, PHRASES, recommendedLevel, type PhraseLevel } from '@/data/phrases';
import { useProgress } from '@/store/progress';

const PAGE = 20;

export function PhrasesPage() {
  const currentDay = useProgress((s) => s.currentDay);
  const recommended = recommendedLevel(currentDay);
  const [level, setLevel] = useState<PhraseLevel>(recommended);
  const [page, setPage] = useState(0);
  const [showEs, setShowEs] = useState(true);
  const list = PHRASES[level];
  const pages = Math.ceil(list.length / PAGE);
  const visible = list.slice(page * PAGE, page * PAGE + PAGE);

  return (
    <>
      <PageHeader
        eyebrow="1.200 frases · 400 por nivel"
        title="Frases"
        lead="Lee, escucha y adapta. Elige una frase, cámbiale una parte para hablar de tu vida y practícala en Pronunciación."
      />
      <div className="toolbar">
        <div className="tabs" role="tablist" aria-label="Nivel">
          {(Object.keys(PHRASES) as PhraseLevel[]).map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={level === l}
              className={`tab ${level === l ? 'tab--active' : ''}`}
              onClick={() => {
                setLevel(l);
                setPage(0);
              }}
            >
              {PHRASE_LEVEL_LABELS[l]}
              {l === recommended && <span className="tab__count">recomendado</span>}
            </button>
          ))}
        </div>
        <label className="switch">
          <input type="checkbox" checked={showEs} onChange={(e) => setShowEs(e.target.checked)} />
          <span>Mostrar traducción</span>
        </label>
      </div>

      <ul className="phrase-list">
        {visible.map((p) => (
          <li key={p.id} className="phrase">
            <div>
              <p lang="en" className="phrase__en">
                {p.en}
              </p>
              {showEs && <p className="muted">{p.es}</p>}
            </div>
            <div className="concept__actions">
              <SpeakButton text={p.en} compact />
              <Link
                className="icon-button"
                to={`/pronunciacion?frase=${encodeURIComponent(p.en)}`}
                aria-label={`Practicar pronunciación: ${p.en}`}
                title="Practicar pronunciación"
              >
                <Icon name="mic" size={16} />
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <nav className="pager" aria-label="Paginación">
        <button
          type="button"
          className="button button--ghost"
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          Anterior
        </button>
        <span className="muted">
          Página {page + 1} de {pages}
        </span>
        <button
          type="button"
          className="button button--ghost"
          disabled={page >= pages - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente
        </button>
      </nav>
    </>
  );
}
