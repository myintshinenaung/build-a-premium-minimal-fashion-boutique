import { calculateAvailableStock, sumReservedQuantities } from "@/features/inventory/domain/stock-calculator";
import type { StockSnapshot } from "@/features/inventory/domain/reservation";
import { expireReservations } from "@/features/inventory/application/expire-reservations";
import { InventoryValidationError } from "@/features/inventory/application/inventory-errors";
import { reservationRepository } from "@/features/inventory/infrastructure/reservation-repository";
import { getVariantCurrentStock, loadProductForInventory } from "@/features/inventory/infrastructure/variant-stock";

export async function getAvailableStock(productId: string, variantId: string): Promise<StockSnapshot> {
  await expireReservations();

  const product = await loadProductForInventory(productId);

  if (!product) {
    throw new InventoryValidationError("Product not found.");
  }

  const current = getVariantCurrentStock(product, variantId);
  const reservations = await reservationRepository.listActiveByVariant(variantId);
  const reserved = sumReservedQuantities(reservations.map((reservation) => reservation.quantity));
  const available = calculateAvailableStock(current, reserved);

  return {
    productId,
    variantId,
    current,
    reserved,
    available,
    lowStockWarning: product.lowStockWarning,
    isLowStock: available <= product.lowStockWarning
  };
}
