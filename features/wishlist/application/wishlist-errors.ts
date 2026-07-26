export class WishlistValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WishlistValidationError";
  }
}

export class WishlistItemNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WishlistItemNotFoundError";
  }
}
