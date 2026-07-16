import type { ReactNode } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
};

export function AdminPlaceholderPage({ title, description, icon, children }: AdminPlaceholderPageProps) {
  return (
    <section className="space-y-8">
      <AdminPageHeader title={title} description={description} />
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="border border-line bg-white p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mist text-ink">{icon}</div>
          <h2 className="mt-6 text-xl font-medium text-ink">Prepared for integration</h2>
          <p className="mt-3 text-sm leading-6 text-stone">
            This page is intentionally UI-only. It is structured so live records can later be loaded from Supabase without
            changing the surrounding layout.
          </p>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}
