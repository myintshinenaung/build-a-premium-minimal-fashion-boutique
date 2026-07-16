import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function SectionHeader({ eyebrow, title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-stone">{eyebrow}</p> : null}
        <h2 className="text-3xl font-medium leading-tight text-ink md:text-4xl">{title}</h2>
        {description ? <p className="mt-4 text-sm leading-6 text-stone md:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
