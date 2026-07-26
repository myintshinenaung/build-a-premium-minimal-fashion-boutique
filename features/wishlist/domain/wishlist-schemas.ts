import { z } from "zod";

export const wishlistItemInputSchema = z.object({
  productId: z.string().trim().min(1, "Product is required.")
});

export type WishlistItemInput = z.infer<typeof wishlistItemInputSchema>;
