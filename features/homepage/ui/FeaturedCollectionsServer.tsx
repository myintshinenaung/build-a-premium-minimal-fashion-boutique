import { getFeaturedCollectionsSectionData } from "@/features/featured-collections/server";
import { FeaturedCollections } from "@/features/homepage/ui/FeaturedCollections";

export async function FeaturedCollectionsServer() {
  const data = await getFeaturedCollectionsSectionData();

  if (!data) {
    return null;
  }

  return <FeaturedCollections data={data} />;
}
