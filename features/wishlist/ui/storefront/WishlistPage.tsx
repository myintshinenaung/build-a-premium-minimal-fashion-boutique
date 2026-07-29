"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MarketplaceImage } from "@/components/ui/MarketplaceImage";
import { findProductVariant, getDefaultVariantSelection } from "@/features/catalog/domain/variants";
import { useCartStore } from "@/features/cart/client";
import { useTranslator } from "@/features/i18n/client";
import { useWishlistStore } from "@/features/wishlist/infrastructure/store";
import type { WishlistEntry } from "@/types/wishlist";
import { cn, formatPrice } from "@/lib/utils";

export function WishlistPage() {
  const { t } = useTranslator();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const removeProductId = useWishlistStore((state) => state.removeProductId);
  const setProductIds = useWishlistStore((state) => state.setProductIds);
  const [entries, setEntries] = useState<WishlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWishlist() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/wishlist");
        const payload = (await response.json()) as { items?: WishlistEntry[]; message?: string };

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setEntries([]);
          setError(payload.message ?? t("wishlist.loginRequired"));
          setProductIds([]);
          return;
        }

        setEntries(payload.items ?? []);
        setProductIds((payload.items ?? []).map((entry) => entry.productId));
      } catch {
        if (!cancelled) {
          setError(t("wishlist.error"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadWishlist();

    return () => {
      cancelled = true;
    };
  }, [setProductIds, t]);

  async function deleteWishlistItem(productId: string) {
    const response = await fetch(`/api/wishlist/${encodeURIComponent(productId)}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      throw new Error(payload.message ?? t("wishlist.error"));
    }

    setEntries((current) => current.filter((entry) => entry.productId !== productId));
    removeProductId(productId);
  }

  async function removeItem(productId: string) {
    setPendingProductId(productId);
    setError("");

    try {
      await deleteWishlistItem(productId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("wishlist.error"));
    } finally {
      setPendingProductId(null);
    }
  }

  async function moveToCart(entry: WishlistEntry) {
    setPendingProductId(entry.productId);
    setError("");

    try {
      const alreadyInCart = cartItems.some((item) => item.productId === entry.productId);

      if (!alreadyInCart) {
        const defaultSelection = getDefaultVariantSelection(entry.product);
        const variant = findProductVariant(entry.product, defaultSelection.size, defaultSelection.color);

        if (!variant || variant.stockQuantity <= 0) {
          setError(t("wishlist.unavailable"));
          return;
        }

        addItem({
          variantId: variant.id,
          productId: entry.product.id,
          productSlug: entry.product.slug,
          productName: entry.product.name,
          image: entry.product.images[0],
          size: variant.size,
          color: variant.color,
          unitPrice: variant.price,
          compareAtPrice: variant.compareAtPrice,
          maxQuantity: variant.stockQuantity,
          quantity: 1
        });
      }

      await deleteWishlistItem(entry.productId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("wishlist.error"));
    } finally {
      setPendingProductId(null);
    }
  }

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeader eyebrow={t("wishlist.eyebrow")} title={t("wishlist.title")} description={t("wishlist.description")} />

      {isLoading ? <p className="mt-10 text-sm text-stone">{t("wishlist.loading")}</p> : null}

      {!isLoading && error ? (
        <div className="mt-10 border border-line bg-white p-8 text-center">
          <p className="text-sm text-stone">{error}</p>
        </div>
      ) : null}

      {!isLoading && !error && entries.length === 0 ? (
        <div className="mt-10 border border-line bg-white p-8 text-center">
          <p className="text-sm text-stone">{t("wishlist.empty")}</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex h-12 items-center justify-center border border-ink px-6 text-sm font-medium text-ink transition-colors hover:bg-mist"
          >
            {t("wishlist.continueShopping")}
          </Link>
        </div>
      ) : null}

      {!isLoading && !error && entries.length > 0 ? (
        <div className="mt-10 grid gap-4">
          {entries.map((entry) => (
            <article key={entry.id} className="grid gap-4 border border-line bg-white p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center">
              <Link href={`/product/${entry.product.slug}`} className="block">
                <MarketplaceImage
                  src={entry.product.images[0]}
                  alt={entry.product.name}
                  className="aspect-[4/5] w-full max-w-[120px]"
                  sizes="120px"
                />
              </Link>

              <div>
                <Link href={`/product/${entry.product.slug}`} className="text-sm font-medium text-ink hover:underline">
                  {entry.product.name}
                </Link>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone">{entry.product.category}</p>
                <p className="mt-3 text-sm text-ink">{formatPrice(entry.product.price)}</p>
              </div>

              <div className="flex flex-wrap gap-2 sm:flex-col">
                <button
                  type="button"
                  onClick={() => void moveToCart(entry)}
                  disabled={pendingProductId === entry.productId}
                  className={cn(
                    "inline-flex h-11 items-center justify-center gap-2 border border-ink px-4 text-sm font-medium text-ink transition-colors hover:bg-mist",
                    pendingProductId === entry.productId ? "cursor-not-allowed opacity-60" : ""
                  )}
                >
                  <ShoppingBag size={16} strokeWidth={1.7} />
                  {t("wishlist.moveToCart")}
                </button>
                <button
                  type="button"
                  onClick={() => void removeItem(entry.productId)}
                  disabled={pendingProductId === entry.productId}
                  className={cn(
                    "inline-flex h-11 items-center justify-center gap-2 border border-line px-4 text-sm text-stone transition-colors hover:border-ink hover:text-ink",
                    pendingProductId === entry.productId ? "cursor-not-allowed opacity-60" : ""
                  )}
                >
                  <Trash2 size={16} strokeWidth={1.7} />
                  {t("wishlist.remove")}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
