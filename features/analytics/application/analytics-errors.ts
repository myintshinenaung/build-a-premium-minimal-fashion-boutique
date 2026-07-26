export class AnalyticsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalyticsValidationError";
  }
}
