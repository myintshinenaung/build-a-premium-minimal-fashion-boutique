import { describe, expect, it } from "vitest";
import { isProductInWishlist, normalizeWishlistProductIds } from "@/features/wishlist/domain/validation";

describe("wishlist validation", () => {
  it("normalizes duplicate product ids", () => {
    expect(normalizeWishlistProductIds([" prod-1 ", "prod-1", "prod-2", ""])).toEqual(["prod-1", "prod-2"]);
  });

  it("detects wishlisted products", () => {
    expect(isProductInWishlist(["prod-1", "prod-2"], "prod-2")).toBe(true);
    expect(isProductInWishlist(["prod-1"], "prod-3")).toBe(false);
  });
});
