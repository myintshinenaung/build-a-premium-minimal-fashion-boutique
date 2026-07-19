# Priority 2 — Remaining Work

Last updated: 2026-07-19  
Status: **Complete** — Priority 2 signed off. Priority 3 may begin.

---

## Completed (Priority 2 baseline — committed `da881ff`)

- [x] Supabase Auth login / logout / forgot-password API routes
- [x] Server-side session validation in `proxy.ts` and admin API routes
- [x] `@supabase/ssr` cookie-based sessions
- [x] `robots.txt` disallows `/admin` and `/api/admin`
- [x] RLS migration SQL added at `supabase/migrations/20260717000000_enable_admin_rls.sql`
- [x] Production build passes

---

## Issue 1 — Admin authorization (QA complete, uncommitted)

**Goal:** Restrict admin access to allowlisted emails or Supabase `role: "admin"`.

### Code changes (local, not committed)

- [x] `lib/admin-authorization.ts` — allowlist + role check
- [x] Login, proxy, API, and session helpers enforce authorization
- [x] `.env.example` — `ADMIN_ALLOWED_EMAILS`
- [x] `.env.local` — `ADMIN_ALLOWED_EMAILS=naungngel01@gmail.com` (local only, not in git)
- [x] `lib/admin-api.ts` — 401/403 handling + request-based session read for admin APIs
- [x] `lib/supabase/auth-server.ts` — `createSupabaseAuthRequestClient()` for API cookie reads
- [x] `proxy.ts` — defer session clear on unauthorized page access to API login routes

### QA progress

- [x] **Step 1** — Allowed admin login → `/admin` (PASS)
- [x] **Step 2** — Unauthorized account blocked with error message (PASS)
- [x] **Step 3** — Unauthenticated visit to `/admin/products` redirects to `/admin/login` (PASS)
- [x] **Step 4** — Unauthenticated `GET /api/admin/products` returns `401` (PASS)

### Remaining for Issue 1

- [ ] Commit Issue 1 authorization changes after full Priority 2 sign-off (or when requested)

---

## Issue 2 — RLS migration deployment (QA complete)

**Problem:** RLS policies exist only as a SQL file; they are not applied to Supabase automatically.

### Prep (done locally)

- [x] Migration made idempotent (`drop policy if exists` before each `create policy`)
- [x] `supabase/verify-rls.sql` — single-query SQL Editor verification
- [x] `scripts/verify-rls.mjs` + `npm run verify:rls` — anon-key verification from project root
- [x] README updated with deployment steps

### QA progress

- [x] **Step 1** — Run `supabase/migrations/20260717000000_enable_admin_rls.sql` in Supabase SQL Editor (PASS)
- [x] **Step 2** — Run `supabase/verify-rls.sql`; all 13 rows `result = PASS` (PASS)
- [x] **Step 3** — Run `npm run verify:rls`; all anon checks pass (PASS)

### Result

RLS is enabled on all admin tables. Anon access is limited to published catalog rows only. Authenticated policies are in place for admin table management.

---

## Issue 3 — Stale admin login page copy (QA complete)

**Problem:** Login page still described pre–Priority 2 mock auth.

**File:** `app/admin/login/page.tsx`

- [x] Replace “UI-only authentication screen prepared for future Supabase Auth…”
- [x] Replace “No database connection or live credential handling yet.”
- [x] Update sidebar copy to reflect live Supabase Auth + allowlist/role checks
- [x] Re-run build after edit (PASS)
- [x] QA verified at `/admin/login` (PASS)

---

## Issue 4 — Repository debug logging (QA complete)

**Problem:** Production request paths log full Supabase payloads to server console.

- [x] Remove all debug `console.log` calls from product and category repositories
- [x] Re-run build with clean server output (PASS)
- [x] QA verified — no DATA/ERROR/CATEGORY debug lines (PASS)

---

## Issue 5 — Forgot password flow (QA complete)

- [x] Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in `.env.local`
- [x] Confirm Supabase Auth redirect URL allows `http://localhost:3000/admin/login` (PASS)
- [x] Submit forgot-password form with allowed admin email (PASS)
- [x] Confirm Supabase sends reset email (PASS)
- [x] Confirm reset link redirects to `/admin/login` (PASS)

---

## Issue 6 — Session persistence (QA complete)

- [x] Sign in with allowed admin account (PASS)
- [x] Refresh `/admin` — session persists (PASS)
- [x] Close tab, reopen `/admin` — stays signed in (PASS)
- [x] Sign out — requires login again (PASS)

---

## Issue 7 — Unauthorized API access (QA complete)

- [x] `GET /api/admin/products` with no cookies → **401** + `{"message":"Unauthorized"}` (PASS)
- [x] `GET /api/admin/products` with valid session but non-allowed user → **403** + session cleared (PASS)

---

## Priority 2 sign-off checklist

Only when **all** items above are done:

- [x] All Issue 1–7 items checked
- [x] `npm run build` passes (final sign-off run)
- [x] Uncommitted Priority 2 fixes committed (`13db73c`)
- [x] Final Priority 2 audit complete

---

## Explicitly out of scope (Priority 3+, do not fix during Priority 2)

- Red debug heading on `/admin/products` (`Products = {count}`)
- Hardcoded customer count (`"3"`) on dashboard
- Banner Manager / Media Library upload placeholders
- Orders / Customers placeholder CRUD
- Storefront settings/banners wiring
- Responsive layout audit
- General console/network cleanup beyond repository debug logs
