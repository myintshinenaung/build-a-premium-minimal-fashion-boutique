import { createInventoryGetRoute, createInventoryPostRoute } from "@/features/inventory/application/inventory-route";
import {
  adjustInventory,
  getInventoryAlerts,
  getInventoryDashboard,
  getInventoryForecast,
  getInventoryHistory,
  handleInventoryApiError,
  restockInventory,
  transferInventory
} from "@/features/inventory/application/inventory-intelligence-service";

export const GET = createInventoryGetRoute(async () => getInventoryDashboard(), handleInventoryApiError);
