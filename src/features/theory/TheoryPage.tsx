import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { RichText } from '@/components/RichText';
import { SpeakButton } from '@/components/SpeakButton';
import { THEORY, type TheoryBlock } from '@/data/theory';

export function TheoryPage() {
  const [params, setParams] = useSearchParams();
  const active = params.get('seccion');

  useEffect(() => {
    if (!active) return;
    document
      .getElementById(`teoria-${active}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [active]);

  return (
    <>
      <PageHeader
        eyebrow="Manual A0 → B1 funcional"
        title="Entiende el inglés antes de usarlo"
        lead="No intentes memorizarlo de una vez: estudia el bloque que corresponde a tu día, produce ejemplos propios y vuelve a él al día siguiente."
      />
      <div className="theory">
        <nav className="toc" aria-label="Índice de teoría">
          <p className="eyebrow">Índice</p>
          <ul>
            {THEORY.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`toc__link ${active === s.id ? 'toc__link--active' : ''}`}
                  onClick={() => setParams({ seccion: s.id }, { replace: true })}
                >
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="theory__content">
          {THEORY.map((section) => (
            <section
              key={section.id}
              id={`teoria-${section.id}`}
              className="module"
              aria-labelledby={`h-${section.id}`}
            >
              <h2 id={`h-${section.id}`}>{section.title}</h2>
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

function Block({ block }: { block: TheoryBlock }) {
  switch (block.type) {
    case 'p':
      return (
        <p>
          <RichText text={block.text} />
        </p>
      );
    case 'h3':
      return <h3>{block.text}</h3>;
    case 'example':
      return (
        <div className="example">
          <div>
            <p lang="en">
              <strong>{block.en}</strong>
            </p>
            {block.es && <p className="muted">{block.es}</p>}
          </div>
          <SpeakButton text={block.en.replace(/·/g, '.')} compact />
        </div>
      );
    case 'rule':
      return (
        <div className="rule">
          <strong>{block.title}</strong>
          <p>
            <RichText text={block.text} />
          </p>
        </div>
      );
    case 'wrong':
      return (
        <div className="wrong">
          <RichText text={block.text} />
        </div>
      );
    case 'cards':
      return (
        <div className="theory-cards">
          {block.cards.map((card) => (
            <div key={card.title} className="theory-card">
              <h3>{card.title}</h3>
              {card.lines.map((line) => (
                <p key={line}>
                  <RichText text={line} />
                </p>
              ))}
            </div>
          ))}
        </div>
      );
    case 'check':
      return (
        <div className="check">
          <strong>{block.title}</strong>
          {block.items && (
            <ol>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          )}
          {block.text && <p>{block.text}</p>}
        </div>
      );
  }
}
