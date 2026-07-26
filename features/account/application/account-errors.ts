export class AccountValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountValidationError";
  }
}

export class AccountNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountNotFoundError";
  }
}

export class AddressNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AddressNotFoundError";
  }
}

export class OrderAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderAccessError";
  }
}
