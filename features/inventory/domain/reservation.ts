export const RESERVATION_STATUSES = ["active", "released", "consumed"] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export type InventoryReservation = {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  status: ReservationStatus;
  referenceType: string | null;
  referenceId: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type StockSnapshot = {
  productId: string;
  variantId: string;
  current: number;
  reserved: number;
  available: number;
  lowStockWarning: number;
  isLowStock: boolean;
};

export type ProductInventorySnapshot = {
  productId: string;
  productName: string;
  sku: string;
  current: number;
  reserved: number;
  available: number;
  lowStockWarning: number;
  isLowStock: boolean;
};
