import { cn } from "@/lib/utils";
import type { StockStatus } from "@/types/product";

const statusStyles: Record<StockStatus, string> = {
  "In stock": "text-ink",
  "Low stock": "text-clay",
  "Made to order": "text-stone",
  "Sold out": "text-stone line-through"
};

type StockStatusBadgeProps = {
  status: StockStatus;
  className?: string;
};

export function StockStatusBadge({ status, className }: StockStatusBadgeProps) {
  return <span className={cn("text-sm font-medium", statusStyles[status], className)}>{status}</span>;
}
