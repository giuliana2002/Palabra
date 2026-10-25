import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { SpeakButton } from '@/components/SpeakButton';
import { DAYS } from '@/data';
import { toDayKey } from '@/domain/dates';
import { EXERCISES_PER_DAY } from '@/domain/exercises';
import { EXAMS } from '@/domain/quiz';
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
  const todaySession = useProgress((s) => s.sessions[today]);
  const exams = useProgress((s) => s.exams);
  const plan = DAYS[currentDay] ?? DAYS[0]!;
  const pendingExam = EXAMS.find((e) => currentDay > e.to && !exams[e.id]?.passed);
  const goalPercent = Math.min(100, Math.round((doneToday / goal) * 100));

  return (
    <>
      <PageHeader
        eyebrow={capitalize(dateFormat.format(new Date()))}
        title="Tu sesión de hoy"
        lead="Practica la lección del día, repasa lo que toca y habla en voz alta. Diez minutos diarios valen más que dos horas el domingo."
      />

      {pendingExam && (
        <div className="callout" role="note">
          <Icon name="check" />
          <p>
            <strong>Has terminado la semana {pendingExam.week}.</strong> Haz el examen para
            comprobar lo que has aprendido: 20 preguntas, unos 10 minutos.
          </p>
          <Link className="button button--primary" to={`/examen/${pendingExam.week}`}>
            Hacer el examen
          </Link>
        </div>
      )}

      <section className="dashboard" aria-label="Resumen">
        <article className="panel panel--feature">
          {todaySession ? (
            <>
              <p className="eyebrow">
                <Icon name="check" size={14} /> Sesión de hoy completada
              </p>
              <h2 className="panel__title">
                Día {todaySession.day} · {todaySession.correct} de {todaySession.total} aciertos
              </h2>
              <p className="muted">
                ¡Buen trabajo! Mañana toca el día {plan.id}: {plan.title}. Si te sobra tiempo, haz
                práctica extra o repasa tus tarjetas.
              </p>
              <ProgressBar
                value={answered}
                max={EXERCISES_PER_DAY}
                label={`Actividades del día ${plan.id}`}
              />
              <div className="panel__actions">
                <Link className="button button--primary" to={`/ruta/${todaySession.day}`}>
                  Práctica extra <Icon name="arrow" size={18} />
                </Link>
                <Link className="link link--light" to="/sesion">
                  Adelantar el día {plan.id}
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">Sesión guiada · unos 25 minutos</p>
              <h2 className="panel__title">
                Día {plan.id} · {plan.title}
              </h2>
              <p className="muted">{plan.goal}</p>
              <ul className="session-steps" aria-label="Pasos de la sesión">
                {plan.id > 0 && <li>Repaso de días anteriores</li>}
                <li>15 palabras nuevas</li>
                <li>12 ejercicios</li>
                <li>Hablar en voz alta</li>
              </ul>
              <div className="panel__actions">
                <Link className="button button--primary" to="/sesion">
                  Empezar la sesión <Icon name="arrow" size={18} />
                </Link>
                <Link className="link link--light" to={`/ruta/${plan.id}`}>
                  o haz las 90 actividades por tu cuenta
                </Link>
              </div>
            </>
          )}
        </article>

        <article className="panel">
          <p className="eyebrow">Repaso espaciado</p>
          <p className="big-number">{due}</p>
          <p className="muted">
            {due === 1 ? 'tarjeta pendiente' : 'tarjetas pendientes'} · {totalCards} en total
          </p>
          <Link className="button button--ghost" to="/repaso">
            {due ? 'Repasar ahora' : 'Test de repaso'}
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
            <strong>Una sesión al día.</strong> Unos 25 minutos guiados: repaso, palabras nuevas,
            ejercicios de seis tipos y hablar en voz alta. Al terminar, avanzas al día siguiente.
          </li>
          <li>
            <strong>Repaso que no olvida.</strong> El test diario pregunta vocabulario de días
            anteriores: lo que fallas vuelve mañana; lo que aciertas, cuando estás a punto de
            olvidarlo (algoritmo SM-2).
          </li>
          <li>
            <strong>Un examen por semana.</strong> Los días 7, 14, 21 y 30 compruebas lo aprendido
            con 20 preguntas nuevas y ves tus puntos débiles por habilidad.
          </li>
        </ol>
      </section>
    </>
  );
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
