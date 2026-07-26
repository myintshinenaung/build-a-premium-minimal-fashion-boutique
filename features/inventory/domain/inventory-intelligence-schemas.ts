import { z } from "zod";
import { INVENTORY_MOVEMENT_TYPES } from "@/types/inventory-intelligence";

export const DEFAULT_INVENTORY_PAGE_SIZE = 20;

function parseDateInput(value: unknown) {
  if (value == null || value === "") {
    return undefined;
  }

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString().slice(0, 10);
}

export const inventoryQuerySchema = z
  .object({
    from: z.preprocess(parseDateInput, z.string().date().optional()),
    to: z.preprocess(parseDateInput, z.string().date().optional()),
    productId: z.string().trim().min(1).optional(),
    warehouseId: z.string().trim().min(1).optional(),
    movementType: z.enum(INVENTORY_MOVEMENT_TYPES).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).optional().default(DEFAULT_INVENTORY_PAGE_SIZE)
  })
  .transform((value) => ({
    ...value,
    from: value.from,
    to: value.to
  }));

export const inventoryAdjustSchema = z.object({
  productId: z.string().trim().min(1, "Product is required."),
  warehouseId: z.string().trim().min(1).optional(),
  quantity: z.coerce.number().int().refine((value) => value !== 0, "Quantity must not be zero."),
  reason: z.string().trim().min(1, "Reason is required.").max(500),
  movementType: z.enum(["manual_adjustment", "damage", "return"]).optional().default("manual_adjustment")
});

export const inventoryRestockSchema = z.object({
  productId: z.string().trim().min(1, "Product is required."),
  warehouseId: z.string().trim().min(1).optional(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  reason: z.string().trim().min(1, "Reason is required.").max(500),
  incoming: z.coerce.boolean().optional().default(false)
});

export const inventoryTransferSchema = z.object({
  productId: z.string().trim().min(1, "Product is required."),
  sourceWarehouseId: z.string().trim().min(1, "Source warehouse is required."),
  destinationWarehouseId: z.string().trim().min(1, "Destination warehouse is required."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  reason: z.string().trim().min(1, "Reason is required.").max(500)
});

export const inventoryAlertSettingsSchema = z.object({
  lowStockThreshold: z.coerce.number().int().min(0),
  criticalStockThreshold: z.coerce.number().int().min(0),
  overstockThreshold: z.coerce.number().int().min(1)
});

export type InventoryQuery = z.infer<typeof inventoryQuerySchema>;
export type InventoryAdjustInput = z.infer<typeof inventoryAdjustSchema>;
export type InventoryRestockInput = z.infer<typeof inventoryRestockSchema>;
export type InventoryTransferInput = z.infer<typeof inventoryTransferSchema>;

export function parseInventoryQuery(input: Record<string, string | string[] | undefined> | URLSearchParams) {
  const params = input instanceof URLSearchParams ? Object.fromEntries(input.entries()) : input;
  return inventoryQuerySchema.parse(params);
}
