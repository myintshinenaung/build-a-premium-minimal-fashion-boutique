import type { Metadata } from "next";
import type { StorefrontSettings } from "@/types/storefront";
import { getSiteUrl } from "@/lib/storefront/site-url";

export function buildRootStorefrontMetadata(settings: StorefrontSettings): Metadata {
  const siteUrl = getSiteUrl();
  const { storeName, storeDescription } = settings;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${storeName} | NOVORA Marketplace`,
      template: `%s | ${storeName}`
    },
    description: storeDescription,
    keywords: ["NOVORA", "marketplace", "fashion", "Daily Outfit", "online shopping", "Myanmar"],
    openGraph: {
      title: storeName,
      description: storeDescription,
      url: siteUrl,
      siteName: storeName,
      images: [
        {
          url: "/images/hero-boutique.png",
          width: 1920,
          height: 800,
          alt: `${storeName} on NOVORA`
        }
      ],
      locale: "en_US",
      type: "website"
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

type PageMetadataInput = {
  title: string;
  description?: string;
  openGraphImage?: string;
};

export function buildPageMetadata(settings: StorefrontSettings, page: PageMetadataInput): Metadata {
  const description = page.description ?? settings.storeDescription;

  return {
    title: page.title,
    description,
    openGraph: {
      title: `${page.title} | ${settings.storeName}`,
      description,
      ...(page.openGraphImage ? { images: [page.openGraphImage] } : {})
    }
  };
}
