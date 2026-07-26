import { createAnalyticsRoute } from "@/features/analytics/application/analytics-route";
import { getAnalyticsRevenue, handleAnalyticsApiError } from "@/features/analytics/application/analytics-service";

export const GET = createAnalyticsRoute(getAnalyticsRevenue, handleAnalyticsApiError);
