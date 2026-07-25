export class ShippingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShippingValidationError";
  }
}

export class ShippingConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShippingConflictError";
  }
}
