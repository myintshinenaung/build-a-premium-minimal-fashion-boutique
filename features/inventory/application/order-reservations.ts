import type { ValidatedCartLine } from "@/features/checkout/application/validate-cart";
import { InsufficientStockError } from "@/features/inventory/application/inventory-errors";
import { consumeReservation } from "@/features/inventory/application/consume-reservation";
import { releaseReservation } from "@/features/inventory/application/release-reservation";
import { reserveStock } from "@/features/inventory/application/reserve-stock";
import { createReservationExpiryDate } from "@/features/inventory/domain/reservation-timeout";
import { reservationRepository } from "@/features/inventory/infrastructure/reservation-repository";
import type { InventoryReservation } from "@/features/inventory/domain/reservation";

const ORDER_REFERENCE_TYPE = "order";
const ORDER_RESERVATION_TIMEOUT_MINUTES = 60;

export async function reserveOrderInventory(orderId: string, items: ValidatedCartLine[]): Promise<InventoryReservation[]> {
  const reservations: InventoryReservation[] = [];

  try {
    for (const item of items) {
      const reservation = await reserveStock({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        referenceType: ORDER_REFERENCE_TYPE,
        referenceId: orderId,
        expiresAt: createReservationExpiryDate(ORDER_RESERVATION_TIMEOUT_MINUTES)
      });

      reservations.push(reservation);
    }

    return reservations;
  } catch (error) {
    await releaseReservations(reservations.map((reservation) => reservation.id));
    throw error;
  }
}

export async function releaseOrderReservations(orderId: string) {
  const reservations = await reservationRepository.listActiveByReference(ORDER_REFERENCE_TYPE, orderId);

  if (reservations.length === 0) {
    return [];
  }

  return Promise.all(reservations.map((reservation) => releaseReservation(reservation.id)));
}

export async function consumeOrderReservations(orderId: string) {
  const reservations = await reservationRepository.listActiveByReference(ORDER_REFERENCE_TYPE, orderId);

  if (reservations.length === 0) {
    return [];
  }

  return Promise.all(reservations.map((reservation) => consumeReservation(reservation.id)));
}

async function releaseReservations(reservationIds: string[]) {
  await Promise.all(
    reservationIds.map(async (reservationId) => {
      try {
        await releaseReservation(reservationId);
      } catch {
        // Best-effort rollback while preserving the original checkout error.
      }
    })
  );
}

export { InsufficientStockError };
