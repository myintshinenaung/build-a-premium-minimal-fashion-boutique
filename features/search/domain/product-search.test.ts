import { describe, expect, it } from "vitest";
import type { ProductSearchRecord } from "@/features/search/domain/product-search";
import {
  applyProductFilters,
  buildProductSearchPath,
  matchesFullTextSearch,
  paginateProducts,
  runProductSearch,
  sortProducts
} from "@/features/search/domain/product-search";
import { parseProductSearchParams } from "@/features/search/domain/product-search-schemas";

const products: ProductSearchRecord[] = [
  {
    id: "prod-1",
    slug: "silk-slip-dress",
    name: "Silk Slip Dress",
    price: 120000,
    category: "Dresses",
    brand: "Daily Outfit",
    description: "Bias-cut silk dress with adjustable straps.",
    details: [],
    images: ["/images/dress.png"],
    sizes: ["S", "M"],
    colors: [{ name: "Champagne", hex: "#d9cdb8" }],
    sku: "SLP-001",
    tags: ["Dresses", "Daily Outfit"],
    variants: [],
    stockStatus: "In stock",
    newArrival: true,
    bestSeller: false,
    averageRating: 4.8,
    reviewCount: 12
  },
  {
    id: "prod-2",
    slug: "tailored-wool-blazer",
    name: "Tailored Wool Blazer",
    price: 185000,
    category: "Outerwear",
    brand: "Luxe Lane",
    description: "Structured blazer in warm grey wool.",
    details: [],
    images: ["/images/blazer.png"],
    sizes: ["M", "L"],
    colors: [{ name: "Warm Grey", hex: "#9a9188" }],
    sku: "BLZ-014",
    tags: ["Outerwear", "Luxe Lane"],
    variants: [],
    stockStatus: "Sold out",
    newArrival: false,
    bestSeller: true,
    averageRating: 4.2,
    reviewCount: 5
  },
  {
    id: "prod-3",
    slug: "cashmere-knit",
    name: "Cashmere Knit",
    price: 98000,
    category: "Knitwear",
    brand: "Daily Outfit",
    description: "Soft rib knit in natural-toned cashmere.",
    details: [],
    images: ["/images/knit.png"],
    sizes: ["S", "M", "L"],
    colors: [{ name: "Natural", hex: "#eee7dc" }],
    sku: "KNT-008",
    tags: ["Knitwear", "Daily Outfit"],
    variants: [],
    stockStatus: "In stock",
    newArrival: false,
    bestSeller: true,
    averageRating: 3.5,
    reviewCount: 2
  }
];

describe("product search schemas", () => {
  it("parses comma-separated filters and booleans from query params", () => {
    const parsed = parseProductSearchParams({
      q: " silk ",
      category: "Dresses,Knitwear",
      brand: "Daily Outfit",
      minPrice: "90000",
      maxPrice: "150000",
      color: "Champagne",
      size: "M",
      minRating: "4",
      inStock: "true",
      sort: "price-asc",
      page: "2"
    });

    expect(parsed).toMatchObject({
      q: "silk",
      category: ["Dresses", "Knitwear"],
      brand: ["Daily Outfit"],
      minPrice: 90000,
      maxPrice: 150000,
      color: "Champagne",
      size: "M",
      minRating: 4,
      inStock: true,
      sort: "price-asc",
      page: 2
    });
  });
});

describe("product search engine", () => {
  it("matches multi-token full-text search", () => {
    expect(matchesFullTextSearch(products[0], "silk dress")).toBe(true);
    expect(matchesFullTextSearch(products[0], "wool blazer")).toBe(false);
  });

  it("filters by category, brand, price, color, size, rating, and stock", () => {
    const filtered = applyProductFilters(products, {
      q: "",
      category: ["Knitwear"],
      brand: ["Daily Outfit"],
      minPrice: 90000,
      maxPrice: 100000,
      color: "Natural",
      size: "L",
      minRating: 3,
      inStock: true,
      sort: "popularity",
      page: 1,
      pageSize: 8
    });

    expect(filtered.map((product) => product.id)).toEqual(["prod-3"]);
  });

  it("sorts by price and rating", () => {
    expect(sortProducts(products, "price-asc").map((product) => product.id)).toEqual(["prod-3", "prod-1", "prod-2"]);
    expect(sortProducts(products, "rating").map((product) => product.id)).toEqual(["prod-1", "prod-2", "prod-3"]);
  });

  it("paginates results", () => {
    const page = paginateProducts(products, 2, 2);
    expect(page.items).toHaveLength(1);
    expect(page.totalPages).toBe(2);
    expect(page.page).toBe(2);
  });

  it("runs a full search with facets", () => {
    const result = runProductSearch(products, {
      q: "daily",
      category: [],
      brand: [],
      inStock: true,
      sort: "price-desc",
      page: 1,
      pageSize: 8
    });

    expect(result.items.map((product) => product.id)).toEqual(["prod-1", "prod-3"]);
    expect(result.facets.brands).toEqual(["Daily Outfit", "Luxe Lane"]);
    expect(result.total).toBe(2);
  });

  it("builds a shareable shop URL", () => {
    expect(
      buildProductSearchPath({
        q: "silk",
        category: ["Dresses"],
        brand: ["Daily Outfit"],
        minPrice: 100000,
        maxPrice: 200000,
        color: "Champagne",
        size: "M",
        minRating: 4,
        inStock: true,
        sort: "rating",
        page: 2,
        pageSize: 8
      })
    ).toBe(
      "/shop?q=silk&category=Dresses&brand=Daily+Outfit&minPrice=100000&maxPrice=200000&color=Champagne&size=M&minRating=4&inStock=true&sort=rating&page=2"
    );
  });
});

