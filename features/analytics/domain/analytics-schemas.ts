import { z } from "zod";

export const ANALYTICS_PERIODS = ["daily", "weekly", "monthly", "yearly"] as const;

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

function defaultRange() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 29);

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10)
  };
}

export const analyticsQuerySchema = z
  .object({
    from: z.preprocess(parseDateInput, z.string().date().optional()),
    to: z.preprocess(parseDateInput, z.string().date().optional()),
    period: z.enum(ANALYTICS_PERIODS).optional().default("daily"),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10)
  })
  .transform((value) => {
    const fallback = defaultRange();
    const from = value.from ?? fallback.from;
    const to = value.to ?? fallback.to;

    return {
      from: from <= to ? from : to,
      to: from <= to ? to : from,
      period: value.period,
      limit: value.limit
    };
  });

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

export function parseAnalyticsQuery(input: Record<string, string | string[] | undefined> | URLSearchParams) {
  const params =
    input instanceof URLSearchParams
      ? Object.fromEntries(input.entries())
      : input;

  return analyticsQuerySchema.parse({
    from: params.from,
    to: params.to,
    period: params.period,
    limit: params.limit
  });
}
