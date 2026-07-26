import { createAnalyticsRoute } from "@/features/analytics/application/analytics-route";
import { getAnalyticsReviews, handleAnalyticsApiError } from "@/features/analytics/application/analytics-service";

export const GET = createAnalyticsRoute(getAnalyticsReviews, handleAnalyticsApiError);
