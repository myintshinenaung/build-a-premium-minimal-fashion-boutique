import { z } from "zod";

export const RECOMMENDATION_TYPES = [
  "related",
  "similar",
  "trending",
  "best-sellers",
  "new-arrivals"
] as const;

export type RecommendationType = (typeof RECOMMENDATION_TYPES)[number];

export const DEFAULT_RECOMMENDATION_LIMIT = 4;
export const MAX_RECOMMENDATION_LIMIT = 12;

export const recommendationQuerySchema = z
  .object({
    type: z.enum(RECOMMENDATION_TYPES),
    productId: z.string().trim().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(MAX_RECOMMENDATION_LIMIT).optional().default(DEFAULT_RECOMMENDATION_LIMIT)
  })
  .superRefine((value, context) => {
    if ((value.type === "related" || value.type === "similar") && !value.productId) {
      context.addIssue({
        code: "custom",
        message: "Product ID is required for related and similar recommendations.",
        path: ["productId"]
      });
    }
  });

export type RecommendationQuery = z.infer<typeof recommendationQuerySchema>;

export function parseRecommendationQuery(input: Record<string, string | string[] | undefined> | URLSearchParams) {
  const params =
    input instanceof URLSearchParams
      ? Object.fromEntries(input.entries())
      : input;

  return recommendationQuerySchema.parse({
    type: params.type,
    productId: params.productId,
    limit: params.limit
  });
}
