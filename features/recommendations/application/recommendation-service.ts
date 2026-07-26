import { ZodError } from "zod";
import { NextResponse } from "next/server";
import {
  RecommendationNotFoundError,
  RecommendationValidationError
} from "@/features/recommendations/application/recommendation-errors";
import { runRecommendationEngine } from "@/features/recommendations/domain/recommendation-engine";
import { parseRecommendationQuery } from "@/features/recommendations/domain/recommendation-schemas";
import { recommendationRepository } from "@/features/recommendations/infrastructure/recommendation-repository";
import type { RecommendationResponse } from "@/types/recommendation";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid recommendation query.";
}

async function ensureProductExists(productId: string) {
  const catalog = await recommendationRepository.loadRecommendationCatalog();
  const product = catalog.find((entry) => entry.id === productId);

  if (!product) {
    throw new RecommendationNotFoundError("Product not found.");
  }

  return catalog;
}

export async function getRecommendations(
  input: Record<string, string | string[] | undefined> | URLSearchParams
): Promise<RecommendationResponse> {
  try {
    const query = parseRecommendationQuery(input);
    const catalog =
      query.productId != null ? await ensureProductExists(query.productId) : await recommendationRepository.loadRecommendationCatalog();
    const items = runRecommendationEngine(catalog, query.type, {
      productId: query.productId,
      limit: query.limit
    });

    return {
      type: query.type,
      items,
      total: items.length,
      productId: query.productId
    };
  } catch (error) {
    if (error instanceof ZodError) {
      throw new RecommendationValidationError(formatZodError(error));
    }

    throw error;
  }
}

export async function getRelatedProducts(productId: string, limit = 4) {
  return getRecommendations({ type: "related", productId, limit: String(limit) });
}

export async function getSimilarProducts(productId: string, limit = 4) {
  return getRecommendations({ type: "similar", productId, limit: String(limit) });
}

export async function getTrendingProducts(limit = 4, excludeProductId?: string) {
  return getRecommendations({
    type: "trending",
    limit: String(limit),
    ...(excludeProductId ? { productId: excludeProductId } : {})
  });
}

export async function getBestSellerRecommendations(limit = 4) {
  return getRecommendations({ type: "best-sellers", limit: String(limit) });
}

export async function getNewArrivalRecommendations(limit = 4) {
  return getRecommendations({ type: "new-arrivals", limit: String(limit) });
}

export function handleRecommendationApiError(error: unknown) {
  if (error instanceof RecommendationValidationError) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (error instanceof RecommendationNotFoundError) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  const message = error instanceof Error ? error.message : "Unable to load recommendations.";
  return NextResponse.json({ message }, { status: 500 });
}
