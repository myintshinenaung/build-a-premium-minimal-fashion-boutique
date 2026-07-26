import {
  ReservationConflictError,
  ReservationNotFoundError
} from "@/features/inventory/application/inventory-errors";
import { recordInventoryMovement } from "@/features/inventory/application/record-movement";
import { warehouseRepository } from "@/features/inventory/infrastructure/inventory-intelligence-repository";
import { reservationRepository } from "@/features/inventory/infrastructure/reservation-repository";
import type { InventoryReservation } from "@/features/inventory/domain/reservation";

export async function consumeReservation(reservationId: string): Promise<InventoryReservation> {
  const reservation = await reservationRepository.getById(reservationId);

  if (!reservation) {
    throw new ReservationNotFoundError("Reservation not found.");
  }

  if (reservation.status !== "active") {
    throw new ReservationConflictError("Only active reservations can be consumed.");
  }

  const before = await reservationRepository.getProductStock(reservation.productId);
  await reservationRepository.decrementProductStock(reservation.productId, reservation.quantity);
  const after = await reservationRepository.getProductStock(reservation.productId);

  const updated = await reservationRepository.updateStatus(reservationId, "consumed");

  if (!updated) {
    throw new ReservationNotFoundError("Reservation not found.");
  }

  await recordInventoryMovement({
    productId: reservation.productId,
    movementType: "sale",
    quantity: reservation.quantity,
    quantityBefore: before,
    quantityAfter: after,
    userName: "System",
    reason: "Reservation consumed",
    referenceType: reservation.referenceType,
    referenceId: reservation.referenceId,
    syncProductStock: false
  });

  const warehouseId = await warehouseRepository.getDefaultWarehouseId();
  await warehouseRepository.setStock(warehouseId, reservation.productId, after);

  return updated;
}
