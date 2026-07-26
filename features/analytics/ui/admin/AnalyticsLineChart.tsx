"use client";

type AnalyticsLineChartProps = {
  labels: string[];
  values: number[];
  valuePrefix?: string;
};

export function AnalyticsLineChart({ labels, values, valuePrefix = "" }: AnalyticsLineChartProps) {
  const max = Math.max(...values, 1);
  const width = 640;
  const height = 220;
  const padding = 24;
  const points = values.map((value, index) => {
    const x = padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - (value / max) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        <polyline fill="none" stroke="currentColor" strokeWidth="2" className="text-ink" points={points.join(" ")} />
        {values.map((value, index) => {
          const [x, y] = points[index]?.split(",").map(Number) ?? [0, 0];
          return <circle key={labels[index] ?? index} cx={x} cy={y} r="4" className="fill-ink" />;
        })}
      </svg>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {labels.map((label, index) => (
          <div key={label} className="border border-line px-3 py-2 text-sm">
            <p className="text-stone">{label}</p>
            <p className="mt-1 font-medium text-ink">
              {valuePrefix}
              {values[index]?.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
