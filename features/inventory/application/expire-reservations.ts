import { reservationRepository } from "@/features/inventory/infrastructure/reservation-repository";

export async function expireReservations() {
  const expiredReservations = await reservationRepository.listExpiredActive();

  await Promise.all(expiredReservations.map((reservation) => reservationRepository.updateStatus(reservation.id, "released")));

  return expiredReservations.length;
}
