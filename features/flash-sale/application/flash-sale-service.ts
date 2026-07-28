import {
  flashSaleRepository,
  type FlashSaleCreateInput,
  type FlashSaleUpdateInput
} from "@/features/flash-sale/infrastructure/flash-sale-repository";

export type { FlashSaleCreateInput, FlashSaleUpdateInput };

export const flashSaleService = {
  getFlashSales() {
    return flashSaleRepository.list();
  },

  getFlashSale(id: string) {
    return flashSaleRepository.getWithItems(id);
  },

  getActiveFlashSaleForStore(storeId: string) {
    return flashSaleRepository.getActiveForStore(storeId);
  },

  createFlashSale(input: FlashSaleCreateInput) {
    return flashSaleRepository.create(input);
  },

  updateFlashSale(id: string, input: FlashSaleUpdateInput) {
    return flashSaleRepository.update(id, input);
  },

  deleteFlashSale(id: string) {
    return flashSaleRepository.delete(id);
  }
};
