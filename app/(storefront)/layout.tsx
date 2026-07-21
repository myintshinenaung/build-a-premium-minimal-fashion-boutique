import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StorefrontCartShell } from "@/components/cart/StorefrontCartShell";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StorefrontProviders } from "@/components/storefront/StorefrontProviders";
import { getRequestLocale } from "@/lib/i18n/server-locale";
import { buildRootStorefrontMetadata } from "@/lib/storefront/metadata";
import { getSearchIndex } from "@/lib/storefront/search";
import { getStoreSettings } from "@/lib/storefront/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  return buildRootStorefrontMetadata(settings);
}

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const [settings, searchIndex, initialLocale] = await Promise.all([
    getStoreSettings(),
    getSearchIndex(),
    getRequestLocale()
  ]);

  return (
    <StorefrontProviders initialLocale={initialLocale} searchIndex={searchIndex}>
      <StorefrontCartShell>
        <Header storeName={settings.storeName} />
        <main id="main-content">{children}</main>
        <Footer />
      </StorefrontCartShell>
    </StorefrontProviders>
  );
}
