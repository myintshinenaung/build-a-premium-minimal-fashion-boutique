/**
 * Verify Supabase RLS policies using the anon key only.
 *
 * Usage:
 *   node --env-file=.env.local scripts/verify-rls.mjs
 *
 * Expected after migration:
 * - products/categories: anon can read Published rows only
 * - banners/settings/orders/customers: anon sees 0 rows
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const client = createClient(url, anonKey);

async function countRows(table, filter) {
  let query = client.from(table).select("id", { count: "exact", head: true });
  if (filter) {
    query = query.eq("status", filter);
  }

  const { count, error } = await query;
  return { count: count ?? 0, error: error?.message ?? null };
}

const checks = [];

async function expectAnon(table, filter, expectation) {
  const result = await countRows(table, filter);
  const label = filter ? `${table} (${filter})` : table;
  const pass =
    expectation === "zero"
      ? result.count === 0 && !result.error
      : result.count > 0 && !result.error;

  checks.push({ label, pass, ...result, expectation });
}

await expectAnon("products", "Published", "some");
await expectAnon("products", "Draft", "zero");
await expectAnon("categories", "Published", "some");
await expectAnon("categories", "Draft", "zero");
await expectAnon("banners", null, "zero");
await expectAnon("settings", null, "zero");
await expectAnon("orders", null, "zero");
await expectAnon("customers", null, "zero");

let failed = 0;

for (const check of checks) {
  const status = check.pass ? "PASS" : "FAIL";
  if (!check.pass) {
    failed += 1;
  }

  console.log(
    `${status}  ${check.label}  count=${check.count}  expectation=${check.expectation}${
      check.error ? `  error=${check.error}` : ""
    }`
  );
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed. Apply supabase/migrations/20260717000000_enable_admin_rls.sql first.`);
  process.exit(1);
}

console.log("\nAll anon RLS checks passed.");
