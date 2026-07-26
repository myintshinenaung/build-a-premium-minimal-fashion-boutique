import type { ReactNode } from "react";

type AnalyticsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function AnalyticsSection({ title, description, children }: AnalyticsSectionProps) {
  return (
    <section className="border border-line bg-white">
      <div className="border-b border-line p-5">
        <h2 className="text-lg font-medium text-ink">{title}</h2>
        {description ? <p className="mt-2 text-sm text-stone">{description}</p> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
