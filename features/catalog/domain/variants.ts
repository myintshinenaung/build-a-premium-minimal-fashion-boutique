import type { AdminProduct } from "@/types/admin";
import type { Product, ProductVariant, StockStatus } from "@/types/product";

const SIZE_PREMIUM_SIZES = new Set(["XL", "XXL"]);
const SIZE_PREMIUM_RATE = 0.05;

function resolveVariantStockStatus(stockQuantity: number, lowStockWarning: number): StockStatus {
  if (stockQuantity <= 0) {
    return "Sold out";
  }

  if (stockQuantity <= lowStockWarning) {
    return "Low stock";
  }

  return "In stock";
}

function resolveProductStockStatus(variants: ProductVariant[]): StockStatus {
  const inStockVariants = variants.filter((variant) => variant.stockQuantity > 0);

  if (inStockVariants.length === 0) {
    return "Sold out";
  }

  if (inStockVariants.every((variant) => variant.stockStatus === "Low stock")) {
    return "Low stock";
  }

  return "In stock";
}

function combinationHash(productId: string, size: string, color: string) {
  return `${productId}:${size}:${color}`
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);
}

function isCombinationEnabled(productId: string, size: string, color: string, index: number) {
  if (index === 0) {
    return true;
  }

  return combinationHash(productId, size, color) % 9 !== 0;
}

function distributeStock(totalStock: number, enabledCount: number, index: number) {
  if (totalStock <= 0 || enabledCount <= 0) {
    return 0;
  }

  const base = Math.floor(totalStock / enabledCount);
  const remainder = totalStock % enabledCount;

  return base + (index < remainder ? 1 : 0);
}

function resolveVariantPrice(product: AdminProduct, size: string) {
  const sizePremium = SIZE_PREMIUM_SIZES.has(size) ? Math.round(product.priceMmk * SIZE_PREMIUM_RATE) : 0;
  const basePrice = product.priceMmk + sizePremium;
  const salePrice =
    product.onSale && product.salePriceMmk ? product.salePriceMmk + sizePremium : undefined;

  return {
    price: salePrice ?? basePrice,
    compareAtPrice: salePrice ? basePrice : sizePremium > 0 ? basePrice : undefined
  };
}

export function buildVariantsFromProduct(product: AdminProduct): ProductVariant[] {
  const sizes = product.sizes.length > 0 ? product.sizes : ["One Size"];
  const colors = product.colors.length > 0 ? product.colors : ["Default"];
  const combinations = sizes.flatMap((size) => colors.map((color) => ({ size, color })));

  const enabledCombinations = combinations
    .map((combination, index) => ({ ...combination, index }))
    .filter(({ size, color, index }) => isCombinationEnabled(product.id, size, color, index));

  let enabledIndex = 0;

  return combinations.map(({ size, color }, index) => {
    const enabled = isCombinationEnabled(product.id, size, color, index);
    const stockQuantity = enabled
      ? distributeStock(product.stockQuantity, enabledCombinations.length, enabledIndex++)
      : 0;
    const pricing = resolveVariantPrice(product, size);

    return {
      id: `${product.id}:${size}:${color}`,
      productId: product.id,
      size,
      color,
      sku: `${product.sku}-${size}-${color}`.replace(/\s+/g, ""),
      price: pricing.price,
      compareAtPrice: pricing.compareAtPrice,
      stockQuantity,
      stockStatus: resolveVariantStockStatus(stockQuantity, product.lowStockWarning)
    };
  });
}

export function findProductVariant(product: Product, size?: string, color?: string) {
  if (!size || !color) {
    return null;
  }

  return product.variants.find((variant) => variant.size === size && variant.color === color) ?? null;
}

export function getAvailableSizes(product: Product, color?: string) {
  const variants = color
    ? product.variants.filter((variant) => variant.color === color)
    : product.variants;

  return product.sizes.filter((size) => variants.some((variant) => variant.size === size && variant.stockQuantity > 0));
}

export function getAvailableColors(product: Product, size?: string) {
  const variants = size ? product.variants.filter((variant) => variant.size === size) : product.variants;

  return product.colors.filter((color) =>
    variants.some((variant) => variant.color === color.name && variant.stockQuantity > 0)
  );
}

export function isVariantAvailable(product: Product, size: string, color: string) {
  const variant = findProductVariant(product, size, color);
  return Boolean(variant && variant.stockQuantity > 0);
}

export function isSizeSelectable(product: Product, size: string, color?: string) {
  if (color) {
    const variant = findProductVariant(product, size, color);
    return Boolean(variant && variant.stockQuantity > 0);
  }

  return product.variants.some((variant) => variant.size === size && variant.stockQuantity > 0);
}

export function isColorSelectable(product: Product, color: string, size?: string) {
  if (size) {
    const variant = findProductVariant(product, size, color);
    return Boolean(variant && variant.stockQuantity > 0);
  }

  return product.variants.some((variant) => variant.color === color && variant.stockQuantity > 0);
}

export function getDefaultVariantSelection(product: Product) {
  const firstAvailable =
    product.variants.find((variant) => variant.stockQuantity > 0) ??
    product.variants[0] ??
    null;

  if (!firstAvailable) {
    return { size: undefined, color: undefined, variant: null };
  }

  return {
    size: firstAvailable.size,
    color: firstAvailable.color,
    variant: firstAvailable
  };
}

export { resolveProductStockStatus };
