import { slugify } from "@/lib/utils";
import { buildVariantsFromProduct, resolveProductStockStatus } from "@/lib/storefront/variants";
import type { AdminCategory, AdminProduct } from "@/types/admin";
import type { Category, Product, ProductColor } from "@/types/product";

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
  Pearl: "#ece6dc",
  Default: "#9a9188"
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

function buildProductTags(product: AdminProduct, categoryName: string) {
  return [
    categoryName,
    product.brand,
    product.categoryId,
    product.sku,
    ...(product.bestSeller ? ["best seller"] : []),
    ...(product.newArrival ? ["new arrival"] : []),
    ...(product.onSale ? ["sale"] : []),
    ...(product.featured ? ["featured"] : [])
  ].filter(Boolean);
}

export function mapAdminProductToProduct(product: AdminProduct, categoryName: string): Product {
  const variants = buildVariantsFromProduct(product);
  const defaultVariant = variants.find((variant) => variant.stockQuantity > 0) ?? variants[0];
  const onSale = product.onSale && Boolean(product.salePriceMmk);

  return {
    id: product.id,
    slug: productSlugFromName(product.name),
    name: product.name,
    sku: product.sku,
    tags: buildProductTags(product, categoryName),
    price: defaultVariant?.price ?? (onSale && product.salePriceMmk ? product.salePriceMmk : product.priceMmk),
    compareAtPrice: defaultVariant?.compareAtPrice ?? (onSale ? product.priceMmk : undefined),
    category: categoryName,
    description: product.description,
    details: [],
    images: product.images.length > 0 ? product.images : [DEFAULT_IMAGE],
    sizes: product.sizes.length > 0 ? product.sizes : ["One Size"],
    colors: mapColors(product.colors.length > 0 ? product.colors : ["Default"]),
    variants,
    stockStatus: resolveProductStockStatus(variants),
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
