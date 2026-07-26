import { createAnalyticsRoute } from "@/features/analytics/application/analytics-route";
import { getAnalyticsOrders, handleAnalyticsApiError } from "@/features/analytics/application/analytics-service";

export const GET = createAnalyticsRoute(getAnalyticsOrders, handleAnalyticsApiError);
