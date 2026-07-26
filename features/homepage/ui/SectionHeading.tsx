import Link from "next/link";
import { ChevronRight } from "lucide-react";

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
};

export function SectionHeading({ title, subtitle, actionLabel, actionHref }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3 px-4 sm:px-6 lg:px-8">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-novora-ink sm:text-xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-novora-muted">{subtitle}</p> : null}
      </div>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-novora-accent transition-colors hover:text-novora-ink"
        >
          {actionLabel}
          <ChevronRight size={16} strokeWidth={2} />
        </Link>
      ) : null}
    </div>
  );
}
