import type { ReactNode } from "react";

type AdminMetricCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
};

export function AdminMetricCard({ label, value, helper, icon }: AdminMetricCardProps) {
  return (
    <article className="border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone">{label}</p>
          <p className="mt-3 text-3xl font-medium text-ink">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mist text-ink">{icon}</div>
      </div>
      <p className="mt-5 text-sm text-stone">{helper}</p>
    </article>
  );
}
