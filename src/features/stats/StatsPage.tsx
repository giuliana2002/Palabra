import { BarChart } from '@/components/BarChart';
import { PageHeader } from '@/components/PageHeader';
import { DAYS } from '@/data';
import { fromDayKey, toDayKey } from '@/domain/dates';
import { EXERCISES_PER_DAY } from '@/domain/exercises';
import { isMastered } from '@/domain/srs';
import { accuracyByKind, activitySeries, currentStreak, longestStreak } from '@/domain/stats';
import { KIND_LABELS } from '@/domain/types';
import { useProgress } from '@/store/progress';
import { answeredByDay } from '@/store/selectors';

const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'narrow' });
const longDate = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' });

export function StatsPage() {
  const today = toDayKey();
  const results = useProgress((s) => s.results);
  const activity = useProgress((s) => s.activity);
  const cards = useProgress((s) => s.cards);
  const all = Object.values(results);
  const correct = all.filter((r) => r.ok).length;
  const counts = answeredByDay(results);
  const completedDays = DAYS.filter((d) => (counts.get(d.id) ?? 0) >= EXERCISES_PER_DAY).length;
  const mastered = Object.values(cards).filter(isMastered).length;
  const series = activitySeries(activity, today, 14);
  const byKind = accuracyByKind(all);

  const kpis = [
    { label: 'Racha actual', value: currentStreak(activity, today), unit: 'días' },
    { label: 'Mejor racha', value: longestStreak(activity), unit: 'días' },
    { label: 'Actividades', value: all.length, unit: `de ${DAYS.length * EXERCISES_PER_DAY}` },
    {
      label: 'Aciertos',
      value: all.length ? Math.round((correct / all.length) * 100) : 0,
      unit: '%',
    },
    { label: 'Días completados', value: completedDays, unit: `de ${DAYS.length}` },
    { label: 'Palabras dominadas', value: mastered, unit: `de ${Object.keys(cards).length}` },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Tu progreso"
        title="Estadísticas"
        lead="Lo que no se mide no mejora. Los datos se guardan solo en este navegador."
      />

      <dl className="kpis">
        {kpis.map((k) => (
          <div key={k.label} className="kpi">
            <dt>{k.label}</dt>
            <dd>
              <strong>{k.value}</strong> <span>{k.unit}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="stats-grid">
        <section className="panel">
          <h2 className="panel__title">Actividad · últimos 14 días</h2>
          <BarChart
            bars={series.map((s) => ({
              label: weekday.format(fromDayKey(s.day)),
              value: s.count,
              title: longDate.format(fromDayKey(s.day)),
            }))}
            unit=" actividades"
          />
        </section>

        <section className="panel">
          <h2 className="panel__title">Precisión por tipo de actividad</h2>
          <ul className="hbars">
            {byKind.map((k) => (
              <li key={k.kind}>
                <span className="hbars__label">{KIND_LABELS[k.kind]}</span>
                <span className="hbars__track" aria-hidden="true">
                  <span style={{ width: `${k.accuracy}%` }} />
                </span>
                <span className="hbars__value">{k.total ? `${k.accuracy}%` : '—'}</span>
              </li>
            ))}
          </ul>
          <p className="muted small">Tu punto débil es donde más conviene practicar.</p>
        </section>
      </div>

      <section className="section">
        <h2>Mapa de la ruta</h2>
        <ol className="heatmap" aria-label="Porcentaje completado por día">
          {DAYS.map((d) => {
            const percent = Math.round(((counts.get(d.id) ?? 0) / EXERCISES_PER_DAY) * 100);
            return (
              <li
                key={d.id}
                style={{ '--value': percent } as React.CSSProperties}
                title={`Día ${d.id}: ${percent}%`}
              >
                <span>{d.id}</span>
                <span className="sr-only">: {percent}%</span>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}
