import { createAnalyticsRoute } from "@/features/analytics/application/analytics-route";
import { getAnalyticsOverview, handleAnalyticsApiError } from "@/features/analytics/application/analytics-service";

export const GET = createAnalyticsRoute(getAnalyticsOverview, handleAnalyticsApiError);
