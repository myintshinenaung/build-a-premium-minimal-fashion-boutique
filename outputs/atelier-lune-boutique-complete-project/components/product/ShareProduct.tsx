"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/types/product";

type ShareProductProps = {
  product: Product;
};

export function ShareProduct({ product }: ShareProductProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    const shareData = {
      title: product.name,
      text: `View ${product.name} at Atelier Lune.`,
      url
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex h-11 items-center justify-center gap-2 border border-line px-4 text-sm text-ink transition-colors hover:border-ink"
    >
      {copied ? <Check size={17} strokeWidth={1.7} /> : <Share2 size={17} strokeWidth={1.7} />}
      {copied ? "Copied" : "Share Product"}
    </button>
  );
}
