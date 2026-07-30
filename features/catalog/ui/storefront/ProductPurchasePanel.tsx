"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { QuantitySelector } from "@/features/catalog/ui/storefront/QuantitySelector";
import { ShareProduct } from "@/features/catalog/ui/storefront/ShareProduct";
import { StockStatusBadge } from "@/features/catalog/ui/storefront/StockStatusBadge";
import { VariantSelectors } from "@/features/catalog/ui/storefront/VariantSelectors";
import { useCartStore } from "@/features/cart/client";
import { isWishlisted, useWishlistStore } from "@/features/wishlist/client";
import { useTranslator } from "@/features/i18n/client";
import {
  findProductVariant,
  getAvailableSizes,
  getDefaultVariantSelection,
  isColorSelectable,
  isSizeSelectable
} from "@/features/catalog/domain/variants";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";

type ProductPurchasePanelProps = {
  product: Product;
  storeName: string;
  categoryHref: string;
};

export function ProductPurchasePanel({ product, storeName, categoryHref }: ProductPurchasePanelProps) {
  const { t } = useTranslator();
  const addItem = useCartStore((state) => state.addItem);
  const productIds = useWishlistStore((state) => state.productIds);
  const removeProductId = useWishlistStore((state) => state.removeProductId);
  const addProductId = useWishlistStore((state) => state.addProductId);
  const defaultSelection = useMemo(() => getDefaultVariantSelection(product), [product]);
  const [selectedSize, setSelectedSize] = useState(defaultSelection.size);
  const [selectedColor, setSelectedColor] = useState(defaultSelection.color);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isWishlistPending, setIsWishlistPending] = useState(false);
  const wishlisted = isWishlisted(productIds, product.id);

  const selectedVariant = useMemo(
    () => findProductVariant(product, selectedSize, selectedColor),
    [product, selectedColor, selectedSize]
  );
  const selectionKey = `${product.id}:${defaultSelection.size}:${defaultSelection.color}`;
  const [prevSelectionKey, setPrevSelectionKey] = useState(selectionKey);

  if (selectionKey !== prevSelectionKey) {
    setPrevSelectionKey(selectionKey);
    setSelectedSize(defaultSelection.size);
    setSelectedColor(defaultSelection.color);
    setQuantity(1);
  }

  if (selectedVariant && selectedVariant.stockQuantity > 0 && quantity > selectedVariant.stockQuantity) {
    setQuantity(selectedVariant.stockQuantity);
  }

  function handleSizeChange(size: string) {
    setSelectedSize(size);

    if (selectedColor && !isSizeSelectable(product, size, selectedColor)) {
      const nextColor = product.colors.find((color) => isColorSelectable(product, color.name, size))?.name;
      setSelectedColor(nextColor);
    }
  }

  function handleColorChange(color: string) {
    setSelectedColor(color);

    if (selectedSize && !isColorSelectable(product, color, selectedSize)) {
      const nextSize = getAvailableSizes(product, color)[0];
      setSelectedSize(nextSize);
    }
  }

  function handleAddToCart() {
    if (!selectedVariant || selectedVariant.stockQuantity <= 0) {
      setFeedback(t("product.selectVariant"));
      return;
    }

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      image: product.images[0],
      size: selectedVariant.size,
      color: selectedVariant.color,
      unitPrice: selectedVariant.price,
      compareAtPrice: selectedVariant.compareAtPrice,
      maxQuantity: selectedVariant.stockQuantity,
      quantity
    });

    if (wishlisted) {
      void fetch(`/api/wishlist/${encodeURIComponent(product.id)}`, { method: "DELETE" })
        .then((response) => {
          if (response.ok) {
            removeProductId(product.id);
          }
        })
        .catch(() => undefined);
    }

    setFeedback(t("product.addedToCart"));
    window.setTimeout(() => setFeedback(null), 1800);
  }

  async function handleToggleWishlist() {
    if (isWishlistPending) {
      return;
    }

    setIsWishlistPending(true);

    try {
      const response = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ productId: product.id })
      });
      const payload = (await response.json()) as { inWishlist?: boolean; message?: string };

      if (!response.ok) {
        setFeedback(payload.message ?? t("wishlist.loginRequired"));
        window.setTimeout(() => setFeedback(null), 2200);
        return;
      }

      if (payload.inWishlist) {
        addProductId(product.id);
        setFeedback(t("wishlist.added"));
      } else {
        removeProductId(product.id);
        setFeedback(t("wishlist.removed"));
      }

      window.setTimeout(() => setFeedback(null), 1800);
    } catch {
      setFeedback(t("wishlist.error"));
      window.setTimeout(() => setFeedback(null), 2200);
    } finally {
      setIsWishlistPending(false);
    }
  }

  const displayPrice = selectedVariant?.price ?? product.price;
  const displayCompareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const canAddToCart = Boolean(selectedVariant && selectedVariant.stockQuantity > 0);

  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <div className="mb-6 flex items-center gap-2 text-sm text-stone">
        <Link href="/shop" className="underline underline-offset-8">
          {t("nav.shop")}
        </Link>
        <span>/</span>
        <Link href={categoryHref} className="underline underline-offset-8">
          {product.category}
        </Link>
      </div>

      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone">{product.category}</p>
          <h1 className="mt-3 text-3xl font-medium leading-tight text-ink md:text-5xl">{product.name}</h1>
        </div>
        <div className="flex items-start gap-3 pt-2">
          <button
            type="button"
            onClick={() => void handleToggleWishlist()}
            disabled={isWishlistPending}
            aria-pressed={wishlisted}
            aria-label={wishlisted ? t("wishlist.removeFromWishlist") : t("wishlist.addToWishlist")}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-60",
              wishlisted ? "border-ink" : ""
            )}
          >
            <Heart size={18} strokeWidth={1.7} className={cn(wishlisted ? "fill-ink text-ink" : "")} />
          </button>
          <div className="text-right">
            <p className="text-lg text-ink">{formatPrice(displayPrice)}</p>
            {displayCompareAtPrice && displayCompareAtPrice > displayPrice ? (
              <p className="text-sm text-stone line-through">{formatPrice(displayCompareAtPrice)}</p>
            ) : null}
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm leading-7 text-stone md:text-base">{product.description}</p>

      <div className="mt-8 border-y border-line py-6">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-stone">{t("product.stockStatus")}</span>
          <StockStatusBadge status={selectedVariant?.stockStatus ?? product.stockStatus} />
        </div>
        {selectedVariant ? (
          <p className="mt-3 text-xs text-stone">
            {selectedVariant.stockQuantity > 0
              ? t("product.availableIn", {
                  count: selectedVariant.stockQuantity,
                  size: selectedVariant.size,
                  color: selectedVariant.color
                })
              : t("product.unavailableCombination")}
          </p>
        ) : null}
      </div>

      <div className="mt-8">
        <VariantSelectors
          product={product}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          onSizeChange={handleSizeChange}
          onColorChange={handleColorChange}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-ink">{t("product.quantity")}</h2>
        <div className="mt-4">
          <QuantitySelector
            value={quantity}
            max={selectedVariant?.stockQuantity ?? 1}
            onChange={setQuantity}
            disabled={!canAddToCart}
          />
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          className={cn(
            "inline-flex h-12 w-full items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors",
            canAddToCart ? "hover:bg-stone" : "cursor-not-allowed bg-stone/40"
          )}
        >
          <ShoppingBag size={18} strokeWidth={1.7} />
          {t("product.addToCart")}
        </button>
        {feedback ? <p className="text-sm text-stone">{feedback}</p> : null}
      </div>

      <div className="mt-4">
        <ShareProduct product={product} storeName={storeName} />
      </div>

      {product.details.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-ink">{t("product.description")}</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-stone">
            {product.details.map((detail) => (
              <li key={detail} className="border-b border-line pb-3">
                {detail}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
