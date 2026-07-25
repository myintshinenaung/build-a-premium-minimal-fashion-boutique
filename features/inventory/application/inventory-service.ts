import { calculateAvailableStock, sumReservedQuantities } from "@/features/inventory/domain/stock-calculator";
import type { ProductInventorySnapshot } from "@/features/inventory/domain/reservation";
import { expireReservations } from "@/features/inventory/application/expire-reservations";
import { productRepository } from "@/features/catalog/infrastructure/product-repository";
import { reservationRepository } from "@/features/inventory/infrastructure/reservation-repository";

export const inventoryService = {
  async listProductInventory(): Promise<ProductInventorySnapshot[]> {
    await expireReservations();

    const products = await productRepository.list({ sortBy: "name", sortDirection: "asc" });

    return Promise.all(
      products.map(async (product) => {
        const reservations = await reservationRepository.listActiveByProduct(product.id);
        const reserved = sumReservedQuantities(reservations.map((reservation) => reservation.quantity));
        const available = calculateAvailableStock(product.stockQuantity, reserved);

        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          current: product.stockQuantity,
          reserved,
          available,
          lowStockWarning: product.lowStockWarning,
          isLowStock: available <= product.lowStockWarning
        };
      })
    );
  }
};
