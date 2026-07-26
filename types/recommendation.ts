import type { Product } from "@/types/product";
import type { RecommendationType } from "@/features/recommendations/domain/recommendation-schemas";

export type RecommendationResponse = {
  type: RecommendationType;
  items: Product[];
  total: number;
  productId?: string;
};
