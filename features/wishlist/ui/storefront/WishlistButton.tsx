"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { isWishlisted, useWishlistStore } from "@/features/wishlist/infrastructure/store";
import { useTranslator } from "@/features/i18n/client";
import { cn } from "@/lib/utils";

type WishlistButtonProps = {
  productId: string;
  className?: string;
  compact?: boolean;
};

export function WishlistButton({ productId, className, compact = false }: WishlistButtonProps) {
  const { t } = useTranslator();
  const productIds = useWishlistStore((state) => state.productIds);
  const addProductId = useWishlistStore((state) => state.addProductId);
  const removeProductId = useWishlistStore((state) => state.removeProductId);
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const active = isWishlisted(productIds, productId);

  async function handleToggle(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isPending) {
      return;
    }

    setIsPending(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ productId })
      });
      const payload = (await response.json()) as { inWishlist?: boolean; message?: string };

      if (!response.ok) {
        setFeedback(payload.message ?? t("wishlist.loginRequired"));
        window.setTimeout(() => setFeedback(null), 2200);
        return;
      }

      if (payload.inWishlist) {
        addProductId(productId);
        setFeedback(t("wishlist.added"));
      } else {
        removeProductId(productId);
        setFeedback(t("wishlist.removed"));
      }

      window.setTimeout(() => setFeedback(null), 1800);
    } catch {
      setFeedback(t("wishlist.error"));
      window.setTimeout(() => setFeedback(null), 2200);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={(event) => void handleToggle(event)}
        disabled={isPending}
        aria-pressed={active}
        aria-label={active ? t("wishlist.removeFromWishlist") : t("wishlist.addToWishlist")}
        className={cn(
          "inline-flex items-center justify-center rounded-full border border-line bg-white/95 text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-60",
          compact ? "h-9 w-9" : "h-11 w-11"
        )}
      >
        <Heart size={compact ? 16 : 18} strokeWidth={1.7} className={cn(active ? "fill-ink text-ink" : "")} />
      </button>
      {feedback ? <span className="sr-only">{feedback}</span> : null}
    </div>
  );
}
