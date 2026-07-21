export type ProductCategory = string;

export type StockStatus = "In stock" | "Low stock" | "Made to order" | "Sold out";

export type ProductColor = {
  name: string;
  hex: string;
};

export type ProductVariant = {
  id: string;
  productId: string;
  size: string;
  color: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  stockStatus: StockStatus;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  category: ProductCategory;
  description: string;
  details: string[];
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  sku: string;
  tags: string[];
  variants: ProductVariant[];
  stockStatus: StockStatus;
  newArrival: boolean;
  bestSeller: boolean;
};

export type Category = {
  name: ProductCategory;
  slug: string;
  image: string;
  description: string;
};
