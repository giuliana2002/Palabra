import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { SpeakButton } from '@/components/SpeakButton';
import { DAYS } from '@/data';
import { toDayKey } from '@/domain/dates';
import { EXERCISES_PER_DAY } from '@/domain/exercises';
import { dueCards } from '@/domain/srs';
import { currentStreak } from '@/domain/stats';
import { useProgress } from '@/store/progress';

const dateFormat = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export function HomePage() {
  const today = toDayKey();
  const currentDay = useProgress((s) => s.currentDay);
  const answered = useProgress(
    (s) => Object.values(s.results).filter((r) => r.day === s.currentDay).length,
  );
  const due = useProgress((s) => dueCards(Object.values(s.cards), today).length);
  const totalCards = useProgress((s) => Object.keys(s.cards).length);
  const streak = useProgress((s) => currentStreak(s.activity, today));
  const doneToday = useProgress((s) => s.activity[today] ?? 0);
  const goal = useProgress((s) => s.settings.dailyGoal);
  const plan = DAYS[currentDay] ?? DAYS[0]!;
  const goalPercent = Math.min(100, Math.round((doneToday / goal) * 100));

  return (
    <>
      <PageHeader
        eyebrow={capitalize(dateFormat.format(new Date()))}
        title="Tu sesión de hoy"
        lead="Practica la lección del día, repasa lo que toca y habla en voz alta. Diez minutos diarios valen más que dos horas el domingo."
      />

      <section className="dashboard" aria-label="Resumen">
        <article className="panel panel--feature">
          <p className="eyebrow">Continúa la ruta</p>
          <h2 className="panel__title">
            Día {plan.id} · {plan.title}
          </h2>
          <p className="muted">{plan.goal}</p>
          <ProgressBar
            value={answered}
            max={EXERCISES_PER_DAY}
            label={`Progreso del día ${plan.id}`}
          />
          <Link className="button button--primary" to={`/ruta/${plan.id}`}>
            {answered ? 'Seguir practicando' : 'Empezar el día'} <Icon name="arrow" size={18} />
          </Link>
        </article>

        <article className="panel">
          <p className="eyebrow">Repaso espaciado</p>
          <p className="big-number">{due}</p>
          <p className="muted">
            {due === 1 ? 'tarjeta pendiente' : 'tarjetas pendientes'} · {totalCards} en total
          </p>
          <Link className="button button--ghost" to="/repaso">
            {due ? 'Repasar ahora' : 'Ver tarjetas'}
          </Link>
        </article>

        <article className="panel">
          <p className="eyebrow">Objetivo diario</p>
          <div
            className="ring"
            style={{ '--value': goalPercent } as React.CSSProperties}
            role="img"
            aria-label={`${doneToday} de ${goal} actividades hoy`}
          >
            <span>
              {doneToday}
              <small>/{goal}</small>
            </span>
          </div>
          <p className="muted">
            <Icon name="fire" size={16} /> Racha de {streak} {streak === 1 ? 'día' : 'días'}
          </p>
        </article>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Palabras del día {plan.id}</h2>
          <Link to={`/teoria?seccion=${plan.theoryId}`} className="link">
            Teoría: {plan.grammar} →
          </Link>
        </div>
        <ul className="concept-grid">
          {plan.concepts.map((c) => (
            <li key={c.en} className="concept">
              <div>
                <strong lang="en">{c.en}</strong>
                <span>{c.es}</span>
              </div>
              <SpeakButton text={c.en} compact />
            </li>
          ))}
        </ul>
      </section>

      <section className="section how">
        <h2>Cómo funciona</h2>
        <ol className="steps">
          <li>
            <strong>Aprende.</strong> Cada día trae 15 palabras y 90 actividades de seis tipos:
            significado, orden, errores, diálogo, escucha y producción.
          </li>
          <li>
            <strong>Repasa.</strong> Lo que fallas vuelve el mismo día; lo que aciertas, cuando
            estás a punto de olvidarlo (algoritmo SM-2).
          </li>
          <li>
            <strong>Habla.</strong> El reconocimiento de voz compara lo que dices con la frase y te
            dice qué palabras no se entendieron.
          </li>
        </ol>
      </section>
    </>
  );
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
