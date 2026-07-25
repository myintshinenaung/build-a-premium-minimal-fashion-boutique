export function calculateAvailableStock(current: number, reserved: number) {
  return Math.max(0, current - reserved);
}

export function canReserveStock(available: number, quantity: number) {
  return quantity > 0 && quantity <= available;
}

export function isReservationExpired(expiresAt: string, now: Date = new Date()) {
  return new Date(expiresAt).getTime() <= now.getTime();
}

export function sumReservedQuantities(quantities: number[]) {
  return quantities.reduce((total, quantity) => total + quantity, 0);
}
