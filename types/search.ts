export type SearchProductIndex = {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  colors: string[];
  tags: string[];
  sku: string;
  price: number;
  image: string;
};

export type ProductSearchFacets = {
  categories: string[];
  brands: string[];
  colors: string[];
  sizes: string[];
  minPrice: number;
  maxPrice: number;
};

export type ProductSearchResponse = {
  items: import("@/types/product").Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: ProductSearchFacets;
  query: import("@/features/search/domain/product-search-schemas").ProductSearchQuery;
};
