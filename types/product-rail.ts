import type { AdminStatus } from "@/types/admin";
import type { Product } from "@/types/product";

export type AdminProductRailItem = {
  id: string;
  railId: string;
  productId: string;
  sortOrder: number;
};

export type AdminProductRail = {
  id: string;
  storeId: string;
  title: string;
  subtitle: string;
  badgeText: string;
  description: string;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  status: AdminStatus;
  items: AdminProductRailItem[];
};

export type ProductRailCard = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  products: Product[];
};

export type ProductRailsSectionData = {
  rails: ProductRailCard[];
};
