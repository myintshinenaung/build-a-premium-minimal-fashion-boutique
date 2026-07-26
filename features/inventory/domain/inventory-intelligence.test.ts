import { describe, expect, it } from "vitest";
import type { ProductInventorySnapshot } from "@/features/inventory/domain/reservation";
import {
  buildInventoryAlerts,
  buildInventoryDashboard,
  buildInventoryForecast,
  classifyInventoryAlert
} from "@/features/inventory/domain/inventory-intelligence";

const items: ProductInventorySnapshot[] = [
  {
    productId: "PROD-1",
    productName: "Silk Dress",
    sku: "SLP-001",
    current: 12,
    reserved: 2,
    available: 10,
    lowStockWarning: 5,
    isLowStock: false
  },
  {
    productId: "PROD-2",
    productName: "Wool Blazer",
    sku: "BLZ-014",
    current: 2,
    reserved: 0,
    available: 2,
    lowStockWarning: 5,
    isLowStock: true
  },
  {
    productId: "PROD-3",
    productName: "Cashmere Knit",
    sku: "KNT-008",
    current: 0,
    reserved: 0,
    available: 0,
    lowStockWarning: 5,
    isLowStock: true
  },
  {
    productId: "PROD-4",
    productName: "Linen Shirt",
    sku: "SHR-021",
    current: 120,
    reserved: 0,
    available: 120,
    lowStockWarning: 5,
    isLowStock: false
  }
];

const settings = {
  lowStockThreshold: 5,
  criticalStockThreshold: 2,
  overstockThreshold: 100
};

describe("inventory intelligence domain", () => {
  it("classifies stock alerts", () => {
    expect(classifyInventoryAlert(items[2], settings)?.level).toBe("out_of_stock");
    expect(classifyInventoryAlert(items[1], settings)?.level).toBe("critical_stock");
    expect(classifyInventoryAlert(items[3], settings)?.level).toBe("overstock");
  });

  it("builds dashboard KPIs", () => {
    const dashboard = buildInventoryDashboard(items, 15, 250000, [
      { id: "WH-MAIN", name: "Main Warehouse", code: "MAIN", isDefault: true, createdAt: "2026-07-01T00:00:00.000Z" }
    ]);

    expect(dashboard.kpis.totalStock).toBe(134);
    expect(dashboard.kpis.availableStock).toBe(132);
    expect(dashboard.kpis.reservedStock).toBe(2);
    expect(dashboard.kpis.outOfStock).toBe(1);
    expect(dashboard.kpis.incomingStock).toBe(15);
  });

  it("builds alert and forecast lists", () => {
    const alerts = buildInventoryAlerts(items, settings, new Map());
    const forecast = buildInventoryForecast(
      items,
      [{ productId: "PROD-1", unitsSold: 30, daysInRange: 30 }],
      settings
    );

    expect(alerts.some((alert) => alert.level === "out_of_stock")).toBe(true);
    expect(forecast.find((entry) => entry.productId === "PROD-1")?.dailySalesVelocity).toBe(1);
    expect(forecast.find((entry) => entry.productId === "PROD-1")?.estimatedDaysRemaining).toBe(10);
  });
});
