/** Gráfico de barras en SVG accesible: cada barra tiene su valor en texto. */
interface Bar {
  label: string;
  value: number;
  title?: string;
}

export function BarChart({
  bars,
  height = 160,
  unit = '',
}: {
  bars: Bar[];
  height?: number;
  unit?: string;
}) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  const width = 100 / bars.length;
  return (
    <figure className="chart">
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={bars.map((b) => `${b.title ?? b.label}: ${b.value}${unit}`).join(', ')}
      >
        {bars.map((bar, i) => {
          const h = (bar.value / max) * (height - 4);
          return (
            <rect
              key={bar.label + i}
              className={bar.value ? 'chart__bar' : 'chart__bar chart__bar--empty'}
              x={i * width + width * 0.15}
              y={height - Math.max(h, 1.5)}
              width={width * 0.7}
              height={Math.max(h, 1.5)}
              rx={0.8}
            >
              <title>{`${bar.title ?? bar.label}: ${bar.value}${unit}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption
        className="chart__labels"
        style={{ gridTemplateColumns: `repeat(${bars.length}, 1fr)` }}
      >
        {bars.map((bar, i) => (
          <span key={bar.label + i}>{bar.label}</span>
        ))}
      </figcaption>
    </figure>
  );
}
