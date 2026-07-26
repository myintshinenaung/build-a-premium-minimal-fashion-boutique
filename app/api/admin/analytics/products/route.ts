import { createAnalyticsRoute } from "@/features/analytics/application/analytics-route";
import { getAnalyticsProducts, handleAnalyticsApiError } from "@/features/analytics/application/analytics-service";

export const GET = createAnalyticsRoute(getAnalyticsProducts, handleAnalyticsApiError);
