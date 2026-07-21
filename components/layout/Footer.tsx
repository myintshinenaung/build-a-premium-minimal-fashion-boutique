import Link from "next/link";
import { getTranslator } from "@/lib/i18n/server-translator";
import { getCategories } from "@/lib/storefront/catalog";
import { formatStoreAddress } from "@/lib/storefront/contact-links";
import { getStoreSettings } from "@/lib/storefront/settings";

export async function Footer() {
  const { t } = await getTranslator();
  const [categories, settings] = await Promise.all([getCategories(), getStoreSettings()]);
  const addressLines = formatStoreAddress(settings.address);

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.34em] text-ink">
            {settings.storeName}
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-stone">{settings.storeDescription}</p>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.24em] text-ink">{t("footer.shop")}</h2>
          <ul className="mt-5 space-y-3 text-sm text-stone">
            {categories.slice(0, 5).map((category) => (
              <li key={category.slug}>
                <Link className="transition-colors hover:text-ink" href={`/shop?category=${category.name}`}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.24em] text-ink">{t("footer.brand")}</h2>
          <ul className="mt-5 space-y-3 text-sm text-stone">
            <li>
              <Link className="transition-colors hover:text-ink" href="/about">
                {t("nav.about")}
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-ink" href="/contact">
                {t("nav.contact")}
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-ink" href="/shop">
                {t("footer.newArrivals")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.24em] text-ink">{t("footer.visit")}</h2>
          <address className="mt-5 not-italic text-sm leading-6 text-stone">
            {addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            {settings.phone ? <span className="block">{settings.phone}</span> : null}
            {settings.email ? <span className="block">{settings.email}</span> : null}
          </address>
        </div>
      </div>
      <div className="border-t border-line px-4 py-5 text-center text-xs text-stone sm:px-6 lg:px-8">
        {t("footer.rights", { year: new Date().getFullYear(), storeName: settings.storeName })}
      </div>
    </footer>
  );
}
