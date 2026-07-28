import type { AdminStatus } from "@/types/admin";
import type { Product } from "@/types/product";

export type AdminFlashSaleItem = {
  id: string;
  flashSaleId: string;
  productId: string;
  discountPercent: number;
  sortOrder: number;
};

export type AdminFlashSale = {
  id: string;
  storeId: string;
  sectionTitle: string;
  sectionSubtitle: string;
  badgeText: string;
  startsAt: string | null;
  endsAt: string | null;
  status: AdminStatus;
  items: AdminFlashSaleItem[];
};

export type FlashSaleSectionData = {
  id: string;
  sectionTitle: string;
  sectionSubtitle: string;
  badgeText: string;
  endsAt: string;
  products: Product[];
};
