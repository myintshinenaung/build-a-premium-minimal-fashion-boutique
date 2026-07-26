import {
  ReservationConflictError,
  ReservationNotFoundError
} from "@/features/inventory/application/inventory-errors";
import { recordInventoryMovement } from "@/features/inventory/application/record-movement";
import { reservationRepository } from "@/features/inventory/infrastructure/reservation-repository";
import type { InventoryReservation } from "@/features/inventory/domain/reservation";

export async function releaseReservation(reservationId: string): Promise<InventoryReservation> {
  const reservation = await reservationRepository.getById(reservationId);

  if (!reservation) {
    throw new ReservationNotFoundError("Reservation not found.");
  }

  if (reservation.status !== "active") {
    throw new ReservationConflictError("Only active reservations can be released.");
  }

  const current = await reservationRepository.getProductStock(reservation.productId);
  const updated = await reservationRepository.updateStatus(reservationId, "released");

  if (!updated) {
    throw new ReservationNotFoundError("Reservation not found.");
  }

  await recordInventoryMovement({
    productId: reservation.productId,
    movementType: "release",
    quantity: reservation.quantity,
    quantityBefore: current,
    quantityAfter: current,
    userName: "System",
    reason: "Reservation released",
    referenceType: reservation.referenceType,
    referenceId: reservation.referenceId,
    syncProductStock: false
  });

  return updated;
}
