import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { BANKS, DAYS } from '@/data';
import { buildExam, EXAM_SIZE, EXAMS, PASS_MARK, scoreQuiz, type QuizScore } from '@/domain/quiz';
import { QuizResult } from '@/features/quiz/QuizResult';
import { QuizRunner } from '@/features/quiz/QuizRunner';
import { useProgress } from '@/store/progress';

type Phase = 'intro' | 'running' | 'done';

export function ExamPage() {
  const { week } = useParams();
  const exam = EXAMS.find((e) => e.week === Number(week));
  const record = useProgress((s) => (exam ? s.exams[exam.id] : undefined));
  const recordExam = useProgress((s) => s.recordExam);
  const [phase, setPhase] = useState<Phase>('intro');
  const [score, setScore] = useState<QuizScore | null>(null);
  const attempt = record?.attempts ?? 0;
  const questions = useMemo(
    () => (exam ? buildExam(exam, DAYS, BANKS, attempt) : []),
    [exam, attempt],
  );

  if (!exam) return <Navigate to="/ruta" replace />;
  const covered = DAYS.filter((d) => d.id >= exam.from && d.id <= exam.to);
  const nextExam = EXAMS.find((e) => e.week === exam.week + 1);

  return (
    <>
      <PageHeader
        eyebrow={`Días ${exam.from}–${exam.to}`}
        title={exam.title}
        lead={
          phase === 'intro'
            ? `${EXAM_SIZE} preguntas nuevas sobre vocabulario, gramática, escucha y comunicación. Se aprueba con un ${PASS_MARK} %. Unos 10 minutos.`
            : undefined
        }
      />

      {phase === 'intro' && (
        <section className="exam-intro">
          <div className="panel">
            <h2 className="panel__title">Qué entra</h2>
            <ul className="exam-intro__days">
              {covered.map((d) => (
                <li key={d.id}>
                  <span className="muted">Día {d.id}</span> {d.title}
                </li>
              ))}
            </ul>
          </div>
          <div className="panel">
            <h2 className="panel__title">Tu resultado</h2>
            {record ? (
              <>
                <p className="big-number">{record.best}%</p>
                <p className="muted">
                  Mejor nota · {record.attempts} {record.attempts === 1 ? 'intento' : 'intentos'}{' '}
                  {record.passed && <span className="tag tag--ok">aprobado</span>}
                </p>
              </>
            ) : (
              <p className="muted">
                Todavía no lo has hecho. Cada intento trae preguntas distintas.
              </p>
            )}
            <button
              type="button"
              className="button button--primary"
              onClick={() => setPhase('running')}
            >
              {record ? 'Repetir examen' : 'Empezar examen'} <Icon name="arrow" size={18} />
            </button>
          </div>
        </section>
      )}

      {phase === 'running' && (
        <QuizRunner
          questions={questions}
          label={`Progreso del ${exam.title.toLowerCase()}`}
          onFinish={(answers) => {
            const result = scoreQuiz(questions, answers);
            const failed = result.failed.flatMap((q) => (q.concept ? [q.concept] : []));
            recordExam(exam.id, result.percent, result.passed, failed);
            setScore(result);
            setPhase('done');
          }}
        />
      )}

      {phase === 'done' && score && (
        <QuizResult
          score={score}
          title={score.passed ? '¡Aprobado!' : 'Todavía no'}
          message={
            score.passed
              ? 'Las palabras que has fallado ya están en tu repaso de hoy.'
              : `Necesitas un ${PASS_MARK} %. Repasa tus puntos débiles y vuelve a intentarlo: las preguntas cambiarán.`
          }
          actions={
            <>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setPhase('intro')}
              >
                Repetir
              </button>
              <Link className="button button--ghost" to="/repaso">
                Ir al repaso
              </Link>
              {score.passed && nextExam ? (
                <Link className="button button--primary" to={`/ruta/${exam.to + 1}`}>
                  Seguir con el día {exam.to + 1} <Icon name="arrow" size={18} />
                </Link>
              ) : (
                <Link className="button button--primary" to="/ruta">
                  Volver a la ruta
                </Link>
              )}
            </>
          }
        />
      )}
    </>
  );
}
