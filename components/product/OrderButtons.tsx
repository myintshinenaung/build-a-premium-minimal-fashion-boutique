"use client";

import { MessageCircle, Send } from "lucide-react";
import { useMemo } from "react";
import type { Product } from "@/types/product";

type OrderButtonsProps = {
  product: Product;
  messengerUrl: string;
  siteUrl: string;
};

function buildMessengerHref(messengerUrl: string, message: string) {
  if (!messengerUrl.trim()) {
    return "#";
  }

  const separator = messengerUrl.includes("?") ? "&" : "?";
  return `${messengerUrl}${separator}text=${message}`;
}

export function OrderButtons({ product, messengerUrl, siteUrl }: OrderButtonsProps) {
  const { messengerHref, viberHref } = useMemo(() => {
    const url =
      typeof window !== "undefined" ? window.location.href : `${siteUrl.replace(/\/$/, "")}/product/${product.slug}`;
    const message = encodeURIComponent(`Hello, I would like to order ${product.name}. ${url}`);

    return {
      messengerHref: buildMessengerHref(messengerUrl, message),
      viberHref: `viber://forward?text=${message}`
    };
  }, [messengerUrl, product.name, product.slug, siteUrl]);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <a
        href={messengerHref}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-12 items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
      >
        <MessageCircle size={18} strokeWidth={1.7} />
        Messenger Order
      </a>
      <a
        href={viberHref}
        className="inline-flex h-12 items-center justify-center gap-2 border border-ink px-5 text-sm font-medium text-ink transition-colors hover:bg-mist"
      >
        <Send size={18} strokeWidth={1.7} />
        Viber Order
      </a>
    </div>
  );
}
