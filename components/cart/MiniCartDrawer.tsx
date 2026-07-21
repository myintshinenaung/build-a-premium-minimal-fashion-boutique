"use client";

import Link from "next/link";
import { useEffect } from "react";
import { X } from "lucide-react";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { selectCartSubtotal, useCartStore } from "@/lib/storefront/cart/store";
import { useTranslator } from "@/lib/i18n/use-translator";
import { cn, formatPrice } from "@/lib/utils";

export function MiniCartDrawer() {
  const { t } = useTranslator();
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const subtotal = selectCartSubtotal(items);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeCart();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeCart, isOpen]);

  return (
    <>
      <button
        type="button"
        aria-label={t("common.close")}
        onClick={closeCart}
        className={cn(
          "fixed inset-0 z-[60] bg-ink/20 transition-opacity duration-300",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        aria-hidden={!isOpen}
        aria-label={t("cart.title")}
        className={cn(
          "fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col bg-white shadow-soft transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone">{t("cart.yourBag")}</p>
            <h2 className="mt-1 text-xl font-medium text-ink">{t("cart.title")}</h2>
          </div>
          <button
            type="button"
            aria-label={t("cart.close")}
            onClick={closeCart}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
          >
            <X size={18} strokeWidth={1.7} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-stone">{t("cart.empty")}</p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-6 inline-flex h-11 items-center justify-center border border-ink px-5 text-sm font-medium text-ink transition-colors hover:bg-mist"
              >
                {t("cart.continueShopping")}
              </button>
            </div>
          ) : (
            items.map((item) => <CartLineItem key={item.lineKey} item={item} />)
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-line px-5 py-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-stone">{t("cart.subtotal")}</span>
              <span className="text-lg font-medium text-ink">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-2 text-xs text-stone">{t("cart.shippingNote")}</p>
            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={closeCart}
                className="inline-flex h-12 items-center justify-center border border-ink px-5 text-sm font-medium text-ink transition-colors hover:bg-mist"
              >
                {t("cart.continueShopping")}
              </button>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="inline-flex h-12 items-center justify-center bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
              >
                {t("cart.checkout")}
              </Link>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
