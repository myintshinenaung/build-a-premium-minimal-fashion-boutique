import { z } from "zod";
import { CACHE_TAGS } from "@/types/performance";

const cacheTagValues = Object.values(CACHE_TAGS) as [string, ...string[]];

export const clearCacheSchema = z.object({
  tags: z.array(z.enum(cacheTagValues)).optional(),
  all: z.boolean().optional()
});

export function parseClearCacheBody(body: unknown) {
  return clearCacheSchema.parse(body ?? {});
}

export function encodeCursor(value: number) {
  return Buffer.from(String(value), "utf8").toString("base64url");
}

export function decodeCursor(cursor: string | null | undefined) {
  if (!cursor) {
    return 0;
  }

  const decoded = Buffer.from(cursor, "base64url").toString("utf8");
  const offset = Number.parseInt(decoded, 10);
  return Number.isFinite(offset) && offset >= 0 ? offset : 0;
}

export function buildCursorPage<T>(items: T[], offset: number, pageSize: number) {
  const slice = items.slice(offset, offset + pageSize);
  const nextOffset = offset + slice.length;
  const hasMore = nextOffset < items.length;

  return {
    items: slice,
    pageSize,
    nextCursor: hasMore ? encodeCursor(nextOffset) : null,
    hasMore,
    total: items.length
  };
}

export function limitPayloadSize<T>(payload: T, maxBytes: number) {
  const serialized = JSON.stringify(payload);
  if (Buffer.byteLength(serialized, "utf8") <= maxBytes) {
    return payload;
  }

  throw new Error("Response payload exceeds the configured size limit.");
}
