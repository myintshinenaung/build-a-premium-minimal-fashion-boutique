"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/types/product";
import { useTranslator } from "@/lib/i18n/use-translator";

type ShareProductProps = {
  product: Product;
  storeName: string;
};

export function ShareProduct({ product, storeName }: ShareProductProps) {
  const { t } = useTranslator();
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    const shareData = {
      title: product.name,
      text: `View ${product.name} at ${storeName}.`,
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
      {copied ? t("product.copied") : t("product.share")}
    </button>
  );
}
