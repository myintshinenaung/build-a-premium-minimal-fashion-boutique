import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StorefrontCartShell } from "@/features/cart/client";
import { WishlistShell } from "@/features/wishlist/client";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StorefrontProviders } from "@/components/storefront/StorefrontProviders";
import { getSearchIndex } from "@/features/search/server";
import { getRequestLocale } from "@/features/i18n/server";
import { buildRootStorefrontMetadata, getStoreSettings } from "@/features/settings/server";

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
        <WishlistShell>
          <Header storeName={settings.storeName} />
          <main id="main-content">{children}</main>
          <Footer />
        </WishlistShell>
      </StorefrontCartShell>
    </StorefrontProviders>
  );
}
