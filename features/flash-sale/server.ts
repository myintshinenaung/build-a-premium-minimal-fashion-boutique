/** Server-only flash sale exports. */
export { flashSaleService } from "@/features/flash-sale/application/flash-sale-service";
export { getFlashSaleSectionData } from "@/features/flash-sale/application/storefront-flash-sale";
export {
  flashSaleRepository,
  type FlashSaleCreateInput,
  type FlashSaleUpdateInput
} from "@/features/flash-sale/infrastructure/flash-sale-repository";
