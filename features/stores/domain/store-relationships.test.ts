import { describe, expect, it } from "vitest";
import {
  categoryBelongsToStore,
  productBelongsToStore,
  storeLinkedToPlatformCategory,
  storesForPlatformCategory,
  withStoreStatus
} from "@/features/stores/domain/store-relationships";

describe("store relationships", () => {
  it("scopes products to a store", () => {
    expect(productBelongsToStore({ storeId: "daily-outfit" }, "daily-outfit")).toBe(true);
    expect(productBelongsToStore({ storeId: "daily-outfit" }, "beauty")).toBe(false);
  });

  it("scopes store categories to a store", () => {
    expect(categoryBelongsToStore({ storeId: "daily-outfit" }, "daily-outfit")).toBe(true);
    expect(categoryBelongsToStore({ storeId: "beauty" }, "daily-outfit")).toBe(false);
  });

  it("links stores to platform categories", () => {
    const store = { platformCategoryIds: ["pc-fashion"] };
    expect(storeLinkedToPlatformCategory(store, "pc-fashion")).toBe(true);
    expect(storeLinkedToPlatformCategory(store, "pc-beauty")).toBe(false);
  });

  it("filters Fashion / Beauty / Electronics stores without mixing categories", () => {
    const stores = [
      { id: "daily-outfit", platformCategoryIds: ["pc-fashion"], status: "active" as const },
      { id: "street-wear", platformCategoryIds: ["pc-fashion"], status: "inactive" as const },
      { id: "beauty", platformCategoryIds: ["pc-beauty"], status: "inactive" as const },
      { id: "gadgets", platformCategoryIds: ["pc-electronics"], status: "active" as const }
    ];

    expect(storesForPlatformCategory(stores, "pc-fashion", { activeOnly: true }).map((s) => s.id)).toEqual([
      "daily-outfit"
    ]);
    expect(storesForPlatformCategory(stores, "pc-beauty").map((s) => s.id)).toEqual(["beauty"]);
    expect(storesForPlatformCategory(stores, "pc-electronics", { activeOnly: true }).map((s) => s.id)).toEqual([
      "gadgets"
    ]);
  });

  it("activates and deactivates a store record", () => {
    const store = { id: "daily-outfit", status: "inactive" as const };
    expect(withStoreStatus(store, "active").status).toBe("active");
    expect(withStoreStatus(store, "inactive").status).toBe("inactive");
  });
});
