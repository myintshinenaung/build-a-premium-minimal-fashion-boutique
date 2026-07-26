import type { ProductInventorySnapshot } from "@/features/inventory/domain/reservation";

export const INVENTORY_MOVEMENT_TYPES = [
  "purchase",
  "sale",
  "reservation",
  "release",
  "return",
  "damage",
  "manual_adjustment",
  "warehouse_transfer"
] as const;

export type InventoryMovementType = (typeof INVENTORY_MOVEMENT_TYPES)[number];

export type InventoryAlertLevel = "low_stock" | "critical_stock" | "out_of_stock" | "overstock";

export type InventoryWarehouse = {
  id: string;
  name: string;
  code: string;
  isDefault: boolean;
  createdAt: string;
};

export type InventoryMovement = {
  id: string;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  movementType: InventoryMovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  userId: string | null;
  userName: string;
  reason: string;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
};

export type InventoryAlertSettings = {
  lowStockThreshold: number;
  criticalStockThreshold: number;
  overstockThreshold: number;
};

export type InventoryProductAlertSettings = InventoryAlertSettings & {
  productId: string;
};

export type InventoryAlert = {
  productId: string;
  productName: string;
  sku: string;
  available: number;
  current: number;
  reserved: number;
  level: InventoryAlertLevel;
  threshold: number;
};

export type InventoryDashboardResponse = {
  kpis: {
    totalStock: number;
    availableStock: number;
    reservedStock: number;
    lowStock: number;
    outOfStock: number;
    incomingStock: number;
    inventoryValueMmk: number;
  };
  warehouses: InventoryWarehouse[];
  items: ProductInventorySnapshot[];
};

export type InventoryHistoryResponse = {
  items: InventoryMovement[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type InventoryAlertsResponse = {
  settings: InventoryAlertSettings;
  alerts: InventoryAlert[];
};

export type InventoryForecastItem = {
  productId: string;
  productName: string;
  sku: string;
  available: number;
  dailySalesVelocity: number;
  weeklyDemand: number;
  monthlyDemand: number;
  estimatedDaysRemaining: number | null;
  suggestedReorderQuantity: number;
};

export type InventoryForecastResponse = {
  items: InventoryForecastItem[];
};

export type InventoryTransferResponse = {
  movement: InventoryMovement;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
};
