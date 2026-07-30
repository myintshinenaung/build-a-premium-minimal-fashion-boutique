"use client";

type AnalyticsPieChartProps = {
  items: Array<{ label: string; value: number }>;
};

const colors = ["#111111", "#6b645c", "#9a9188", "#c8b49a", "#d9cdb8", "#eee7dc"];

export function AnalyticsPieChart({ items }: AnalyticsPieChartProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;

  const segments = items.reduce<
    Array<{ label: string; value: number; start: number; end: number; color: string }>
  >((accumulator, item, index) => {
    const start = accumulator.length > 0 ? accumulator[accumulator.length - 1].end : 0;
    const slice = (item.value / total) * 100;

    accumulator.push({
      ...item,
      start,
      end: start + slice,
      color: colors[index % colors.length]
    });

    return accumulator;
  }, []);

  const gradient = segments.map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`).join(", ");

  return (
    <div className="grid gap-6 lg:grid-cols-[180px_1fr] lg:items-center">
      <div className="mx-auto h-40 w-40 rounded-full" style={{ background: `conic-gradient(${gradient})` }} />
      <div className="space-y-3">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="text-stone">{segment.label}</span>
            </div>
            <span className="font-medium text-ink">{segment.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
