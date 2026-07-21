import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/storefront/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl().replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/admin"]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
