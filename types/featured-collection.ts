import type { AdminStatus } from "@/types/admin";
import type { Product } from "@/types/product";

export type AdminFeaturedCollectionItem = {
  id: string;
  collectionId: string;
  productId: string;
  sortOrder: number;
};

export type AdminFeaturedCollection = {
  id: string;
  storeId: string;
  title: string;
  subtitle: string;
  coverImage: string;
  buttonText: string;
  buttonUrl: string;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  status: AdminStatus;
  items: AdminFeaturedCollectionItem[];
};

export type FeaturedCollectionCard = {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  buttonText: string;
  buttonUrl: string;
  products: Product[];
};

export type FeaturedCollectionsSectionData = {
  collections: FeaturedCollectionCard[];
};
