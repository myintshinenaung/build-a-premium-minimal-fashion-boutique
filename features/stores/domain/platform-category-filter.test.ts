import { describe, expect, it } from "vitest";
import { filterStoresByPlatformCategory } from "@/features/stores/domain/platform-category-filter";

describe("filterStoresByPlatformCategory", () => {
  const stores = [
    { id: "daily-outfit", platformCategoryIds: ["pc-fashion"], status: "active" as const },
    { id: "beauty", platformCategoryIds: ["pc-beauty"], status: "active" as const },
    { id: "gadgets", platformCategoryIds: ["pc-electronics"], status: "inactive" as const },
    { id: "street-wear", platformCategoryIds: ["pc-fashion"], status: "inactive" as const }
  ];

  it("returns only active Fashion stores", () => {
    expect(filterStoresByPlatformCategory(stores, "pc-fashion").map((store) => store.id)).toEqual(["daily-outfit"]);
  });

  it("returns only active Beauty stores", () => {
    expect(filterStoresByPlatformCategory(stores, "pc-beauty").map((store) => store.id)).toEqual(["beauty"]);
  });

  it("returns no Electronics stores when none are active", () => {
    expect(filterStoresByPlatformCategory(stores, "pc-electronics")).toEqual([]);
  });
});
