export class RecommendationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecommendationValidationError";
  }
}

export class RecommendationNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecommendationNotFoundError";
  }
}
