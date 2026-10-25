import type { ReactNode } from 'react';
import { SKILL_LABELS, type QuizScore } from '@/domain/quiz';

interface Props {
  score: QuizScore;
  title: string;
  message: string;
  actions?: ReactNode;
  showSkills?: boolean;
}

export function QuizResult({ score, title, message, actions, showSkills = true }: Props) {
  const words = score.failed.filter((q) => q.concept).map((q) => q.concept!);
  return (
    <section className="result" aria-labelledby="result-title">
      <div className="result__head">
        <div
          className={`ring ring--large ${score.passed ? '' : 'ring--warn'}`}
          style={{ '--value': score.percent } as React.CSSProperties}
          role="img"
          aria-label={`${score.percent}% de aciertos`}
        >
          <span>{score.percent}%</span>
        </div>
        <div>
          <h2 id="result-title">{title}</h2>
          <p className="muted">
            {score.correct} de {score.total} respuestas correctas. {message}
          </p>
        </div>
      </div>

      {showSkills && score.bySkill.length > 1 && (
        <ul className="hbars">
          {score.bySkill.map((s) => (
            <li key={s.skill}>
              <span className="hbars__label">{SKILL_LABELS[s.skill]}</span>
              <span className="hbars__track" aria-hidden="true">
                <span style={{ width: `${s.percent}%` }} />
              </span>
              <span className="hbars__value">
                {s.correct}/{s.total}
              </span>
            </li>
          ))}
        </ul>
      )}

      {words.length > 0 && (
        <div className="result__words">
          <p className="eyebrow">Para repasar</p>
          <ul className="tags">
            {words.map((c) => (
              <li key={c.en}>
                <strong lang="en">{c.en}</strong> · {c.es}
              </li>
            ))}
          </ul>
        </div>
      )}
      {actions && <div className="task__actions task__actions--start">{actions}</div>}
    </section>
  );
}
