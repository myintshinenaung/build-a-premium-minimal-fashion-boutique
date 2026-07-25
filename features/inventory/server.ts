/** Server-only inventory exports. Import from Server Components and route handlers. */
export { consumeReservation } from "@/features/inventory/application/consume-reservation";
export { expireReservations } from "@/features/inventory/application/expire-reservations";
export { getAvailableStock } from "@/features/inventory/application/get-available-stock";
export {
  InsufficientStockError,
  InventoryValidationError,
  ReservationConflictError,
  ReservationNotFoundError
} from "@/features/inventory/application/inventory-errors";
export { inventoryService } from "@/features/inventory/application/inventory-service";
export { releaseReservation } from "@/features/inventory/application/release-reservation";
export { reserveStock } from "@/features/inventory/application/reserve-stock";
export { AdminInventoryPage } from "@/features/inventory/ui/admin/AdminInventoryPage";
