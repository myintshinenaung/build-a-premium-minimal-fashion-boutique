import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { AnalyticsValidationError } from "@/features/analytics/application/analytics-errors";
import {
  buildCustomerAnalytics,
  buildOrderAnalytics,
  buildOverviewAnalytics,
  buildProductAnalytics,
  buildReviewAnalytics,
  buildRevenueAnalytics,
  buildSalesAnalytics
} from "@/features/analytics/domain/analytics-aggregators";
import { parseAnalyticsQuery } from "@/features/analytics/domain/analytics-schemas";
import { analyticsRepository } from "@/features/analytics/infrastructure/analytics-repository";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid analytics query.";
}

async function loadQuery(input: Record<string, string | string[] | undefined> | URLSearchParams) {
  try {
    return parseAnalyticsQuery(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AnalyticsValidationError(formatZodError(error));
    }

    throw error;
  }
}

export async function getAnalyticsOverview(input: Record<string, string | string[] | undefined> | URLSearchParams) {
  const query = await loadQuery(input);
  const snapshot = await analyticsRepository.loadSnapshot();
  const range = { from: query.from, to: query.to };
  return buildOverviewAnalytics(snapshot, range);
}

export async function getAnalyticsSales(input: Record<string, string | string[] | undefined> | URLSearchParams) {
  const query = await loadQuery(input);
  const snapshot = await analyticsRepository.loadSnapshot();
  const range = { from: query.from, to: query.to };
  return buildSalesAnalytics(snapshot, range, query.period);
}

export async function getAnalyticsRevenue(input: Record<string, string | string[] | undefined> | URLSearchParams) {
  const query = await loadQuery(input);
  const snapshot = await analyticsRepository.loadSnapshot();
  const range = { from: query.from, to: query.to };
  return buildRevenueAnalytics(snapshot, range);
}

export async function getAnalyticsProducts(input: Record<string, string | string[] | undefined> | URLSearchParams) {
  const query = await loadQuery(input);
  const snapshot = await analyticsRepository.loadSnapshot();
  const range = { from: query.from, to: query.to };
  return buildProductAnalytics(snapshot, range, query.limit);
}

export async function getAnalyticsCustomers(input: Record<string, string | string[] | undefined> | URLSearchParams) {
  const query = await loadQuery(input);
  const snapshot = await analyticsRepository.loadSnapshot();
  const range = { from: query.from, to: query.to };
  return buildCustomerAnalytics(snapshot, range);
}

export async function getAnalyticsOrders(input: Record<string, string | string[] | undefined> | URLSearchParams) {
  const query = await loadQuery(input);
  const snapshot = await analyticsRepository.loadSnapshot();
  const range = { from: query.from, to: query.to };
  return buildOrderAnalytics(snapshot, range);
}

export async function getAnalyticsReviews(input: Record<string, string | string[] | undefined> | URLSearchParams) {
  const query = await loadQuery(input);
  const snapshot = await analyticsRepository.loadSnapshot();
  const range = { from: query.from, to: query.to };
  return buildReviewAnalytics(snapshot, range);
}

export function handleAnalyticsApiError(error: unknown) {
  if (error instanceof AnalyticsValidationError) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "Unable to load analytics.";
  return NextResponse.json({ message }, { status: 500 });
}
