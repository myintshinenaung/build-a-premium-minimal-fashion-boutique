export class ReviewValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewValidationError";
  }
}

export class ReviewNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewNotFoundError";
  }
}

export class ReviewAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewAccessError";
  }
}

export class VerifiedPurchaseRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VerifiedPurchaseRequiredError";
  }
}
