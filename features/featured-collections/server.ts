/** Server-only featured collection exports. */
export { featuredCollectionService } from "@/features/featured-collections/application/featured-collection-service";
export { getFeaturedCollectionsSectionData } from "@/features/featured-collections/application/storefront-featured-collections";
export {
  featuredCollectionRepository,
  type FeaturedCollectionCreateInput,
  type FeaturedCollectionUpdateInput
} from "@/features/featured-collections/infrastructure/featured-collection-repository";
