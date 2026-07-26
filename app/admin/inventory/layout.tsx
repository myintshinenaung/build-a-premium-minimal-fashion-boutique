import type { ReactNode } from "react";
import { InventorySubnav } from "@/features/inventory/client";

export default function InventoryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <InventorySubnav />
      {children}
    </div>
  );
}
