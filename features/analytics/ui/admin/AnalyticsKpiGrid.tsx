import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import type { ReactNode } from "react";

type AnalyticsKpi = {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
};

type AnalyticsKpiGridProps = {
  items: AnalyticsKpi[];
};

export function AnalyticsKpiGrid({ items }: AnalyticsKpiGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <AdminMetricCard key={item.label} label={item.label} value={item.value} helper={item.helper} icon={item.icon} />
      ))}
    </div>
  );
}
