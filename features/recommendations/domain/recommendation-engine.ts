import type { Product } from "@/types/product";

export type RecommendationRecord = Product & {
  averageRating: number;
  reviewCount: number;
};

type ScoredProduct = {
  product: RecommendationRecord;
  score: number;
};

const SYSTEM_TAGS = new Set(["best seller", "new arrival", "sale", "featured"]);

function sharedTagCount(left: RecommendationRecord, right: RecommendationRecord) {
  const leftTags = new Set(left.tags.filter((tag) => !SYSTEM_TAGS.has(tag)));
  const rightTags = new Set(right.tags.filter((tag) => !SYSTEM_TAGS.has(tag)));

  return Array.from(leftTags).filter((tag) => rightTags.has(tag)).length;
}

function sharedColorCount(left: RecommendationRecord, right: RecommendationRecord) {
  const leftColors = new Set(left.colors.map((color) => color.name));
  return right.colors.filter((color) => leftColors.has(color.name)).length;
}

function priceProximityScore(left: RecommendationRecord, right: RecommendationRecord) {
  const difference = Math.abs(left.price - right.price);
  const baseline = Math.max(left.price, right.price, 1);
  return Math.max(0, 1 - difference / baseline);
}

function ratingBoost(product: RecommendationRecord) {
  return product.averageRating * 0.35 + Math.min(product.reviewCount, 20) * 0.05;
}

function stockBoost(product: RecommendationRecord) {
  return product.stockStatus === "Sold out" ? -2 : 0.5;
}

export function scoreRelatedProduct(source: RecommendationRecord, candidate: RecommendationRecord) {
  if (source.id === candidate.id) {
    return Number.NEGATIVE_INFINITY;
  }

  let score = 0;

  if (candidate.category === source.category) {
    score += 5;
  }

  if (candidate.brand === source.brand) {
    score += 3;
  }

  score += sharedTagCount(source, candidate) * 1.5;
  score += sharedColorCount(source, candidate) * 0.75;
  score += priceProximityScore(source, candidate);
  score += ratingBoost(candidate);
  score += stockBoost(candidate);

  if (candidate.bestSeller) {
    score += 0.5;
  }

  if (candidate.newArrival) {
    score += 0.25;
  }

  return score;
}

export function scoreSimilarProduct(source: RecommendationRecord, candidate: RecommendationRecord) {
  if (source.id === candidate.id) {
    return Number.NEGATIVE_INFINITY;
  }

  let score = 0;

  if (candidate.brand === source.brand) {
    score += 6;
  }

  score += sharedTagCount(source, candidate) * 2;
  score += sharedColorCount(source, candidate);
  score += priceProximityScore(source, candidate) * 1.5;
  score += ratingBoost(candidate);
  score += stockBoost(candidate);

  if (candidate.category !== source.category) {
    score += 0.5;
  }

  return score;
}

export function scoreTrendingProduct(product: RecommendationRecord) {
  let score = 0;

  if (product.bestSeller) {
    score += 4;
  }

  if (product.newArrival) {
    score += 2.5;
  }

  score += ratingBoost(product) * 1.5;
  score += Math.min(product.reviewCount, 30) * 0.15;
  score += stockBoost(product);

  return score;
}

function rankProducts(products: RecommendationRecord[], scoreProduct: (product: RecommendationRecord) => number, limit: number) {
  const scored: ScoredProduct[] = products
    .map((product) => ({
      product,
      score: scoreProduct(product)
    }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.product.name.localeCompare(right.product.name);
    });

  return scored.slice(0, limit).map((entry) => entry.product);
}

export function getRelatedProducts(
  products: RecommendationRecord[],
  productId: string,
  limit = 4
) {
  const source = products.find((product) => product.id === productId);

  if (!source) {
    return [];
  }

  return rankProducts(products, (candidate) => scoreRelatedProduct(source, candidate), limit);
}

export function getSimilarProducts(
  products: RecommendationRecord[],
  productId: string,
  limit = 4
) {
  const source = products.find((product) => product.id === productId);

  if (!source) {
    return [];
  }

  return rankProducts(products, (candidate) => scoreSimilarProduct(source, candidate), limit);
}

export function getTrendingProducts(
  products: RecommendationRecord[],
  limit = 4,
  excludeProductId?: string
) {
  const candidates = excludeProductId
    ? products.filter((product) => product.id !== excludeProductId)
    : products;

  return rankProducts(candidates, scoreTrendingProduct, limit);
}

export function getBestSellerProducts(products: RecommendationRecord[], limit = 4) {
  const candidates = products.filter((product) => product.bestSeller);
  return rankProducts(candidates, scoreTrendingProduct, limit);
}

export function getNewArrivalProducts(products: RecommendationRecord[], limit = 4) {
  const candidates = products.filter((product) => product.newArrival);
  return rankProducts(
    candidates,
    (product) => scoreTrendingProduct(product) + Number(product.newArrival),
    limit
  );
}

export function runRecommendationEngine(
  products: RecommendationRecord[],
  type: import("@/features/recommendations/domain/recommendation-schemas").RecommendationType,
  options: { productId?: string; limit?: number } = {}
) {
  const limit = options.limit ?? 4;

  switch (type) {
    case "related":
      return getRelatedProducts(products, options.productId ?? "", limit);
    case "similar":
      return getSimilarProducts(products, options.productId ?? "", limit);
    case "trending":
      return getTrendingProducts(products, limit, options.productId);
    case "best-sellers":
      return getBestSellerProducts(products, limit);
    case "new-arrivals":
      return getNewArrivalProducts(products, limit);
    default:
      return [];
  }
}
