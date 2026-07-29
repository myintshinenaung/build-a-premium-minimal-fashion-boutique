import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketplaceImage } from "@/components/ui/MarketplaceImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCategories } from "@/features/catalog/server";
import { getTranslator } from "@/features/i18n/server";
import { buildPageMetadata, getStoreSettings } from "@/features/settings/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, { t }] = await Promise.all([getStoreSettings(), getTranslator()]);

  return buildPageMetadata(settings, {
    title: t("categories.eyebrow"),
    description: t("categories.description")
  });
}

export default async function CategoriesPage() {
  const [{ t }, categories] = await Promise.all([getTranslator(), getCategories()]);
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow={t("categories.eyebrow")}
        title={t("categories.title")}
        description={t("categories.description")}
      />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.slug} href={`/categories/${category.slug}`} className="group border border-line bg-white">
            <MarketplaceImage
              src={category.image}
              alt={category.name}
              className="aspect-[4/5]"
              imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.025]"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
            <div className="flex items-end justify-between gap-4 p-5">
              <div>
                <h2 className="text-lg font-medium text-ink">{category.name}</h2>
                <p className="mt-2 text-sm leading-6 text-stone">{category.description}</p>
              </div>
              <ArrowRight className="mb-1 shrink-0 text-ink" size={18} strokeWidth={1.6} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
