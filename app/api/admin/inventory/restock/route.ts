import { createInventoryPostRoute } from "@/features/inventory/application/inventory-route";
import { handleInventoryApiError, restockInventory } from "@/features/inventory/application/inventory-intelligence-service";

export const POST = createInventoryPostRoute(restockInventory, handleInventoryApiError);
