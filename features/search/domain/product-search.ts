import type { Product } from "@/types/product";
import type { ProductSearchFacets, ProductSearchResponse } from "@/types/search";
import {
  DEFAULT_PRODUCT_SEARCH_PAGE_SIZE,
  type ProductSearchQuery,
  type ProductSearchSort
} from "@/features/search/domain/product-search-schemas";

export type ProductSearchRecord = Product & {
  averageRating: number;
  reviewCount: number;
};

export function tokenizeSearchQuery(query: string) {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

export function buildProductHaystack(product: ProductSearchRecord) {
  return [
    product.name,
    product.category,
    product.brand,
    product.sku,
    product.description,
    ...product.tags,
    ...product.colors.map((color) => color.name),
    ...product.sizes
  ]
    .join(" ")
    .toLowerCase();
}

export function matchesFullTextSearch(product: ProductSearchRecord, query: string) {
  const tokens = tokenizeSearchQuery(query);

  if (tokens.length === 0) {
    return true;
  }

  const haystack = buildProductHaystack(product);
  return tokens.every((token) => haystack.includes(token));
}

export function applyProductFilters(products: ProductSearchRecord[], query: ProductSearchQuery) {
  return products.filter((product) => {
    if (!matchesFullTextSearch(product, query.q)) {
      return false;
    }

    if (query.category.length > 0 && !query.category.includes(product.category)) {
      return false;
    }

    if (query.brand.length > 0 && !query.brand.includes(product.brand)) {
      return false;
    }

    if (query.minPrice != null && product.price < query.minPrice) {
      return false;
    }

    if (query.maxPrice != null && product.price > query.maxPrice) {
      return false;
    }

    if (query.color && !product.colors.some((color) => color.name === query.color)) {
      return false;
    }

    if (query.size && !product.sizes.includes(query.size)) {
      return false;
    }

    if (query.minRating != null && product.averageRating < query.minRating) {
      return false;
    }

    if (query.inStock && product.stockStatus === "Sold out") {
      return false;
    }

    return true;
  });
}

export function sortProducts(products: ProductSearchRecord[], sort: ProductSearchSort) {
  const sorted = [...products];

  sorted.sort((left, right) => {
    if (sort === "price-asc") {
      return left.price - right.price;
    }

    if (sort === "price-desc") {
      return right.price - left.price;
    }

    if (sort === "newest") {
      return Number(right.newArrival) - Number(left.newArrival) || left.name.localeCompare(right.name);
    }

    if (sort === "rating") {
      return (
        right.averageRating - left.averageRating ||
        right.reviewCount - left.reviewCount ||
        left.name.localeCompare(right.name)
      );
    }

    return (
      Number(right.bestSeller) - Number(left.bestSeller) ||
      Number(right.newArrival) - Number(left.newArrival) ||
      left.name.localeCompare(right.name)
    );
  });

  return sorted;
}

export function paginateProducts<T>(products: T[], page: number, pageSize = DEFAULT_PRODUCT_SEARCH_PAGE_SIZE) {
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const normalizedPage = Math.min(Math.max(page, 1), totalPages);
  const start = (normalizedPage - 1) * pageSize;

  return {
    items: products.slice(start, start + pageSize),
    total,
    page: normalizedPage,
    pageSize,
    totalPages
  };
}

export function buildSearchFacets(products: ProductSearchRecord[]): ProductSearchFacets {
  const prices = products.map((product) => product.price);

  return {
    categories: Array.from(new Set(products.map((product) => product.category))).sort(),
    brands: Array.from(new Set(products.map((product) => product.brand).filter(Boolean))).sort(),
    colors: Array.from(new Set(products.flatMap((product) => product.colors.map((color) => color.name)))).sort(),
    sizes: Array.from(new Set(products.flatMap((product) => product.sizes))).sort(),
    minPrice: prices.length > 0 ? Math.min(...prices) : 0,
    maxPrice: prices.length > 0 ? Math.max(...prices) : 0
  };
}

export function runProductSearch(products: ProductSearchRecord[], query: ProductSearchQuery): ProductSearchResponse {
  const filtered = applyProductFilters(products, query);
  const sorted = sortProducts(filtered, query.sort);
  const page = paginateProducts(sorted, query.page, query.pageSize);

  return {
    ...page,
    facets: buildSearchFacets(products),
    query
  };
}

export function productSearchQueryToSearchParams(query: ProductSearchQuery) {
  const params = new URLSearchParams();

  if (query.q) {
    params.set("q", query.q);
  }

  if (query.category.length > 0) {
    params.set("category", query.category.join(","));
  }

  if (query.brand.length > 0) {
    params.set("brand", query.brand.join(","));
  }

  if (query.minPrice != null) {
    params.set("minPrice", String(query.minPrice));
  }

  if (query.maxPrice != null) {
    params.set("maxPrice", String(query.maxPrice));
  }

  if (query.color) {
    params.set("color", query.color);
  }

  if (query.size) {
    params.set("size", query.size);
  }

  if (query.minRating != null) {
    params.set("minRating", String(query.minRating));
  }

  if (query.inStock) {
    params.set("inStock", "true");
  }

  if (query.sort !== "popularity") {
    params.set("sort", query.sort);
  }

  if (query.page > 1) {
    params.set("page", String(query.page));
  }

  if (query.pageSize !== DEFAULT_PRODUCT_SEARCH_PAGE_SIZE) {
    params.set("pageSize", String(query.pageSize));
  }

  return params;
}

export function buildProductSearchPath(query: ProductSearchQuery, basePath = "/shop") {
  const params = productSearchQueryToSearchParams(query);
  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}
