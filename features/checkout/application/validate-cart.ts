import { findProductVariant } from "@/features/catalog/domain/variants";
import { getProducts } from "@/features/catalog/server";
import type { CheckoutCartItemInput } from "@/features/checkout/domain/checkout-schemas";
import { getAvailableStock } from "@/features/inventory/server";

export type ValidatedCartLine = {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  image: string;
  size: string;
  color: string;
  unitPriceMmk: number;
  quantity: number;
  lineTotalMmk: number;
};

export type ValidatedCart = {
  items: ValidatedCartLine[];
  subtotalMmk: number;
};

export class CheckoutValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutValidationError";
  }
}

export async function validateCheckoutCart(items: CheckoutCartItemInput[]): Promise<ValidatedCart> {
  if (items.length === 0) {
    throw new CheckoutValidationError("Your cart is empty.");
  }

  const products = await getProducts();
  const productById = new Map(products.map((product) => [product.id, product]));
  const validatedItems: ValidatedCartLine[] = [];

  for (const item of items) {
    const product = productById.get(item.productId);

    if (!product) {
      throw new CheckoutValidationError("One or more products in your cart are no longer available.");
    }

    const variant = findProductVariant(product, item.size, item.color);

    if (!variant || variant.id !== item.variantId) {
      throw new CheckoutValidationError("A selected size or color is no longer available.");
    }

    const stock = await getAvailableStock(product.id, variant.id);

    if (stock.available <= 0) {
      throw new CheckoutValidationError(`${product.name} is out of stock.`);
    }

    if (item.quantity > stock.available) {
      throw new CheckoutValidationError(`Out of stock: only ${stock.available} left for ${product.name}.`);
    }

    validatedItems.push({
      variantId: variant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      image: product.images[0] ?? "",
      size: variant.size,
      color: variant.color,
      unitPriceMmk: variant.price,
      quantity: item.quantity,
      lineTotalMmk: variant.price * item.quantity
    });
  }

  const subtotalMmk = validatedItems.reduce((total, item) => total + item.lineTotalMmk, 0);

  return {
    items: validatedItems,
    subtotalMmk
  };
}
