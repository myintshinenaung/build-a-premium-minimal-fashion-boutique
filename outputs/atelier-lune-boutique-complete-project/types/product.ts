export type ProductCategory =
  | "Dresses"
  | "Tops"
  | "Pants"
  | "Jeans"
  | "Shoes"
  | "Bags"
  | "Accessories";

export type StockStatus = "In stock" | "Low stock" | "Made to order" | "Sold out";

export type ProductColor = {
  name: string;
  hex: string;
};

export type Product = {
  slug: string;
  name: string;
  price: number;
  category: ProductCategory;
  description: string;
  details: string[];
  images: string[];
  sizes: string[];
  colors: ProductColor[];
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
