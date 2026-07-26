import {
  createInventoryMovementId,
  movementRepository,
  warehouseRepository
} from "@/features/inventory/infrastructure/inventory-intelligence-repository";
import { reservationRepository } from "@/features/inventory/infrastructure/reservation-repository";
import type { InventoryMovement, InventoryMovementType } from "@/types/inventory-intelligence";

type RecordMovementInput = {
  productId: string;
  warehouseId?: string;
  movementType: InventoryMovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  userId?: string | null;
  userName: string;
  reason: string;
  referenceType?: string | null;
  referenceId?: string | null;
  syncProductStock?: boolean;
};

export async function recordInventoryMovement(input: RecordMovementInput): Promise<InventoryMovement> {
  const warehouseId = input.warehouseId ?? (await warehouseRepository.getDefaultWarehouseId());

  if (input.syncProductStock !== false) {
    await reservationRepository.setProductStock(input.productId, input.quantityAfter);
    await warehouseRepository.setStock(warehouseId, input.productId, input.quantityAfter);
  }

  return movementRepository.create({
    id: createInventoryMovementId(),
    productId: input.productId,
    warehouseId,
    movementType: input.movementType,
    quantity: input.quantity,
    quantityBefore: input.quantityBefore,
    quantityAfter: input.quantityAfter,
    userId: input.userId ?? null,
    userName: input.userName,
    reason: input.reason,
    referenceType: input.referenceType ?? null,
    referenceId: input.referenceId ?? null
  });
}

export async function getCurrentProductStock(productId: string, warehouseId?: string) {
  const resolvedWarehouseId = warehouseId ?? (await warehouseRepository.getDefaultWarehouseId());
  const [productStock, warehouseStock] = await Promise.all([
    reservationRepository.getProductStock(productId),
    warehouseRepository.getStock(resolvedWarehouseId, productId)
  ]);

  return Math.max(productStock, warehouseStock.quantity);
}
