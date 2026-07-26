import { NextResponse } from "next/server";
import {
  getRecommendations,
  handleRecommendationApiError
} from "@/features/recommendations/application/recommendation-service";
import { limitPayloadSize, MAX_API_PAYLOAD_BYTES, withPublicCacheHeaders } from "@/features/performance/server";

export async function GET(request: Request) {
  const startedAt = performance.now();

  try {
    const { searchParams } = new URL(request.url);
    const recommendations = limitPayloadSize(await getRecommendations(searchParams), MAX_API_PAYLOAD_BYTES);
    const response = withPublicCacheHeaders(NextResponse.json(recommendations), 60, 300);
    response.headers.set("Server-Timing", `app;dur=${(performance.now() - startedAt).toFixed(2)}`);
    return response;
  } catch (error) {
    return handleRecommendationApiError(error);
  }
}
