import { createInventoryPostRoute } from "@/features/inventory/application/inventory-route";
import { adjustInventory, handleInventoryApiError } from "@/features/inventory/application/inventory-intelligence-service";

export const POST = createInventoryPostRoute(adjustInventory, handleInventoryApiError);
