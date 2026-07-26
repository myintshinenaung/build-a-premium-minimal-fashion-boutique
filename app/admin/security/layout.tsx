import type { ReactNode } from "react";
import { SecuritySubnav } from "@/features/security/client";

export default function SecurityLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <SecuritySubnav />
      {children}
    </div>
  );
}
