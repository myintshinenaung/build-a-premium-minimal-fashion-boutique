import { ACTIVE_PLATFORM_STORE_ID, PLATFORM_STORES, type PlatformStore } from "@/lib/storefront/brand";

export type FeaturedStoreCard = {
  id: string;
  label: string;
  description: string;
  monogram: string;
  href: string | null;
  isActive: boolean;
};

/** Maps current platform store constants into a Featured Stores UI contract. */
export function mapPlatformStoresToFeaturedCards(stores: PlatformStore[] = PLATFORM_STORES): FeaturedStoreCard[] {
  return stores.map((store) => ({
    id: store.id,
    label: store.label,
    description: store.description,
    monogram: store.monogram,
    href: store.href,
    isActive: store.id === ACTIVE_PLATFORM_STORE_ID
  }));
}
