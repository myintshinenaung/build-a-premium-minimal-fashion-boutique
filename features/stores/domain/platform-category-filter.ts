import type { Store } from "@/types/store";

/** Returns active stores linked to a platform category. */
export function filterStoresByPlatformCategory<T extends Pick<Store, "platformCategoryIds" | "status">>(
  stores: T[],
  platformCategoryId: string
) {
  return stores.filter(
    (store) => store.status === "active" && store.platformCategoryIds.includes(platformCategoryId)
  );
}
