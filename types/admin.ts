export type AdminStatus = "Published" | "Draft";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Icon / card image shown in the category rail and collection surfaces. */
  image: string;
  productCount: number;
  sortOrder: number;
  /** Platform store this category belongs to (e.g. daily-outfit). */
  storeId: string;
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
  /** Internal banner label shown in the dashboard list. */
  title: string;
  placement: "Homepage Hero" | "New Collection" | "Announcement";
  /** Desktop / primary banner image URL. */
  image: string;
  /** Mobile-optimized banner image URL. Falls back to desktop image on the storefront when empty. */
  mobileImage: string;
  /** Hero subtitle (eyebrow). */
  eyebrow: string;
  /** Hero title (headline). */
  headline: string;
  ctaLabel: string;
  ctaHref: string;
  storeName: string;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
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
  channel: "Messenger" | "Viber" | "Phone" | "Web";
  shippingStatus: "pending" | "shipped";
  carrier: string | null;
  trackingNumber: string | null;
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
  heroTitleEn: string;
  heroTitleMy: string;
  heroSubtitleEn: string;
  heroSubtitleMy: string;
  heroMarketingHeadlineEn: string;
  heroMarketingHeadlineMy: string;
  heroCtaLabelEn: string;
  heroCtaLabelMy: string;
  heroSecondaryCtaLabelEn: string;
  heroSecondaryCtaLabelMy: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaHref: string;
  heroBackgroundImage: string;
  flatRateShippingMmk: number;
};
