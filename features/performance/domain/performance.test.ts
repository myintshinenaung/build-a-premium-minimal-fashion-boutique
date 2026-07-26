import { describe, expect, it } from "vitest";
import { buildCursorPage, decodeCursor, encodeCursor } from "@/features/performance/domain/performance-schemas";
import { CACHE_TTLS, INVALIDATION_GROUPS } from "@/features/performance/domain/cache-tags";

describe("performance schemas", () => {
  it("encodes and decodes cursors", () => {
    const cursor = encodeCursor(24);
    expect(decodeCursor(cursor)).toBe(24);
    expect(decodeCursor(undefined)).toBe(0);
  });

  it("builds cursor pages", () => {
    const page = buildCursorPage([1, 2, 3, 4, 5], 0, 2);
    expect(page.items).toEqual([1, 2]);
    expect(page.hasMore).toBe(true);
    expect(decodeCursor(page.nextCursor)).toBe(2);
  });
});

describe("cache tags", () => {
  it("defines invalidation groups", () => {
    expect(INVALIDATION_GROUPS.catalog).toContain("products");
    expect(CACHE_TTLS.catalog).toBeGreaterThan(0);
  });
});
