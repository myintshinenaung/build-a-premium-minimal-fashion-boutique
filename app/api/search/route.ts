import { NextResponse } from "next/server";
import { handleSearchApiError, searchProductCatalog } from "@/features/search/application/search-service";
import { limitPayloadSize, MAX_API_PAYLOAD_BYTES, withPublicCacheHeaders } from "@/features/performance/server";

export async function GET(request: Request) {
  const startedAt = performance.now();

  try {
    const { searchParams } = new URL(request.url);
    const results = limitPayloadSize(await searchProductCatalog(searchParams), MAX_API_PAYLOAD_BYTES);
    const response = withPublicCacheHeaders(NextResponse.json(results), 30, 120);
    response.headers.set("Server-Timing", `app;dur=${(performance.now() - startedAt).toFixed(2)}`);
    return response;
  } catch (error) {
    return handleSearchApiError(error);
  }
}
