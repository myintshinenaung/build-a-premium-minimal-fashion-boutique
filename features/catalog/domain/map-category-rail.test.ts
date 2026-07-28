import { describe, expect, it } from "vitest";
import { mapAdminCategoryToRailItem } from "@/features/catalog/domain/map-category-rail";
import type { AdminCategory } from "@/types/admin";

const sampleCategory: AdminCategory = {
  id: "cat-dresses",
  name: "Dresses",
  slug: "dresses",
  description: "Evening silhouettes",
  image: "/images/ivory-dress.png",
  productCount: 4,
  sortOrder: 2,
  storeId: "daily-outfit",
  status: "Published"
};

describe("mapAdminCategoryToRailItem", () => {
  it("maps dashboard category fields without hardcoded fallbacks", () => {
    const item = mapAdminCategoryToRailItem(sampleCategory);

    expect(item.name).toBe("Dresses");
    expect(item.slug).toBe("dresses");
    expect(item.image).toBe("/images/ivory-dress.png");
    expect(item.sortOrder).toBe(2);
  });
});
