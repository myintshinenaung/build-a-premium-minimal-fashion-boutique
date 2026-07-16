import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function AdminPageHeader({ eyebrow = "Admin", title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-stone">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-medium leading-tight text-ink md:text-5xl">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-stone md:text-base">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
