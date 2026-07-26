export class PromotionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromotionValidationError";
  }
}

export class CouponNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CouponNotFoundError";
  }
}
