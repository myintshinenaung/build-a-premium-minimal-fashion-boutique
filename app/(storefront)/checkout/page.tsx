import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getTranslator } from "@/lib/i18n/server-translator";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const { t } = await getTranslator();

  return (
    <section className="mx-auto max-w-[720px] px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader eyebrow={t("checkout.eyebrow")} title={t("checkout.title")} description={t("checkout.description")} />
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="inline-flex h-12 items-center justify-center border border-ink px-6 text-sm font-medium text-ink transition-colors hover:bg-mist"
        >
          {t("checkout.continueShopping")}
        </Link>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center bg-ink px-6 text-sm font-medium text-white transition-colors hover:bg-stone"
        >
          {t("checkout.backHome")}
        </Link>
      </div>
    </section>
  );
}
