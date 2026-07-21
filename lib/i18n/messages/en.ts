export const enMessages = {
  common: {
    shopAll: "Shop all",
    viewNewArrivals: "View new arrivals",
    readOurStory: "Read our story",
    loading: "Loading",
    close: "Close"
  },
  nav: {
    shop: "Shop",
    categories: "Categories",
    about: "About",
    contact: "Contact"
  },
  header: {
    skipToContent: "Skip to content",
    homeAria: "{storeName} home",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    search: "Search products",
    openCart: "Open shopping cart",
    openCartWithCount: "Open shopping cart, {count} items",
    language: "Language"
  },
  language: {
    myanmar: "Myanmar",
    english: "English",
    switchToMyanmar: "Switch to Myanmar",
    switchToEnglish: "Switch to English"
  },
  search: {
    title: "Search",
    placeholder: "Search products, categories, colors, SKU…",
    shortcutHint: "Ctrl K",
    noResults: "No products matched your search.",
    recent: "Recent searches",
    popular: "Popular searches",
    clearRecent: "Clear recent",
    resultCount: "{count} results"
  },
  cart: {
    yourBag: "Your bag",
    title: "Shopping cart",
    empty: "Your cart is empty.",
    continueShopping: "Continue Shopping",
    checkout: "Checkout",
    subtotal: "Subtotal",
    shippingNote: "Shipping and taxes calculated at checkout.",
    removeItem: "Remove {productName} from cart",
    decreaseQuantity: "Decrease quantity",
    increaseQuantity: "Increase quantity",
    close: "Close shopping cart"
  },
  product: {
    stockStatus: "Stock status",
    availableIn: "{count} available in {size} / {color}",
    unavailableCombination: "This combination is currently unavailable.",
    size: "Size",
    color: "Color",
    quantity: "Quantity",
    addToCart: "Add to Cart",
    addedToCart: "Added to cart.",
    selectVariant: "Select an available size and color.",
    share: "Share Product",
    copied: "Copied",
    description: "Description",
    relatedEyebrow: "Related products",
    relatedTitle: "Complete the edit",
    zoom: "Zoom",
    openZoom: "Open zoom view for {productName}",
    closeZoom: "Close zoom view",
    showImage: "Show {productName} image {index}"
  },
  shop: {
    eyebrow: "Shop",
    allPieces: "All pieces",
    description: "Search, filter, and sort the full boutique edit.",
    filters: "Filters",
    category: "Category",
    color: "Color",
    allColors: "All",
    sortBy: "Sort by",
    featured: "Featured",
    priceLowHigh: "Price: Low to High",
    priceHighLow: "Price: High to Low",
    newest: "Newest",
    bestSellers: "Best sellers",
    inStockOnly: "In stock only",
    newArrivalsOnly: "New arrivals",
    bestSellersOnly: "Best sellers",
    searchPlaceholder: "Search products",
    showing: "Showing {count} pieces",
    page: "Page {current} of {total}",
    previous: "Previous",
    next: "Next",
    noProducts: "No products match your filters.",
    reset: "Reset",
    clearCategories: "Clear categories",
    piece: "piece",
    pieces: "pieces",
    pagination: "Pagination"
  },
  categories: {
    eyebrow: "Categories",
    title: "Shop the boutique edit",
    description: "Every category is intentionally narrow, giving each piece space to work with the rest of the wardrobe."
  },
  checkout: {
    eyebrow: "Checkout",
    title: "Checkout foundation",
    description: "Your cart is ready. Full checkout flow will be implemented in the next sprint task.",
    continueShopping: "Continue Shopping",
    backHome: "Back to Home"
  },
  contact: {
    eyebrow: "Contact",
    title: "Visit the boutique",
    description: "For availability, styling questions, or reserved fittings, contact {storeName} directly.",
    storeLocation: "Store location",
    mapTitle: "Google Map for {storeName}"
  },
  about: {
    brandStory: "Brand story",
    heroTitle: "Quiet pieces. Precise intent.",
    missionEyebrow: "Mission",
    missionTitle: "Make the wardrobe feel calm before it feels full.",
    missionDescription:
      "We source and style with longevity in mind: neutral shades, clear shapes, and repeatable combinations that hold up after the first impression.",
    values: {
      editedTitle: "Edited",
      editedText: "We make room for fewer, stronger pieces instead of seasonal noise.",
      tactileTitle: "Tactile",
      tactileText: "Texture, weight, and drape guide every selection before trend or novelty.",
      wearableTitle: "Wearable",
      wearableText: "Every item has to move easily through work, travel, dinner, and repetition."
    }
  },
  footer: {
    shop: "Shop",
    brand: "Brand",
    visit: "Visit",
    newArrivals: "New Arrivals",
    rights: "© {year} {storeName}. All rights reserved."
  },
  home: {
    hero: {
      browseCategories: "Browse Categories",
      imageAlt: "Minimal fashion editorial",
      fallbackPrimaryCta: "Shop Collection"
    },
    featuredCategories: {
      eyebrow: "Featured categories",
      title: "A focused edit for every day",
      description: "Shop by silhouette, texture, and the pieces that make a wardrobe feel considered."
    },
    bestSellers: {
      eyebrow: "Best sellers",
      title: "Pieces with quiet momentum"
    },
    newArrivals: {
      eyebrow: "New arrivals",
      title: "Fresh proportion, same restraint",
      description:
        "New pieces are edited for compatibility first: clean lines, neutral tones, and fabrics that hold their shape."
    },
    aboutTeaser: {
      eyebrow: "About the brand",
      title: "Designed to make less feel complete.",
      description:
        "{storeName} builds around the pieces that stay: refined shapes, practical proportions, and tactile neutrals that make daily dressing feel measured and calm."
    },
    instagram: {
      eyebrow: "Instagram",
      title: "From the fitting room"
    },
    gallery: {
      ivoryDress: "Ivory midi dress editorial",
      blackVest: "Black vest and tailored trouser editorial",
      satinBlouse: "Satin blouse with wide denim editorial",
      accessories: "Leather shoes and structured handbag",
      storeInterior: "Minimal boutique interior",
      newCollection: "Neutral tailored collection editorial"
    }
  }
} as const;

type DeepStringMap<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringMap<T[K]>;
};

export type Messages = DeepStringMap<typeof enMessages>;
