"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type AnalyticsDateRangeFilterProps = {
  from: string;
  to: string;
  period?: "daily" | "weekly" | "monthly" | "yearly";
  showPeriod?: boolean;
};

export function AnalyticsDateRangeFilter({ from, to, period = "daily", showPeriod = false }: AnalyticsDateRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(next).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 rounded-none border border-line bg-white p-4 md:flex-row md:items-end">
      <label className="grid gap-2 text-sm">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-stone">From</span>
        <input
          type="date"
          value={from}
          onChange={(event) => updateParams({ from: event.target.value })}
          className="h-11 border border-line bg-white px-3 outline-none focus:border-ink"
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-stone">To</span>
        <input
          type="date"
          value={to}
          onChange={(event) => updateParams({ to: event.target.value })}
          className="h-11 border border-line bg-white px-3 outline-none focus:border-ink"
        />
      </label>
      {showPeriod ? (
        <label className="grid gap-2 text-sm">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-stone">Period</span>
          <select
            value={period}
            onChange={(event) => updateParams({ period: event.target.value })}
            className="h-11 border border-line bg-white px-3 outline-none focus:border-ink"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </label>
      ) : null}
      <Link href={pathname} className="inline-flex h-11 items-center justify-center border border-line px-4 text-sm text-ink hover:border-ink">
        Reset
      </Link>
    </div>
  );
}
