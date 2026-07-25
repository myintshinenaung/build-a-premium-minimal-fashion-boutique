import {
  ReservationConflictError,
  ReservationNotFoundError
} from "@/features/inventory/application/inventory-errors";
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

  const updated = await reservationRepository.updateStatus(reservationId, "released");

  if (!updated) {
    throw new ReservationNotFoundError("Reservation not found.");
  }

  return updated;
}
