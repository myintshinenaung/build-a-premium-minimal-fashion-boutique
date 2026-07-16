export type AdminStatus = "Published" | "Draft";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  sortOrder: number;
  status: AdminStatus;
};

export type AdminProduct = {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  brand: string;
  priceMmk: number;
  salePriceMmk?: number;
  costPriceMmk: number;
  description: string;
  images: string[];
  colors: string[];
  sizes: string[];
  stockQuantity: number;
  lowStockWarning: number;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  onSale: boolean;
  status: AdminStatus;
  updatedAt: string;
};

export type AdminBanner = {
  id: string;
  title: string;
  placement: "Homepage Hero" | "New Collection" | "Announcement";
  image: string;
  eyebrow: string;
  headline: string;
  ctaLabel: string;
  ctaHref: string;
  status: AdminStatus;
};

export type AdminMedia = {
  id: string;
  name: string;
  url: string;
  type: "Image";
  size: string;
  folder: string;
  dimensions: string;
  usedIn: string;
};

export type AdminOrder = {
  id: string;
  customer: string;
  totalMmk: number;
  status: "Pending" | "Confirmed" | "Packed" | "Completed";
  channel: "Messenger" | "Viber" | "Phone";
  createdAt: string;
};

export type AdminCustomer = {
  id: string;
  name: string;
  phone: string;
  orders: number;
  lifetimeValueMmk: number;
  lastOrderAt: string;
};

export type StoreSettings = {
  storeName: string;
  logo: string;
  storeDescription: string;
  facebook: string;
  messenger: string;
  viber: string;
  telegram: string;
  tiktok: string;
  instagram: string;
  email: string;
  phone: string;
  address: string;
  googleMap: string;
  currency: string;
  timezone: string;
};
