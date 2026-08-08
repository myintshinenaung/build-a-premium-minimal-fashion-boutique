import type { Metadata } from "next";
import { StoreManager } from "@/features/stores/client";
import { storeService } from "@/features/stores/server";

export const metadata: Metadata = {
  title: "Stores"
};

export const dynamic = "force-dynamic";

export default async function AdminStoresPage() {
  const [stores, platformCategories] = await Promise.all([
    storeService.list(),
    storeService.listPlatformCategories()
  ]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Stores</h1>
        <p className="mt-2 text-sm text-stone">
          NOVORA Main Admin store foundation. Create, edit, and activate marketplace stores.
        </p>
      </div>
      <StoreManager initialStores={stores} platformCategories={platformCategories} />
    </section>
  );
}
