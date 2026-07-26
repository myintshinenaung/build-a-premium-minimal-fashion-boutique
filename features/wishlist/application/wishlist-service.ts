import { getProducts } from "@/features/catalog/server";
import { wishlistItemInputSchema } from "@/features/wishlist/domain/wishlist-schemas";
import { WishlistItemNotFoundError, WishlistValidationError } from "@/features/wishlist/application/wishlist-errors";
import { wishlistRepository } from "@/features/wishlist/infrastructure/wishlist-repository";
import type { WishlistEntry, WishlistItem } from "@/types/wishlist";
import { ZodError } from "zod";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid wishlist request.";
}

async function getPublishedProduct(productId: string) {
  const products = await getProducts();
  return products.find((product) => product.id === productId) ?? null;
}

function parseProductId(input: unknown) {
  try {
    return wishlistItemInputSchema.parse(input).productId;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new WishlistValidationError(formatZodError(error));
    }

    throw error;
  }
}

export async function getWishlist(accountId: string): Promise<WishlistEntry[]> {
  const [items, products] = await Promise.all([wishlistRepository.listByAccountId(accountId), getProducts()]);
  const productById = new Map(products.map((product) => [product.id, product]));

  return items
    .map((item) => {
      const product = productById.get(item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((entry): entry is WishlistEntry => entry !== null);
}

export async function addToWishlist(accountId: string, input: unknown): Promise<WishlistItem> {
  const productId = parseProductId(input);
  const product = await getPublishedProduct(productId);

  if (!product) {
    throw new WishlistValidationError("Product is not available.");
  }

  const existing = await wishlistRepository.getByAccountAndProduct(accountId, productId);

  if (existing) {
    return existing;
  }

  return wishlistRepository.create(accountId, productId);
}

export async function removeFromWishlist(accountId: string, productId: string) {
  const existing = await wishlistRepository.getByAccountAndProduct(accountId, productId);

  if (!existing) {
    throw new WishlistItemNotFoundError("Wishlist item not found.");
  }

  await wishlistRepository.deleteByAccountAndProduct(accountId, productId);

  return { ok: true as const };
}

export async function toggleWishlist(accountId: string, input: unknown) {
  const productId = parseProductId(input);
  const existing = await wishlistRepository.getByAccountAndProduct(accountId, productId);

  if (existing) {
    await wishlistRepository.deleteByAccountAndProduct(accountId, productId);

    return {
      inWishlist: false,
      productId
    };
  }

  const item = await addToWishlist(accountId, { productId });

  return {
    inWishlist: true,
    productId,
    item
  };
}

export async function getWishlistProductIds(accountId: string) {
  const items = await wishlistRepository.listByAccountId(accountId);
  return items.map((item) => item.productId);
}
