import type { Store, StoreStatus } from "@/types/store";

/** Product belongs to a store when store_id matches. */
export function productBelongsToStore(product: { storeId: string }, storeId: string) {
  return product.storeId === storeId;
}

/** Store category belongs to a store when store_id matches. */
export function categoryBelongsToStore(category: { storeId: string }, storeId: string) {
  return category.storeId === storeId;
}

/** Store is linked to a platform category via junction ids. */
export function storeLinkedToPlatformCategory(
  store: Pick<Store, "platformCategoryIds">,
  platformCategoryId: string
) {
  return store.platformCategoryIds.includes(platformCategoryId);
}

/** Filter stores by platform category id (includes inactive unless activeOnly). */
export function storesForPlatformCategory(
  stores: Array<Pick<Store, "id" | "platformCategoryIds" | "status">>,
  platformCategoryId: string,
  options?: { activeOnly?: boolean }
) {
  return stores.filter((store) => {
    if (!storeLinkedToPlatformCategory(store, platformCategoryId)) {
      return false;
    }

    if (options?.activeOnly && store.status !== "active") {
      return false;
    }

    return true;
  });
}

export function withStoreStatus<T extends { status: StoreStatus }>(store: T, status: StoreStatus): T {
  return { ...store, status };
}
