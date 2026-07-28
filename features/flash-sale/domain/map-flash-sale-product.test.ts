import { describe, expect, it } from "vitest";
import { applyFlashSaleDiscount } from "@/features/flash-sale/domain/map-flash-sale-product";
import type { Product } from "@/types/product";

const sampleProduct: Product = {
  id: "prd-test",
  slug: "test-product",
  name: "Test Product",
  price: 100000,
  compareAtPrice: 120000,
  category: "Dresses",
  brand: "Daily Outfit",
  description: "",
  details: [],
  images: ["/images/test.png"],
  sizes: ["M"],
  colors: [],
  sku: "TEST-1",
  tags: [],
  variants: [],
  stockStatus: "In stock",
  newArrival: false,
  bestSeller: false
};

describe("applyFlashSaleDiscount", () => {
  it("applies dashboard discount for display without mutating the source id", () => {
    const discounted = applyFlashSaleDiscount(sampleProduct, 20);

    expect(discounted.id).toBe("prd-test");
    expect(discounted.price).toBe(96000);
    expect(discounted.compareAtPrice).toBe(120000);
  });
});
