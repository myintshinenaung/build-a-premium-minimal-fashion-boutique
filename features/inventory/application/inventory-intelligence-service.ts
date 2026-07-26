import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { InventoryValidationError } from "@/features/inventory/application/inventory-errors";
import {
  buildInventoryAlerts,
  buildInventoryDashboard,
  buildInventoryForecast,
  calculateInventoryValue,
  mergeWarehouseStockIntoSnapshots
} from "@/features/inventory/domain/inventory-intelligence";
import {
  inventoryAdjustSchema,
  inventoryRestockSchema,
  inventoryTransferSchema,
  parseInventoryQuery
} from "@/features/inventory/domain/inventory-intelligence-schemas";
import { expireReservations } from "@/features/inventory/application/expire-reservations";
import { inventoryService } from "@/features/inventory/application/inventory-service";
import { getCurrentProductStock, recordInventoryMovement } from "@/features/inventory/application/record-movement";
import {
  alertSettingsRepository,
  movementRepository,
  warehouseRepository
} from "@/features/inventory/infrastructure/inventory-intelligence-repository";
import { productRepository } from "@/features/catalog/infrastructure/product-repository";
import { reservationRepository } from "@/features/inventory/infrastructure/reservation-repository";
import { CACHE_TAGS, CACHE_TTLS } from "@/features/performance/domain/cache-tags";
import { invalidateInventoryCache } from "@/features/performance/application/cache-invalidation";
import { enqueueInventorySync } from "@/features/performance/infrastructure/job-queue";
import { createCachedLoader } from "@/features/performance/infrastructure/cache-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid inventory request.";
}

async function loadInventoryItems() {
  await expireReservations();
  const [items, warehouseQuantities] = await Promise.all([
    inventoryService.listProductInventory(),
    warehouseRepository.getDefaultWarehouseQuantities()
  ]);
  return mergeWarehouseStockIntoSnapshots(items, warehouseQuantities);
}

async function loadSalesByProduct(days = 30) {
  const supabase = createSupabaseServerClient();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const startDate = start.toISOString().slice(0, 10);

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id")
    .eq("payment_status", "paid")
    .gte("created_at", startDate);

  if (ordersError) {
    throw ordersError;
  }

  const orderIds = (orders ?? []).map((order) => order.id);

  if (orderIds.length === 0) {
    return [];
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .in("order_id", orderIds);

  if (itemsError) {
    throw itemsError;
  }

  const totals = new Map<string, number>();

  for (const item of items ?? []) {
    totals.set(item.product_id, (totals.get(item.product_id) ?? 0) + item.quantity);
  }

  return Array.from(totals.entries()).map(([productId, unitsSold]) => ({
    productId,
    unitsSold,
    daysInRange: days
  }));
}

async function loadInventoryDashboardData() {
  const [items, warehouses, incomingStock, products] = await Promise.all([
    loadInventoryItems(),
    warehouseRepository.list(),
    warehouseRepository.getIncomingTotal(),
    productRepository.list()
  ]);
  const costByProduct = new Map(products.map((product) => [product.id, product.costPriceMmk]));
  return buildInventoryDashboard(items, incomingStock, calculateInventoryValue(items, costByProduct), warehouses);
}

const loadInventoryDashboardCached = createCachedLoader(
  "inventory-dashboard",
  [CACHE_TAGS.inventory],
  CACHE_TTLS.inventory,
  loadInventoryDashboardData
);

const loadInventoryAlertsCached = createCachedLoader(
  "inventory-alerts",
  [CACHE_TAGS.inventory],
  CACHE_TTLS.inventory,
  async () => {
    const [items, settings] = await Promise.all([loadInventoryItems(), alertSettingsRepository.getGlobalSettings()]);
    return {
      settings,
      alerts: buildInventoryAlerts(items, settings, new Map())
    };
  }
);

const loadInventoryForecastCached = createCachedLoader(
  "inventory-forecast",
  [CACHE_TAGS.inventory, CACHE_TAGS.analytics],
  CACHE_TTLS.inventory,
  async () => {
    const [items, settings, salesByProduct] = await Promise.all([
      loadInventoryItems(),
      alertSettingsRepository.getGlobalSettings(),
      loadSalesByProduct()
    ]);

    return {
      items: buildInventoryForecast(items, salesByProduct, settings)
    };
  }
);

export async function getInventoryDashboard() {
  return loadInventoryDashboardCached();
}

export async function getInventoryHistory(input: Record<string, string | string[] | undefined> | URLSearchParams) {
  const query = parseInventoryQuery(input);
  const products = await productRepository.list();
  const warehouses = await warehouseRepository.list();
  const productNames = new Map(products.map((product) => [product.id, product.name]));
  const warehouseNames = new Map(warehouses.map((warehouse) => [warehouse.id, warehouse.name]));

  return movementRepository.list(
    {
      from: query.from,
      to: query.to,
      productId: query.productId,
      warehouseId: query.warehouseId,
      movementType: query.movementType,
      page: query.page,
      pageSize: query.pageSize
    },
    productNames,
    warehouseNames
  );
}

export async function getInventoryAlerts() {
  return loadInventoryAlertsCached();
}

export async function getInventoryForecast() {
  return loadInventoryForecastCached();
}

type InventoryActor = {
  userId?: string | null;
  userName: string;
};

export async function adjustInventory(input: unknown, actor: InventoryActor) {
  let parsed;

  try {
    parsed = inventoryAdjustSchema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new InventoryValidationError(formatZodError(error));
    }

    throw error;
  }

  const warehouseId = parsed.warehouseId ?? (await warehouseRepository.getDefaultWarehouseId());
  const current = await getCurrentProductStock(parsed.productId, warehouseId);
  const next = Math.max(0, current + parsed.quantity);

  if (parsed.quantity < 0 && next === 0 && current + parsed.quantity < 0) {
    throw new InventoryValidationError("Adjustment would reduce stock below zero.");
  }

  const movement = await recordInventoryMovement({
    productId: parsed.productId,
    warehouseId,
    movementType: parsed.movementType,
    quantity: Math.abs(parsed.quantity),
    quantityBefore: current,
    quantityAfter: next,
    userId: actor.userId ?? null,
    userName: actor.userName,
    reason: parsed.reason
  });

  await invalidateInventoryCache();
  enqueueInventorySync(parsed.productId);

  return { movement };
}

export async function restockInventory(input: unknown, actor: InventoryActor) {
  let parsed;

  try {
    parsed = inventoryRestockSchema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new InventoryValidationError(formatZodError(error));
    }

    throw error;
  }

  const warehouseId = parsed.warehouseId ?? (await warehouseRepository.getDefaultWarehouseId());

  if (parsed.incoming) {
    await warehouseRepository.addIncoming(warehouseId, parsed.productId, parsed.quantity);
    const current = await getCurrentProductStock(parsed.productId, warehouseId);
    const movement = await recordInventoryMovement({
      productId: parsed.productId,
      warehouseId,
      movementType: "purchase",
      quantity: parsed.quantity,
      quantityBefore: current,
      quantityAfter: current,
      userId: actor.userId ?? null,
      userName: actor.userName,
      reason: parsed.reason,
      syncProductStock: false
    });
    await invalidateInventoryCache();
    enqueueInventorySync(parsed.productId);
    return { movement, incoming: true };
  }

  const current = await getCurrentProductStock(parsed.productId, warehouseId);
  const next = current + parsed.quantity;
  const movement = await recordInventoryMovement({
    productId: parsed.productId,
    warehouseId,
    movementType: "purchase",
    quantity: parsed.quantity,
    quantityBefore: current,
    quantityAfter: next,
    userId: actor.userId ?? null,
    userName: actor.userName,
    reason: parsed.reason
  });

  await invalidateInventoryCache();
  enqueueInventorySync(parsed.productId);

  return { movement, incoming: false };
}

export async function transferInventory(input: unknown, actor: InventoryActor) {
  let parsed;

  try {
    parsed = inventoryTransferSchema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new InventoryValidationError(formatZodError(error));
    }

    throw error;
  }

  if (parsed.sourceWarehouseId === parsed.destinationWarehouseId) {
    throw new InventoryValidationError("Source and destination warehouses must be different.");
  }

  const sourceStock = await warehouseRepository.getStock(parsed.sourceWarehouseId, parsed.productId);

  if (sourceStock.quantity < parsed.quantity) {
    throw new InventoryValidationError("Insufficient stock in source warehouse.");
  }

  const destinationStock = await warehouseRepository.getStock(parsed.destinationWarehouseId, parsed.productId);
  const sourceAfter = sourceStock.quantity - parsed.quantity;
  const destinationAfter = destinationStock.quantity + parsed.quantity;

  await warehouseRepository.setStock(parsed.sourceWarehouseId, parsed.productId, sourceAfter, sourceStock.incomingQuantity);
  await warehouseRepository.setStock(
    parsed.destinationWarehouseId,
    parsed.productId,
    destinationAfter,
    destinationStock.incomingQuantity
  );

  const defaultWarehouseId = await warehouseRepository.getDefaultWarehouseId();
  if (parsed.sourceWarehouseId === defaultWarehouseId) {
    await reservationRepository.setProductStock(parsed.productId, sourceAfter);
  } else if (parsed.destinationWarehouseId === defaultWarehouseId) {
    await reservationRepository.setProductStock(parsed.productId, destinationAfter);
  }

  const movement = await recordInventoryMovement({
    productId: parsed.productId,
    warehouseId: parsed.sourceWarehouseId,
    movementType: "warehouse_transfer",
    quantity: parsed.quantity,
    quantityBefore: sourceStock.quantity,
    quantityAfter: sourceAfter,
    userId: actor.userId ?? null,
    userName: actor.userName,
    reason: `${parsed.reason} -> ${parsed.destinationWarehouseId}`,
    referenceType: "warehouse",
    referenceId: parsed.destinationWarehouseId,
    syncProductStock: false
  });

  await invalidateInventoryCache();
  enqueueInventorySync(parsed.productId);

  return {
    movement,
    sourceWarehouseId: parsed.sourceWarehouseId,
    destinationWarehouseId: parsed.destinationWarehouseId
  };
}

export function handleInventoryApiError(error: unknown) {
  if (error instanceof InventoryValidationError) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "Unable to process inventory request.";
  return NextResponse.json({ message }, { status: 500 });
}
