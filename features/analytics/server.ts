/** Server-only analytics exports. */
export {
  getAnalyticsCustomers,
  getAnalyticsOrders,
  getAnalyticsOverview,
  getAnalyticsProducts,
  getAnalyticsRevenue,
  getAnalyticsReviews,
  getAnalyticsSales,
  handleAnalyticsApiError
} from "@/features/analytics/application/analytics-service";
export { AnalyticsValidationError } from "@/features/analytics/application/analytics-errors";
export { analyticsRepository } from "@/features/analytics/infrastructure/analytics-repository";
