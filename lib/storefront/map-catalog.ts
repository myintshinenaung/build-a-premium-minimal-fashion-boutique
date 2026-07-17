import { slugify } from "@/lib/utils";
import type { AdminCategory, AdminProduct } from "@/types/admin";
import type { Category, Product, ProductColor, StockStatus } from "@/types/product";

const COLOR_HEX: Record<string, string> = {
  Ivory: "#eee7dc",
  Black: "#111111",
  "Warm Taupe": "#a89a8b",
  Champagne: "#d9cdb8",
  "Deep Indigo": "#2f3440",
  "Soft White": "#f6f3ef",
  Cognac: "#8b5a3c",
  Sand: "#c8b49a",
  "Warm Grey": "#9a9188",
  Camel: "#b8956b",
  Espresso: "#4a3428",
  Pearl: "#ece6dc"
};

const DEFAULT_IMAGE = "/images/hero-boutique.png";

export function productSlugFromName(name: string) {
  return slugify(name);
}

function mapColors(colorNames: string[]): ProductColor[] {
  return colorNames.map((name) => ({
    name,
    hex: COLOR_HEX[name] ?? "#9a9188"
  }));
}

function resolveStockStatus(product: AdminProduct): StockStatus {
  if (product.stockQuantity <= 0) {
    return "Sold out";
  }

  if (product.stockQuantity <= product.lowStockWarning) {
    return "Low stock";
  }

  return "In stock";
}

export function mapAdminProductToProduct(product: AdminProduct, categoryName: string): Product {
  return {
    slug: productSlugFromName(product.name),
    name: product.name,
    price: product.onSale && product.salePriceMmk ? product.salePriceMmk : product.priceMmk,
    category: categoryName,
    description: product.description,
    details: [],
    images: product.images.length > 0 ? product.images : [DEFAULT_IMAGE],
    sizes: product.sizes,
    colors: mapColors(product.colors),
    stockStatus: resolveStockStatus(product),
    newArrival: product.newArrival,
    bestSeller: product.bestSeller
  };
}

export function mapAdminCategoryToCategory(category: AdminCategory): Category {
  return {
    name: category.name,
    slug: category.slug,
    image: category.image,
    description: category.description
  };
}

export function assignUniqueProductSlugs(products: Product[]) {
  const slugCounts = new Map<string, number>();

  return products.map((product) => {
    const baseSlug = product.slug;
    const seen = slugCounts.get(baseSlug) ?? 0;
    slugCounts.set(baseSlug, seen + 1);

    if (seen === 0) {
      return product;
    }

    return {
      ...product,
      slug: `${baseSlug}-${seen + 1}`
    };
  });
}
