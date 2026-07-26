import { createAnalyticsRoute } from "@/features/analytics/application/analytics-route";
import { getAnalyticsSales, handleAnalyticsApiError } from "@/features/analytics/application/analytics-service";

export const GET = createAnalyticsRoute(getAnalyticsSales, handleAnalyticsApiError);
