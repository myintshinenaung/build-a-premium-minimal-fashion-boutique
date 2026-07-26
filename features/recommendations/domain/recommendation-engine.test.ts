import { describe, expect, it } from "vitest";
import type { RecommendationRecord } from "@/features/recommendations/domain/recommendation-engine";
import {
  getBestSellerProducts,
  getNewArrivalProducts,
  getRelatedProducts,
  getSimilarProducts,
  getTrendingProducts,
  runRecommendationEngine
} from "@/features/recommendations/domain/recommendation-engine";
import { parseRecommendationQuery } from "@/features/recommendations/domain/recommendation-schemas";

const products: RecommendationRecord[] = [
  {
    id: "prod-1",
    slug: "silk-slip-dress",
    name: "Silk Slip Dress",
    price: 120000,
    category: "Dresses",
    brand: "Atelier Lune",
    description: "Bias-cut silk dress.",
    details: [],
    images: ["/images/dress.png"],
    sizes: ["S", "M"],
    colors: [{ name: "Champagne", hex: "#d9cdb8" }],
    sku: "SLP-001",
    tags: ["Dresses", "Atelier Lune", "best seller"],
    variants: [],
    stockStatus: "In stock",
    newArrival: true,
    bestSeller: true,
    averageRating: 4.8,
    reviewCount: 12
  },
  {
    id: "prod-2",
    slug: "tailored-wool-blazer",
    name: "Tailored Wool Blazer",
    price: 185000,
    category: "Outerwear",
    brand: "Maison Noir",
    description: "Structured blazer.",
    details: [],
    images: ["/images/blazer.png"],
    sizes: ["M", "L"],
    colors: [{ name: "Warm Grey", hex: "#9a9188" }],
    sku: "BLZ-014",
    tags: ["Outerwear", "Maison Noir"],
    variants: [],
    stockStatus: "Sold out",
    newArrival: false,
    bestSeller: true,
    averageRating: 4.2,
    reviewCount: 5
  },
  {
    id: "prod-3",
    slug: "satin-midi-dress",
    name: "Satin Midi Dress",
    price: 128000,
    category: "Dresses",
    brand: "Atelier Lune",
    description: "Fluid satin midi dress.",
    details: [],
    images: ["/images/satin-dress.png"],
    sizes: ["S", "M"],
    colors: [{ name: "Champagne", hex: "#d9cdb8" }],
    sku: "SAT-002",
    tags: ["Dresses", "Atelier Lune", "new arrival"],
    variants: [],
    stockStatus: "In stock",
    newArrival: true,
    bestSeller: false,
    averageRating: 4.5,
    reviewCount: 3
  },
  {
    id: "prod-4",
    slug: "cashmere-knit",
    name: "Cashmere Knit",
    price: 98000,
    category: "Knitwear",
    brand: "Atelier Lune",
    description: "Soft rib knit.",
    details: [],
    images: ["/images/knit.png"],
    sizes: ["S", "M", "L"],
    colors: [{ name: "Ivory", hex: "#eee7dc" }],
    sku: "KNT-008",
    tags: ["Knitwear", "Atelier Lune"],
    variants: [],
    stockStatus: "In stock",
    newArrival: false,
    bestSeller: false,
    averageRating: 3.5,
    reviewCount: 2
  }
];

describe("recommendation schemas", () => {
  it("requires productId for related and similar recommendations", () => {
    expect(() => parseRecommendationQuery({ type: "related" })).toThrow();
    expect(parseRecommendationQuery({ type: "trending", limit: "6" })).toMatchObject({
      type: "trending",
      limit: 6
    });
  });
});

describe("recommendation engine", () => {
  it("ranks related products by category and brand affinity", () => {
    expect(getRelatedProducts(products, "prod-1", 2).map((product) => product.id)).toEqual(["prod-3", "prod-4"]);
  });

  it("ranks similar products by brand and tag overlap", () => {
    expect(getSimilarProducts(products, "prod-1", 2).map((product) => product.id)).toEqual(["prod-3", "prod-4"]);
  });

  it("ranks trending products by popularity signals", () => {
    expect(getTrendingProducts(products, 3, "prod-1").map((product) => product.id)).toEqual(["prod-3", "prod-2", "prod-4"]);
  });

  it("returns best sellers and new arrivals", () => {
    expect(getBestSellerProducts(products, 2).map((product) => product.id)).toEqual(["prod-1", "prod-2"]);
    expect(getNewArrivalProducts(products, 2).map((product) => product.id)).toEqual(["prod-1", "prod-3"]);
  });

  it("runs the recommendation engine by type", () => {
    expect(runRecommendationEngine(products, "related", { productId: "prod-1", limit: 1 }).map((product) => product.id)).toEqual([
      "prod-3"
    ]);
  });
});
