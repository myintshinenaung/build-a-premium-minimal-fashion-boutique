import { NextResponse } from "next/server";
import { handleSearchApiError, searchProductCatalog } from "@/features/search/application/search-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const results = await searchProductCatalog(searchParams);
    return NextResponse.json(results);
  } catch (error) {
    return handleSearchApiError(error);
  }
}
