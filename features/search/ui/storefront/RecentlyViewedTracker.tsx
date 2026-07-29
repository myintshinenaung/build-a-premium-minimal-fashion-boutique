"use client";

import { useEffect } from "react";
import { writeRecentlyViewedProduct, type RecentlyViewedProduct } from "@/features/search/infrastructure/recently-viewed";

export function RecentlyViewedTracker(product: RecentlyViewedProduct) {
  useEffect(() => {
    writeRecentlyViewedProduct(product);
  }, [product]);

  return null;
}
