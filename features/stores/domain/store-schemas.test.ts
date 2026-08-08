import { describe, expect, it } from "vitest";
import {
  buildStoreHref,
  deriveMonogram,
  slugifyStoreName,
  storeInputSchema,
  storeUpdateSchema
} from "@/features/stores/domain/store-schemas";

describe("store schemas and helpers", () => {
  it("validates store create input", () => {
    expect(
      storeInputSchema.parse({
        name: "Daily Outfit",
        slug: "daily-outfit",
        status: "active",
        platformCategoryIds: ["pc-fashion"]
      })
    ).toMatchObject({
      name: "Daily Outfit",
      slug: "daily-outfit",
      status: "active"
    });
  });

  it("rejects invalid slug", () => {
    expect(
      storeInputSchema.safeParse({
        name: "Bad",
        slug: "Bad Slug"
      }).success
    ).toBe(false);
  });

  it("parses status-only updates without wiping other fields", () => {
    expect(storeUpdateSchema.parse({ status: "active" })).toEqual({ status: "active" });
    expect(storeUpdateSchema.parse({ status: "inactive" })).toEqual({ status: "inactive" });
  });

  it("builds active store hrefs only", () => {
    expect(buildStoreHref({ slug: "daily-outfit", status: "active" })).toBe("/stores/daily-outfit");
    expect(buildStoreHref({ slug: "beauty", status: "inactive" })).toBeNull();
  });

  it("slugifies and derives monograms", () => {
    expect(slugifyStoreName("Myanmar Vibe Fashion")).toBe("myanmar-vibe-fashion");
    expect(deriveMonogram("Daily Outfit")).toBe("DO");
  });
});
