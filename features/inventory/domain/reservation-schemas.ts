import { z } from "zod";

export const reserveStockInputSchema = z.object({
  productId: z.string().trim().min(1, "Product ID is required."),
  variantId: z.string().trim().min(1, "Variant ID is required."),
  quantity: z.number().int().positive("Quantity must be at least 1."),
  referenceType: z.string().trim().min(1).optional(),
  referenceId: z.string().trim().min(1).optional(),
  expiresAt: z.string().datetime().optional()
});

export type ReserveStockInput = z.infer<typeof reserveStockInputSchema>;

export const stockQuerySchema = z.object({
  productId: z.string().trim().min(1, "Product ID is required."),
  variantId: z.string().trim().min(1, "Variant ID is required.")
});

export type StockQueryInput = z.infer<typeof stockQuerySchema>;
