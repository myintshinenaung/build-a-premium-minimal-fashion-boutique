export class InventoryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InventoryValidationError";
  }
}

export class InsufficientStockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientStockError";
  }
}

export class ReservationNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReservationNotFoundError";
  }
}

export class ReservationConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReservationConflictError";
  }
}
