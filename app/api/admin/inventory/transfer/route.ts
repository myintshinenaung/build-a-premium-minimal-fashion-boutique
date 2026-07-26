import { createInventoryPostRoute } from "@/features/inventory/application/inventory-route";
import { handleInventoryApiError, transferInventory } from "@/features/inventory/application/inventory-intelligence-service";

export const POST = createInventoryPostRoute(transferInventory, handleInventoryApiError);
