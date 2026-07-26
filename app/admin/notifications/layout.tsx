import type { ReactNode } from "react";
import { NotificationsSubnav } from "@/features/notifications/client";

export default function NotificationsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <NotificationsSubnav />
      {children}
    </div>
  );
}
