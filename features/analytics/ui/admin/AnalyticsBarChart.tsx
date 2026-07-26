"use client";

type AnalyticsBarChartProps = {
  items: Array<{ label: string; value: number }>;
  valuePrefix?: string;
};

export function AnalyticsBarChart({ items, valuePrefix = "" }: AnalyticsBarChartProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="text-stone">{item.label}</span>
            <span className="font-medium text-ink">
              {valuePrefix}
              {item.value.toLocaleString()}
            </span>
          </div>
          <div className="h-3 bg-mist">
            <div className="h-3 bg-ink transition-all" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
