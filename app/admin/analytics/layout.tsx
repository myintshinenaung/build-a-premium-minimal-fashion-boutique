import type { ReactNode } from "react";
import { AnalyticsSubnav } from "@/features/analytics/client";

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <AnalyticsSubnav />
      {children}
    </div>
  );
}
