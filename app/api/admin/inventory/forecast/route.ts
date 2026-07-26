import { createInventoryGetRoute } from "@/features/inventory/application/inventory-route";
import { getInventoryForecast, handleInventoryApiError } from "@/features/inventory/application/inventory-intelligence-service";

export const GET = createInventoryGetRoute(async () => getInventoryForecast(), handleInventoryApiError);
