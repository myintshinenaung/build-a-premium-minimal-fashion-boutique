export const DEFAULT_RESERVATION_TIMEOUT_MINUTES = 15;

export function getReservationTimeoutMinutes() {
  const raw = process.env.INVENTORY_RESERVATION_TIMEOUT_MINUTES?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_RESERVATION_TIMEOUT_MINUTES;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_RESERVATION_TIMEOUT_MINUTES;
  }

  return parsed;
}

export function createReservationExpiryDate(timeoutMinutes = getReservationTimeoutMinutes()) {
  return new Date(Date.now() + timeoutMinutes * 60_000).toISOString();
}
