import type {
  AdminBanner,
  AdminCategory,
  AdminCustomer,
  AdminMedia,
  AdminOrder,
  AdminProduct,
  StoreSettings
} from "@/types/admin";

export const adminCategories: AdminCategory[] = [
  {
    id: "cat-dresses",
    name: "Dresses",
    slug: "dresses",
    description: "Clean silhouettes for dinners, openings, and quiet everyday ceremony.",
    image: "/images/ivory-dress.png",
    productCount: 1,
    sortOrder: 1,
    status: "Published"
  },
  {
    id: "cat-tops",
    name: "Tops",
    slug: "tops",
    description: "Soft blouses, structured vests, and refined layers.",
    image: "/images/silk-blouse-jeans.png",
    productCount: 5,
    sortOrder: 2,
    status: "Published"
  },
  {
    id: "cat-pants",
    name: "Pants",
    slug: "pants",
    description: "Tailored trousers with ease, shape, and movement.",
    image: "/images/black-vest-trouser.png",
    productCount: 2,
    sortOrder: 3,
    status: "Published"
  },
  {
    id: "cat-jeans",
    name: "Jeans",
    slug: "jeans",
    description: "Dark denim with polished proportions.",
    image: "/images/silk-blouse-jeans.png",
    productCount: 1,
    sortOrder: 4,
    status: "Published"
  },
  {
    id: "cat-shoes",
    name: "Shoes",
    slug: "shoes",
    description: "Minimal footwear made to anchor the wardrobe.",
    image: "/images/accessories.png",
    productCount: 1,
    sortOrder: 5,
    status: "Published"
  },
  {
    id: "cat-bags",
    name: "Bags",
    slug: "bags",
    description: "Structured leather pieces in neutral finishes.",
    image: "/images/accessories.png",
    productCount: 1,
    sortOrder: 6,
    status: "Published"
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Quiet finishing pieces with enduring texture.",
    image: "/images/accessories.png",
    productCount: 2,
    sortOrder: 7,
    status: "Published"
  }
];

export const adminProducts: AdminProduct[] = [
  {
    id: "prd-ivory-column",
    name: "Ivory Column Midi Dress",
    sku: "AL-DR-1001",
    barcode: "8850001001001",
    categoryId: "cat-dresses",
    brand: "Atelier Lune",
    priceMmk: 585000,
    salePriceMmk: 548000,
    costPriceMmk: 312000,
    description: "Sleeveless midi dress with a softened column line and refined matte finish.",
    images: ["/images/ivory-dress.png", "/images/hero-boutique.png"],
    colors: ["Ivory", "Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stockQuantity: 18,
    lowStockWarning: 6,
    featured: true,
    bestSeller: true,
    newArrival: true,
    onSale: true,
    status: "Published",
    updatedAt: "2026-07-10"
  },
  {
    id: "prd-black-waistcoat",
    name: "Tailored Black Waistcoat",
    sku: "AL-TP-2042",
    barcode: "8850002042002",
    categoryId: "cat-tops",
    brand: "Atelier Lune",
    priceMmk: 392000,
    costPriceMmk: 211000,
    description: "Sharply cut waistcoat with a clean V neckline and subtle waist shaping.",
    images: ["/images/black-vest-trouser.png", "/images/new-collection.png"],
    colors: ["Black", "Warm Taupe"],
    sizes: ["XS", "S", "M", "L"],
    stockQuantity: 9,
    lowStockWarning: 10,
    featured: true,
    bestSeller: true,
    newArrival: true,
    onSale: false,
    status: "Published",
    updatedAt: "2026-07-09"
  },
  {
    id: "prd-satin-blouse",
    name: "Satin Ease Blouse",
    sku: "AL-TP-2037",
    barcode: "8850002037008",
    categoryId: "cat-tops",
    brand: "Atelier Lune",
    priceMmk: 329000,
    salePriceMmk: 299000,
    costPriceMmk: 176000,
    description: "Fluid satin blouse shaped with a relaxed collar and soft cuffs.",
    images: ["/images/silk-blouse-jeans.png", "/images/store-interior.png"],
    colors: ["Cream", "Graphite"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    stockQuantity: 26,
    lowStockWarning: 8,
    featured: false,
    bestSeller: false,
    newArrival: true,
    onSale: true,
    status: "Published",
    updatedAt: "2026-07-08"
  },
  {
    id: "prd-wide-jean",
    name: "Sculpted Wide Jean",
    sku: "AL-JN-3008",
    barcode: "8850003008007",
    categoryId: "cat-jeans",
    brand: "Atelier Lune Denim",
    priceMmk: 413000,
    costPriceMmk: 235000,
    description: "Dark-rinse wide jean with a high rise and structured denim finish.",
    images: ["/images/silk-blouse-jeans.png", "/images/black-vest-trouser.png"],
    colors: ["Deep Indigo", "Washed Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stockQuantity: 14,
    lowStockWarning: 5,
    featured: false,
    bestSeller: true,
    newArrival: false,
    onSale: false,
    status: "Published",
    updatedAt: "2026-07-07"
  },
  {
    id: "prd-mini-tote",
    name: "Structured Mini Tote",
    sku: "AL-BG-5104",
    barcode: "8850005104004",
    categoryId: "cat-bags",
    brand: "Atelier Lune Leather",
    priceMmk: 658000,
    costPriceMmk: 384000,
    description: "Compact structured tote in grained leather with a clean flap.",
    images: ["/images/accessories.png", "/images/store-interior.png"],
    colors: ["Taupe", "Black"],
    sizes: ["One size"],
    stockQuantity: 7,
    lowStockWarning: 4,
    featured: true,
    bestSeller: true,
    newArrival: false,
    onSale: false,
    status: "Draft",
    updatedAt: "2026-07-06"
  }
];

export const adminBanners: AdminBanner[] = [
  {
    id: "bnr-home-hero",
    title: "Spring Collection Hero",
    placement: "Homepage Hero",
    image: "/images/hero-boutique.png",
    eyebrow: "Spring collection",
    headline: "Atelier Lune",
    ctaLabel: "Shop Collection",
    ctaHref: "/shop",
    status: "Published"
  },
  {
    id: "bnr-new-collection",
    title: "Soft Tailoring Feature",
    placement: "New Collection",
    image: "/images/new-collection.png",
    eyebrow: "New collection",
    headline: "Soft tailoring, softened further.",
    ctaLabel: "View new arrivals",
    ctaHref: "/shop",
    status: "Published"
  }
];

export const adminMedia: AdminMedia[] = [
  {
    id: "med-hero",
    name: "hero-boutique.png",
    url: "/images/hero-boutique.png",
    type: "Image",
    size: "1.45 MB",
    folder: "Homepage",
    dimensions: "1920 x 800",
    usedIn: "Home hero"
  },
  {
    id: "med-dress",
    name: "ivory-dress.png",
    url: "/images/ivory-dress.png",
    type: "Image",
    size: "1.96 MB",
    folder: "Products",
    dimensions: "1024 x 1536",
    usedIn: "Products, categories"
  },
  {
    id: "med-vest",
    name: "black-vest-trouser.png",
    url: "/images/black-vest-trouser.png",
    type: "Image",
    size: "1.56 MB",
    folder: "Products",
    dimensions: "1024 x 1536",
    usedIn: "Products"
  },
  {
    id: "med-blouse",
    name: "silk-blouse-jeans.png",
    url: "/images/silk-blouse-jeans.png",
    type: "Image",
    size: "2.05 MB",
    folder: "Products",
    dimensions: "1024 x 1536",
    usedIn: "Products"
  },
  {
    id: "med-accessories",
    name: "accessories.png",
    url: "/images/accessories.png",
    type: "Image",
    size: "2.18 MB",
    folder: "Accessories",
    dimensions: "1024 x 1536",
    usedIn: "Bags, shoes, accessories"
  },
  {
    id: "med-store",
    name: "store-interior.png",
    url: "/images/store-interior.png",
    type: "Image",
    size: "1.73 MB",
    folder: "Brand",
    dimensions: "1920 x 1080",
    usedIn: "About, contact"
  },
  {
    id: "med-collection",
    name: "new-collection.png",
    url: "/images/new-collection.png",
    type: "Image",
    size: "1.61 MB",
    folder: "Homepage",
    dimensions: "1920 x 800",
    usedIn: "Collection banner"
  }
];

export const adminOrders: AdminOrder[] = [
  { id: "ORD-1042", customer: "May Thiri", totalMmk: 877000, status: "Pending", channel: "Messenger", createdAt: "2026-07-10" },
  { id: "ORD-1041", customer: "Nandar Lin", totalMmk: 392000, status: "Confirmed", channel: "Viber", createdAt: "2026-07-09" },
  { id: "ORD-1040", customer: "Hnin Wai", totalMmk: 658000, status: "Packed", channel: "Phone", createdAt: "2026-07-08" }
];

export const adminCustomers: AdminCustomer[] = [
  { id: "CUS-810", name: "May Thiri", phone: "+95 9 421 000 112", orders: 3, lifetimeValueMmk: 1653000, lastOrderAt: "2026-07-10" },
  { id: "CUS-744", name: "Nandar Lin", phone: "+95 9 500 331 221", orders: 1, lifetimeValueMmk: 392000, lastOrderAt: "2026-07-09" },
  { id: "CUS-701", name: "Hnin Wai", phone: "+95 9 777 304 881", orders: 4, lifetimeValueMmk: 2249000, lastOrderAt: "2026-07-08" }
];

export const storeSettings: StoreSettings = {
  storeName: "Atelier Lune",
  logo: "/app/icon.svg",
  storeDescription: "Premium minimal pieces for a quiet, edited wardrobe.",
  facebook: "https://facebook.com/atelierlune",
  messenger: "https://m.me/atelierlune",
  viber: "viber://chat?number=%2B959421000112",
  telegram: "https://t.me/atelierlune",
  tiktok: "https://tiktok.com/@atelierlune",
  instagram: "https://instagram.com/atelierlune",
  email: "hello@atelierlune.example",
  phone: "+95 9 421 000 112",
  address: "24 Garosu-gil, Gangnam-gu, Seoul",
  googleMap: "https://www.google.com/maps?q=Garosu-gil%2C%20Gangnam-gu%2C%20Seoul",
  currency: "MMK",
  timezone: "Asia/Yangon"
};

export function formatMmk(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MMK",
    maximumFractionDigits: 0
  }).format(value);
}
