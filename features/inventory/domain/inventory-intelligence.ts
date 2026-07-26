import { calculateAvailableStock } from "@/features/inventory/domain/stock-calculator";
import type { ProductInventorySnapshot } from "@/features/inventory/domain/reservation";
import type {
  InventoryAlert,
  InventoryAlertLevel,
  InventoryAlertSettings,
  InventoryDashboardResponse,
  InventoryForecastItem,
  InventoryProductAlertSettings
} from "@/types/inventory-intelligence";

type ProductSalesRecord = {
  productId: string;
  unitsSold: number;
  daysInRange: number;
};

export function resolveAlertSettings(
  globalSettings: InventoryAlertSettings,
  productSettings?: Partial<InventoryProductAlertSettings>
): InventoryAlertSettings {
  return {
    lowStockThreshold: productSettings?.lowStockThreshold ?? globalSettings.lowStockThreshold,
    criticalStockThreshold: productSettings?.criticalStockThreshold ?? globalSettings.criticalStockThreshold,
    overstockThreshold: productSettings?.overstockThreshold ?? globalSettings.overstockThreshold
  };
}

export function classifyInventoryAlert(
  item: ProductInventorySnapshot,
  settings: InventoryAlertSettings
): InventoryAlert | null {
  if (item.available <= 0) {
    return {
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      available: item.available,
      current: item.current,
      reserved: item.reserved,
      level: "out_of_stock",
      threshold: 0
    };
  }

  if (item.available <= settings.criticalStockThreshold) {
    return {
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      available: item.available,
      current: item.current,
      reserved: item.reserved,
      level: "critical_stock",
      threshold: settings.criticalStockThreshold
    };
  }

  if (item.available <= settings.lowStockThreshold) {
    return {
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      available: item.available,
      current: item.current,
      reserved: item.reserved,
      level: "low_stock",
      threshold: settings.lowStockThreshold
    };
  }

  if (item.available >= settings.overstockThreshold) {
    return {
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      available: item.available,
      current: item.current,
      reserved: item.reserved,
      level: "overstock",
      threshold: settings.overstockThreshold
    };
  }

  return null;
}

export function buildInventoryAlerts(
  items: ProductInventorySnapshot[],
  globalSettings: InventoryAlertSettings,
  productSettings: Map<string, InventoryProductAlertSettings>
) {
  const alerts: InventoryAlert[] = [];

  for (const item of items) {
    const settings = resolveAlertSettings(globalSettings, productSettings.get(item.productId));
    const alert = classifyInventoryAlert(item, settings);

    if (alert) {
      alerts.push(alert);
    }
  }

  const levelOrder: Record<InventoryAlertLevel, number> = {
    out_of_stock: 0,
    critical_stock: 1,
    low_stock: 2,
    overstock: 3
  };

  return alerts.sort(
    (left, right) => levelOrder[left.level] - levelOrder[right.level] || left.available - right.available
  );
}

export function buildInventoryDashboard(
  items: ProductInventorySnapshot[],
  incomingStock: number,
  inventoryValueMmk: number,
  warehouses: InventoryDashboardResponse["warehouses"]
): InventoryDashboardResponse {
  const totalStock = items.reduce((sum, item) => sum + item.current, 0);
  const reservedStock = items.reduce((sum, item) => sum + item.reserved, 0);
  const availableStock = items.reduce((sum, item) => sum + item.available, 0);

  return {
    kpis: {
      totalStock,
      availableStock,
      reservedStock,
      lowStock: items.filter((item) => item.isLowStock && item.available > 0).length,
      outOfStock: items.filter((item) => item.available <= 0).length,
      incomingStock,
      inventoryValueMmk
    },
    warehouses,
    items
  };
}

export function buildInventoryForecast(
  items: ProductInventorySnapshot[],
  salesByProduct: ProductSalesRecord[],
  globalSettings: InventoryAlertSettings
): InventoryForecastItem[] {
  const salesMap = new Map(salesByProduct.map((entry) => [entry.productId, entry]));

  return items
    .map((item) => {
      const sales = salesMap.get(item.productId);
      const days = Math.max(sales?.daysInRange ?? 30, 1);
      const unitsSold = sales?.unitsSold ?? 0;
      const dailySalesVelocity = Math.round((unitsSold / days) * 100) / 100;
      const weeklyDemand = Math.round(dailySalesVelocity * 7 * 100) / 100;
      const monthlyDemand = Math.round(dailySalesVelocity * 30 * 100) / 100;
      const estimatedDaysRemaining =
        dailySalesVelocity > 0 ? Math.max(0, Math.floor(item.available / dailySalesVelocity)) : null;
      const targetStock = Math.max(globalSettings.lowStockThreshold * 2, weeklyDemand * 2);
      const suggestedReorderQuantity = Math.max(0, Math.ceil(targetStock - item.available));

      return {
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        available: item.available,
        dailySalesVelocity,
        weeklyDemand,
        monthlyDemand,
        estimatedDaysRemaining,
        suggestedReorderQuantity
      };
    })
    .sort((left, right) => {
      const leftDays = left.estimatedDaysRemaining ?? Number.MAX_SAFE_INTEGER;
      const rightDays = right.estimatedDaysRemaining ?? Number.MAX_SAFE_INTEGER;
      return leftDays - rightDays || right.dailySalesVelocity - left.dailySalesVelocity;
    });
}

export function calculateInventoryValue(items: ProductInventorySnapshot[], costByProduct: Map<string, number>) {
  return items.reduce((sum, item) => sum + item.current * (costByProduct.get(item.productId) ?? 0), 0);
}

export function mergeWarehouseStockIntoSnapshots(
  items: ProductInventorySnapshot[],
  warehouseQuantities: Map<string, number>
) {
  return items.map((item) => {
    const warehouseQuantity = warehouseQuantities.get(item.productId);
    if (warehouseQuantity == null) {
      return item;
    }

    const available = calculateAvailableStock(warehouseQuantity, item.reserved);
    return {
      ...item,
      current: warehouseQuantity,
      available,
      isLowStock: available <= item.lowStockWarning
    };
  });
}
