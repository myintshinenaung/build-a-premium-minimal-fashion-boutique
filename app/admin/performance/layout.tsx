import type { ReactNode } from "react";
import { PerformanceSubnav } from "@/features/performance/client";

export default function PerformanceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <PerformanceSubnav />
      {children}
    </div>
  );
}
