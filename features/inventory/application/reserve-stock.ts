import { reserveStockInputSchema } from "@/features/inventory/domain/reservation-schemas";
import { createReservationExpiryDate } from "@/features/inventory/domain/reservation-timeout";
import { canReserveStock } from "@/features/inventory/domain/stock-calculator";
import {
  InsufficientStockError,
  InventoryValidationError
} from "@/features/inventory/application/inventory-errors";
import { getAvailableStock } from "@/features/inventory/application/get-available-stock";
import { reservationRepository } from "@/features/inventory/infrastructure/reservation-repository";
import { loadProductForInventory } from "@/features/inventory/infrastructure/variant-stock";
import type { InventoryReservation } from "@/features/inventory/domain/reservation";
import { ZodError } from "zod";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid reservation request.";
}

function createReservationId() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RES-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

export async function reserveStock(input: unknown): Promise<InventoryReservation> {
  let parsed;

  try {
    parsed = reserveStockInputSchema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new InventoryValidationError(formatZodError(error));
    }

    throw error;
  }

  const stock = await getAvailableStock(parsed.productId, parsed.variantId);

  if (!canReserveStock(stock.available, parsed.quantity)) {
    throw new InsufficientStockError(`Only ${stock.available} units available for this variant.`);
  }

  const productReservations = await reservationRepository.listActiveByProduct(parsed.productId);
  const productReserved = productReservations.reduce((total, reservation) => total + reservation.quantity, 0);
  const product = await loadProductForInventory(parsed.productId);

  if (!product) {
    throw new InventoryValidationError("Product not found.");
  }

  const productAvailable = Math.max(0, product.stockQuantity - productReserved);

  if (parsed.quantity > productAvailable) {
    throw new InsufficientStockError(`Only ${productAvailable} units available for this product.`);
  }

  return reservationRepository.create({
    id: createReservationId(),
    productId: parsed.productId,
    variantId: parsed.variantId,
    quantity: parsed.quantity,
    referenceType: parsed.referenceType ?? null,
    referenceId: parsed.referenceId ?? null,
    expiresAt: parsed.expiresAt ?? createReservationExpiryDate()
  });
}
