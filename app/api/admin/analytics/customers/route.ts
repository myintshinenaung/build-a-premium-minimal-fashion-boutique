import { createAnalyticsRoute } from "@/features/analytics/application/analytics-route";
import { getAnalyticsCustomers, handleAnalyticsApiError } from "@/features/analytics/application/analytics-service";

export const GET = createAnalyticsRoute(getAnalyticsCustomers, handleAnalyticsApiError);
