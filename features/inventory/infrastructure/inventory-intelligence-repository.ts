import { createRepositoryError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { InventoryMovementRow } from "@/lib/supabase/types";
import type {
  InventoryAlertSettings,
  InventoryMovement,
  InventoryMovementType,
  InventoryWarehouse
} from "@/types/inventory-intelligence";

export type MovementCreateInput = {
  id: string;
  productId: string;
  warehouseId: string;
  movementType: InventoryMovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  userId?: string | null;
  userName: string;
  reason: string;
  referenceType?: string | null;
  referenceId?: string | null;
};

export type MovementListParams = {
  from?: string;
  to?: string;
  productId?: string;
  warehouseId?: string;
  movementType?: InventoryMovementType;
  page: number;
  pageSize: number;
};

function createMovementId() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MOV-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

let cachedDefaultWarehouseId: string | null = null;

export const movementRepository = {
  async create(input: MovementCreateInput): Promise<InventoryMovement> {
    try {
      const supabase = createSupabaseServerClient();
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from("inventory_movements")
        .insert({
          id: input.id,
          product_id: input.productId,
          warehouse_id: input.warehouseId,
          movement_type: input.movementType,
          quantity: input.quantity,
          quantity_before: input.quantityBefore,
          quantity_after: input.quantityAfter,
          user_id: input.userId ?? null,
          user_name: input.userName,
          reason: input.reason,
          reference_type: input.referenceType ?? null,
          reference_id: input.referenceId ?? null,
          created_at: timestamp
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return movementFromRow(data, input.productId, input.warehouseId);
    } catch (error) {
      throw createRepositoryError("Unable to record inventory movement", error);
    }
  },

  async list(params: MovementListParams, productNames: Map<string, string>, warehouseNames: Map<string, string>) {
    try {
      const supabase = createSupabaseServerClient();
      const from = (params.page - 1) * params.pageSize;
      const to = from + params.pageSize - 1;

      let query = supabase
        .from("inventory_movements")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (params.productId) {
        query = query.eq("product_id", params.productId);
      }

      if (params.warehouseId) {
        query = query.eq("warehouse_id", params.warehouseId);
      }

      if (params.movementType) {
        query = query.eq("movement_type", params.movementType);
      }

      if (params.from) {
        query = query.gte("created_at", `${params.from}T00:00:00.000Z`);
      }

      if (params.to) {
        query = query.lte("created_at", `${params.to}T23:59:59.999Z`);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) {
        throw error;
      }

      const items = (data ?? []).map((row) =>
        movementFromRow(row, row.product_id, row.warehouse_id, productNames, warehouseNames)
      );

      const total = count ?? 0;

      return {
        items,
        total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.max(1, Math.ceil(total / params.pageSize))
      };
    } catch (error) {
      throw createRepositoryError("Unable to load inventory movements", error);
    }
  }
};

export function createInventoryMovementId() {
  return createMovementId();
}

function movementFromRow(
  row: InventoryMovementRow,
  productId: string,
  warehouseId: string,
  productNames?: Map<string, string>,
  warehouseNames?: Map<string, string>
): InventoryMovement {
  return {
    id: row.id,
    productId: row.product_id ?? productId,
    productName: productNames?.get(row.product_id) ?? row.product_id,
    warehouseId: row.warehouse_id ?? warehouseId,
    warehouseName: warehouseNames?.get(row.warehouse_id) ?? row.warehouse_id,
    movementType: row.movement_type as InventoryMovementType,
    quantity: row.quantity,
    quantityBefore: row.quantity_before,
    quantityAfter: row.quantity_after,
    userId: row.user_id,
    userName: row.user_name,
    reason: row.reason,
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    createdAt: row.created_at
  };
}

export const alertSettingsRepository = {
  async getGlobalSettings(): Promise<InventoryAlertSettings> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("inventory_alert_settings").select("*").eq("id", "default").maybeSingle();

      if (error) {
        throw error;
      }

      return {
        lowStockThreshold: data?.low_stock_threshold ?? 5,
        criticalStockThreshold: data?.critical_stock_threshold ?? 2,
        overstockThreshold: data?.overstock_threshold ?? 100
      };
    } catch (error) {
      throw createRepositoryError("Unable to load inventory alert settings", error);
    }
  }
};

export const warehouseRepository = {
  async list(): Promise<InventoryWarehouse[]> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("warehouses").select("*").order("is_default", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        isDefault: row.is_default,
        createdAt: row.created_at
      }));
    } catch (error) {
      throw createRepositoryError("Unable to load warehouses", error);
    }
  },

  async getDefaultWarehouseId() {
    if (cachedDefaultWarehouseId) {
      return cachedDefaultWarehouseId;
    }

    const warehouses = await this.list();
    cachedDefaultWarehouseId = warehouses.find((warehouse) => warehouse.isDefault)?.id ?? "WH-MAIN";
    return cachedDefaultWarehouseId;
  },

  async getStock(warehouseId: string, productId: string) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("warehouse_stock")
        .select("*")
        .eq("warehouse_id", warehouseId)
        .eq("product_id", productId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return {
        quantity: data?.quantity ?? 0,
        incomingQuantity: data?.incoming_quantity ?? 0
      };
    } catch (error) {
      throw createRepositoryError("Unable to load warehouse stock", error);
    }
  },

  async setStock(warehouseId: string, productId: string, quantity: number, incomingQuantity?: number) {
    try {
      const supabase = createSupabaseServerClient();
      const timestamp = new Date().toISOString();
      const stockId = `WST-${productId}-${warehouseId.split("-").pop()}`;
      const { data, error } = await supabase
        .from("warehouse_stock")
        .upsert(
          {
            id: stockId,
            warehouse_id: warehouseId,
            product_id: productId,
            quantity,
            incoming_quantity: incomingQuantity ?? 0,
            updated_at: timestamp
          },
          { onConflict: "warehouse_id,product_id" }
        )
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return {
        quantity: data.quantity,
        incomingQuantity: data.incoming_quantity
      };
    } catch (error) {
      throw createRepositoryError("Unable to update warehouse stock", error);
    }
  },

  async addIncoming(warehouseId: string, productId: string, quantity: number) {
    const current = await this.getStock(warehouseId, productId);
    return this.setStock(warehouseId, productId, current.quantity, current.incomingQuantity + quantity);
  },

  async getIncomingTotal() {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("warehouse_stock").select("incoming_quantity");

      if (error) {
        throw error;
      }

      return (data ?? []).reduce((sum, row) => sum + row.incoming_quantity, 0);
    } catch (error) {
      throw createRepositoryError("Unable to load incoming stock", error);
    }
  },

  async getDefaultWarehouseQuantities() {
    try {
      const supabase = createSupabaseServerClient();
      const defaultWarehouseId = await this.getDefaultWarehouseId();
      const { data, error } = await supabase
        .from("warehouse_stock")
        .select("product_id, quantity")
        .eq("warehouse_id", defaultWarehouseId);

      if (error) {
        throw error;
      }

      return new Map((data ?? []).map((row) => [row.product_id, row.quantity]));
    } catch (error) {
      throw createRepositoryError("Unable to load default warehouse stock", error);
    }
  }
};
