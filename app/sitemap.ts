import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/storefront/catalog";
import { getSiteUrl } from "@/lib/storefront/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl().replace(/\/$/, "");
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  const staticRoutes = ["", "/shop", "/categories", "/about", "/contact"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8
  }));

  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7
  }));

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
