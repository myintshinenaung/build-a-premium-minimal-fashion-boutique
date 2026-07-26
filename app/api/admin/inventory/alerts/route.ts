import { createInventoryGetRoute } from "@/features/inventory/application/inventory-route";
import { getInventoryAlerts, handleInventoryApiError } from "@/features/inventory/application/inventory-intelligence-service";

export const GET = createInventoryGetRoute(async () => getInventoryAlerts(), handleInventoryApiError);
