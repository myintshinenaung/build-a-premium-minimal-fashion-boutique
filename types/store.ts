export type StoreStatus = "active" | "inactive";

export type Store = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  coverImage: string;
  description: string;
  monogram: string;
  status: StoreStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  platformCategoryIds: string[];
};

export type PlatformCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
  status: StoreStatus;
  createdAt: string;
  updatedAt: string;
};

export type StoreCreateInput = {
  id?: string;
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  monogram?: string;
  status?: StoreStatus;
  sortOrder?: number;
  platformCategoryIds?: string[];
};

export type StoreUpdateInput = Partial<Omit<StoreCreateInput, "id">>;
