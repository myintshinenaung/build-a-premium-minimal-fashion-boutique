import { z } from "zod";

export const reviewStatuses = ["pending", "published", "rejected", "hidden"] as const;

export const reviewInputSchema = z.object({
  productId: z.string().trim().min(1, "Product is required."),
  rating: z.number().int().min(1, "Rating must be at least 1.").max(5, "Rating must be at most 5."),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  body: z.string().trim().min(10, "Review must be at least 10 characters.").max(2000, "Review is too long.")
});

export const reviewUpdateInputSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().trim().max(120).optional().or(z.literal("")),
    body: z.string().trim().min(10).max(2000).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required."
  });

export const reviewReportInputSchema = z.object({
  reason: z.string().trim().min(5, "Please provide a reason.").max(500, "Reason is too long.")
});

export const reviewModerationInputSchema = z.object({
  status: z.enum(reviewStatuses)
});

export const reviewListQuerySchema = z.object({
  productId: z.string().trim().min(1, "Product is required."),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(20).default(5)
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;
export type ReviewUpdateInput = z.infer<typeof reviewUpdateInputSchema>;
export type ReviewReportInput = z.infer<typeof reviewReportInputSchema>;
export type ReviewModerationInput = z.infer<typeof reviewModerationInputSchema>;
