import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { SearchValidationError } from "@/features/search/application/search-errors";
import { parseProductSearchParams } from "@/features/search/domain/product-search-schemas";
import { runProductSearch } from "@/features/search/domain/product-search";
import { productSearchRepository } from "@/features/search/infrastructure/product-search-repository";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid search query.";
}

export async function searchProductCatalog(input: Record<string, string | string[] | undefined> | URLSearchParams) {
  try {
    const query = parseProductSearchParams(input);
    const catalog = await productSearchRepository.loadSearchCatalog();
    return runProductSearch(catalog, query);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new SearchValidationError(formatZodError(error));
    }

    throw error;
  }
}

export function handleSearchApiError(error: unknown) {
  if (error instanceof SearchValidationError) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "Unable to search products.";
  return NextResponse.json({ message }, { status: 500 });
}
