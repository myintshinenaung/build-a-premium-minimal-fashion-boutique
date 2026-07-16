import type { Category, Product, ProductCategory } from "@/types/product";
import { slugify } from "./utils";

export const categories: Category[] = [
  {
    name: "Dresses",
    slug: "dresses",
    image: "/images/ivory-dress.png",
    description: "Clean silhouettes for dinners, openings, and quiet everyday ceremony."
  },
  {
    name: "Tops",
    slug: "tops",
    image: "/images/silk-blouse-jeans.png",
    description: "Soft blouses, structured vests, and refined layers."
  },
  {
    name: "Pants",
    slug: "pants",
    image: "/images/black-vest-trouser.png",
    description: "Tailored trousers with ease, shape, and movement."
  },
  {
    name: "Jeans",
    slug: "jeans",
    image: "/images/silk-blouse-jeans.png",
    description: "Dark denim with polished proportions."
  },
  {
    name: "Shoes",
    slug: "shoes",
    image: "/images/accessories.png",
    description: "Minimal footwear made to anchor the wardrobe."
  },
  {
    name: "Bags",
    slug: "bags",
    image: "/images/accessories.png",
    description: "Structured leather pieces in neutral finishes."
  },
  {
    name: "Accessories",
    slug: "accessories",
    image: "/images/accessories.png",
    description: "Quiet finishing pieces with enduring texture."
  }
];

export const products: Product[] = [
  {
    slug: "ivory-column-midi-dress",
    name: "Ivory Column Midi Dress",
    price: 168,
    category: "Dresses",
    description:
      "A sleeveless midi dress with a softened column line, invisible shaping, and a refined matte finish for day-to-evening wear.",
    details: ["Fully lined", "Back zip closure", "Mid-weight stretch crepe", "Designed for a close but comfortable fit"],
    images: ["/images/ivory-dress.png", "/images/hero-boutique.png", "/images/new-collection.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Ivory", hex: "#eee7dc" },
      { name: "Black", hex: "#111111" }
    ],
    stockStatus: "In stock",
    newArrival: true,
    bestSeller: true
  },
  {
    slug: "tailored-black-waistcoat",
    name: "Tailored Black Waistcoat",
    price: 112,
    category: "Tops",
    description:
      "A sharply cut waistcoat with a clean V neckline and subtle waist shaping. Wear alone or layered over fine knits.",
    details: ["Button front", "Back adjuster tab", "Smooth suiting cloth", "Tailored waist"],
    images: ["/images/black-vest-trouser.png", "/images/new-collection.png", "/images/hero-boutique.png"],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Warm Taupe", hex: "#a89a8b" }
    ],
    stockStatus: "Low stock",
    newArrival: true,
    bestSeller: true
  },
  {
    slug: "satin-ease-blouse",
    name: "Satin Ease Blouse",
    price: 94,
    category: "Tops",
    description:
      "A fluid blouse in a subtle satin weave, shaped with a relaxed collar and soft cuffs for polished everyday wear.",
    details: ["Concealed placket", "Relaxed fit", "Soft satin handle", "Curved hem"],
    images: ["/images/silk-blouse-jeans.png", "/images/ivory-dress.png", "/images/store-interior.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Cream", hex: "#f3eadf" },
      { name: "Graphite", hex: "#343332" }
    ],
    stockStatus: "In stock",
    newArrival: true,
    bestSeller: false
  },
  {
    slug: "fluid-wide-leg-trouser",
    name: "Fluid Wide-Leg Trouser",
    price: 128,
    category: "Pants",
    description:
      "Wide-leg trousers with soft pleats, a precise waistband, and a drape that moves cleanly from office to dinner.",
    details: ["Hook-and-bar closure", "Pressed crease", "Side pockets", "Full length"],
    images: ["/images/black-vest-trouser.png", "/images/hero-boutique.png", "/images/new-collection.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Stone", hex: "#948b82" },
      { name: "Black", hex: "#111111" }
    ],
    stockStatus: "In stock",
    newArrival: false,
    bestSeller: true
  },
  {
    slug: "sculpted-wide-jean",
    name: "Sculpted Wide Jean",
    price: 118,
    category: "Jeans",
    description:
      "A dark-rinse wide jean with a high rise, long clean leg, and structured denim that keeps its shape.",
    details: ["High rise", "Rigid cotton denim", "Full-length inseam", "Clean dark rinse"],
    images: ["/images/silk-blouse-jeans.png", "/images/black-vest-trouser.png", "/images/store-interior.png"],
    sizes: ["24", "25", "26", "27", "28", "29", "30", "31"],
    colors: [
      { name: "Deep Indigo", hex: "#101b2d" },
      { name: "Washed Black", hex: "#2e2d2b" }
    ],
    stockStatus: "In stock",
    newArrival: false,
    bestSeller: true
  },
  {
    slug: "leather-slingback-heel",
    name: "Leather Slingback Heel",
    price: 156,
    category: "Shoes",
    description:
      "Pointed slingback heels in smooth leather with a low architectural heel and delicate adjustable strap.",
    details: ["Leather upper", "Adjustable buckle", "Padded insole", "55 mm heel"],
    images: ["/images/accessories.png", "/images/ivory-dress.png", "/images/silk-blouse-jeans.png"],
    sizes: ["36", "37", "38", "39", "40", "41"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Oat", hex: "#d4c6b5" }
    ],
    stockStatus: "Low stock",
    newArrival: true,
    bestSeller: false
  },
  {
    slug: "structured-mini-tote",
    name: "Structured Mini Tote",
    price: 188,
    category: "Bags",
    description:
      "A compact structured tote in grained leather with a top handle, clean flap, and enough space for daily essentials.",
    details: ["Grained leather", "Magnetic closure", "Internal slip pocket", "Detachable shoulder strap"],
    images: ["/images/accessories.png", "/images/store-interior.png", "/images/new-collection.png"],
    sizes: ["One size"],
    colors: [
      { name: "Taupe", hex: "#a99685" },
      { name: "Black", hex: "#111111" }
    ],
    stockStatus: "In stock",
    newArrival: false,
    bestSeller: true
  },
  {
    slug: "fine-rib-tank",
    name: "Fine Rib Tank",
    price: 54,
    category: "Tops",
    description:
      "A close-fitting rib tank with a clean neckline, designed as a base layer or a minimal standalone piece.",
    details: ["Fine cotton rib", "Bound neckline", "Close fit", "Machine washable"],
    images: ["/images/ivory-dress.png", "/images/silk-blouse-jeans.png", "/images/store-interior.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "White", hex: "#f8f7f4" },
      { name: "Black", hex: "#111111" },
      { name: "Clay", hex: "#b8a896" }
    ],
    stockStatus: "In stock",
    newArrival: false,
    bestSeller: false
  },
  {
    slug: "pleated-city-pant",
    name: "Pleated City Pant",
    price: 134,
    category: "Pants",
    description:
      "A relaxed pleated pant with a precise waistband, deep pockets, and a slightly tapered finish.",
    details: ["Double pleat front", "Belt loops", "Soft drape fabric", "Cropped ankle length"],
    images: ["/images/black-vest-trouser.png", "/images/new-collection.png", "/images/store-interior.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Taupe", hex: "#9c9185" },
      { name: "Black", hex: "#111111" }
    ],
    stockStatus: "Made to order",
    newArrival: true,
    bestSeller: false
  },
  {
    slug: "silk-square-scarf",
    name: "Silk Square Scarf",
    price: 48,
    category: "Accessories",
    description:
      "A compact silk scarf with a tonal border, made to knot at the neck, wrist, or handle of a bag.",
    details: ["Pure silk twill", "Hand-rolled edge", "Tonal border", "45 x 45 cm"],
    images: ["/images/accessories.png", "/images/store-interior.png", "/images/hero-boutique.png"],
    sizes: ["One size"],
    colors: [
      { name: "Ivory", hex: "#eee7dc" },
      { name: "Black", hex: "#111111" }
    ],
    stockStatus: "In stock",
    newArrival: false,
    bestSeller: false
  },
  {
    slug: "minimal-hoop-set",
    name: "Minimal Hoop Set",
    price: 42,
    category: "Accessories",
    description:
      "A set of two slim hoops with a smooth polish, designed to disappear into a daily uniform.",
    details: ["Set of two", "Hypoallergenic posts", "Polished finish", "Lightweight feel"],
    images: ["/images/accessories.png", "/images/ivory-dress.png", "/images/new-collection.png"],
    sizes: ["One size"],
    colors: [
      { name: "Gold", hex: "#c5a25c" },
      { name: "Silver", hex: "#c7c7c7" }
    ],
    stockStatus: "In stock",
    newArrival: false,
    bestSeller: false
  },
  {
    slug: "soft-structure-blazer",
    name: "Soft Structure Blazer",
    price: 214,
    category: "Tops",
    description:
      "A softly tailored blazer with relaxed shoulders, clean lapels, and a calm neutral tone for year-round layering.",
    details: ["Partially lined", "Interior pocket", "Relaxed shoulder", "Mid-weight suiting"],
    images: ["/images/new-collection.png", "/images/hero-boutique.png", "/images/black-vest-trouser.png"],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Warm Grey", hex: "#9a9188" },
      { name: "Black", hex: "#111111" }
    ],
    stockStatus: "Low stock",
    newArrival: true,
    bestSeller: true
  }
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return products
    .filter((item) => item.slug !== product.slug && item.category === product.category)
    .concat(products.filter((item) => item.slug !== product.slug && item.category !== product.category))
    .slice(0, limit);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getProductsByCategory(category: ProductCategory) {
  return products.filter((product) => product.category === category);
}

export function getCategorySlug(category: ProductCategory) {
  return slugify(category);
}

export const bestSellers = products.filter((product) => product.bestSeller).slice(0, 4);
export const newArrivals = products.filter((product) => product.newArrival).slice(0, 4);
