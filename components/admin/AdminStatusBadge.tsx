import type { AdminStatus } from "@/types/admin";
import { cn } from "@/lib/utils";

type AdminStatusBadgeProps = {
  status: AdminStatus | "Pending" | "Confirmed" | "Packed" | "Completed";
};

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2.5 py-1 text-xs font-medium",
        status === "Published" || status === "Completed"
          ? "border-ink bg-ink text-white"
          : "border-line bg-mist text-stone"
      )}
    >
      {status}
    </span>
  );
}
