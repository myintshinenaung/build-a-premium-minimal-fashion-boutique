import { createInventoryGetRoute } from "@/features/inventory/application/inventory-route";
import { getInventoryHistory, handleInventoryApiError } from "@/features/inventory/application/inventory-intelligence-service";

export const GET = createInventoryGetRoute(getInventoryHistory, handleInventoryApiError);
