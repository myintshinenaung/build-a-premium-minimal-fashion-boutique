# PROJECT_AUDIT.md

**Project:** Atelier Lune Boutique  
**Last updated:** 2026-07-21  
**Purpose:** Living audit document for refactoring into a mobile-first fashion commerce platform

---

## Project Overview

Atelier Lune Boutique is a premium minimal fashion e-commerce application built with Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, and Supabase. It consists of two primary surfaces:

1. **Customer storefront** — Bilingual (Myanmar default + English) shopping experience with catalog browse, product detail, cart, and search.
2. **Admin dashboard** — Protected back-office for catalog, banner, and store settings management.

The project is mid-transition from a content/catalog MVP toward full commerce. Shopping foundations (variants, cart, PDP) exist locally but checkout, order fulfillment, and server-side cart validation are not yet implemented.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2.10 (App Router) |
| UI | React 19, Tailwind CSS 3.4, Lucide icons |
| State | Zustand (cart + locale persistence) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Language | TypeScript 5.7 (strict) |

---

## Folder Structure

```
build-a-premium-minimal-fashion-boutique/
├── app/
│   ├── layout.tsx                      # Root layout (metadataBase)
│   ├── (storefront)/                   # Customer routes (URL group)
│   │   ├── layout.tsx                  # Header, footer, providers, search index
│   │   ├── page.tsx                    # Homepage
│   │   ├── shop/                       # Product listing
│   │   ├── categories/                 # Category index + [slug]
│   │   ├── product/[slug]/             # Product detail page
│   │   ├── about/, contact/            # Static content pages
│   │   ├── checkout/                   # Checkout stub (untracked)
│   │   └── not-found.tsx
│   ├── admin/                          # Admin dashboard
│   │   ├── login, logout, forgot-password
│   │   ├── products, categories, banners, settings
│   │   └── orders, customers, media    # Placeholder pages
│   ├── api/admin/                      # Protected REST API
│   ├── sitemap.ts, robots.ts
├── components/
│   ├── admin/          # Shell, forms, tables, auth
│   ├── cart/           # Mini cart drawer, line items
│   ├── i18n/           # Language switcher, locale provider
│   ├── layout/         # Header, footer
│   ├── product/        # Cards, gallery, PDP, variants
│   ├── search/         # Product search modal
│   ├── storefront/     # Hero banners, providers
│   └── ui/             # BoutiqueImage, SectionHeader
├── lib/
│   ├── repositories/   # Supabase data access
│   ├── services/       # Business logic layer
│   ├── storefront/     # Catalog, cart, search, metadata, variants
│   ├── supabase/       # Clients, auth helpers, DB types
│   ├── i18n/           # Messages, locale, translators
│   └── admin-*.ts      # Auth, API helpers
├── types/              # Shared TypeScript types
├── supabase/migrations/ # SQL schema, seed, RLS, hero settings
├── public/images/      # Static marketing/product assets
├── scripts/            # RLS verification
├── proxy.ts            # Admin route protection (Next.js 16)
└── outputs/            # Legacy project snapshot (not active)
```

**Scale (approximate):** 38 components · 54 lib modules · 23 app pages · 13 API routes · 4 migrations · 0 test files

---

## Current Architecture

### High-level flow

```
Browser
  ├── Storefront (RSC + client components)
  │     └── lib/storefront/catalog → lib/services → lib/repositories → Supabase (service role)
  ├── Admin UI (client components)
  │     └── /api/admin/* → requireAdminApiSession() → services → Supabase (service role)
  └── Cart (Zustand + localStorage only — no server)

proxy.ts → guards /admin/* routes via Supabase session + allowlist/role check
```

### Layering

| Layer | Responsibility |
|-------|----------------|
| **App routes** | Page composition, metadata, data fetching |
| **Components** | UI by domain (product, cart, admin, etc.) |
| **lib/storefront/** | Storefront-specific mappers, catalog, cart, search |
| **lib/services/** | Business rules (products, categories, banners, settings, orders) |
| **lib/repositories/** | Supabase CRUD with service-role client |
| **lib/supabase/** | Auth clients, hand-maintained `Database` types |
| **types/** | Shared domain types (product, admin, cart, search) |

### Database (Supabase)

| Table | Purpose |
|-------|---------|
| `categories` | Catalog grouping with sort order and publish status |
| `products` | Master product records (sizes/colors arrays, aggregate stock) |
| `banners` | Promotional banners by placement |
| `settings` | Store config, contact/social links, homepage hero (EN/MY) |
| `orders` | Order headers (seed/placeholder data) |
| `customers` | Customer summaries (seed/placeholder data) |

**Not in schema:** `product_variants`, `order_items`, server-side carts, customer auth tables.

### Security model

- **Admin access:** Supabase Auth + `ADMIN_ALLOWED_EMAILS` env allowlist or `role: "admin"` in user metadata
- **Route protection:** `proxy.ts` for pages; `requireAdminApiSession()` for API routes
- **RLS:** Enabled on all tables; anon can read published catalog; authenticated policies are broad (`using (true)`)
- **Storefront reads:** Use service-role client (RLS bypassed at application layer)

---

## Completed Features

### Committed (on `main`, 3 commits ahead of origin)

- [x] Supabase-connected storefront catalog (published products + categories)
- [x] Supabase Auth for admin (login, logout, forgot-password)
- [x] Server-side session validation (`proxy.ts` + API middleware)
- [x] Admin authorization (email allowlist + role check)
- [x] RLS migration + verification script (`npm run verify:rls`)
- [x] Admin CRUD: products, categories, banners, settings
- [x] Admin dashboard overview with metrics
- [x] `robots.txt` disallows admin routes
- [x] Production build passes

### Local / uncommitted (implemented, awaiting commit)

- [x] **Brand consistency** — Store name from admin settings as single source of truth; centralized metadata
- [x] **Shopping foundation (Task 1.3)** — Synthetic variants, Zustand cart, PDP purchase panel, mini cart drawer
- [x] **i18n** — Myanmar (default) + English via cookie/localStorage; wired into header, footer, shop, cart, search
- [x] **Product search** — Modal with live filter, recent searches, Ctrl+K shortcut
- [x] **Hero in admin settings** — Homepage hero driven by settings (not banner placement); migration SQL added
- [x] **Checkout stub** — Placeholder page with i18n strings (no payment or order creation)

---

## In-Progress Features

| Feature | Status | Notes |
|---------|--------|-------|
| **Task 1.4 — Checkout** | Blocked | Awaiting QA approval on UX foundation before starting |
| **Hero settings migration** | SQL ready | `202607190001_settings_hero.sql` — may need manual apply in Supabase |
| **Commit local work** | Pending | ~28 modified + ~27 untracked files not staged |
| **Push to origin** | Pending | Branch is 3 commits ahead of `origin/main` |

### Explicitly not started

- Full checkout flow (shipping, payment, order creation)
- Real `product_variants` table and admin variant editor
- Server-side cart validation
- Order/customer CRUD in admin
- Image upload to Supabase Storage
- Customer accounts on storefront
- Automated tests

---

## Known Issues

### Functional

| Issue | Severity | Detail |
|-------|----------|--------|
| Checkout is a stub | High | `/checkout` has no cart review, shipping, or payment |
| Synthetic variants | High | Variants computed in `lib/storefront/variants.ts`; ~11% combos artificially disabled via hash |
| Client-only cart | High | Prices/stock not validated server-side; stale data possible |
| No slug in DB | Medium | Slugs derived from product name; renames break URLs |
| Hero duplication | Medium | Settings hero used on homepage; `"Homepage Hero"` banner placement unused |
| Hardcoded homepage categories | Low | Featured categories filtered by `["Dresses", "Tops", "Pants", "Bags"]` |
| Orphaned `OrderButtons.tsx` | Low | Legacy Messenger ordering component; not used on PDP |
| Dashboard customer count | Low | Hardcoded `"3"` instead of live query |

### Performance

| Issue | Detail |
|-------|--------|
| `force-dynamic` everywhere | Storefront layout and most pages disable static caching |
| Full catalog per request | `getCatalog()` loads all published products; search index built in layout |
| O(n) slug lookup | `getProductBySlug()` scans full in-memory product list |
| No DB pagination | Shop pagination is client-side over full array |

### UX / i18n

| Issue | Detail |
|-------|--------|
| Partial i18n | About and contact page body copy still hardcoded English |
| Shop filters on mobile | Full filter sidebar stacks above products; no collapsible drawer |
| Admin mobile | Tables use horizontal scroll (`min-w-[680px]`) |
| Hydration guards | Cart badge and language switcher require `hasHydrated` client guard |

### Security

| Issue | Severity | Detail |
|-------|----------|--------|
| Broad RLS authenticated policies | High | Any Supabase authenticated user can manage all admin tables if bypassing app |
| Service role for all reads | Medium | Storefront never exercises anon + RLS path |
| No API input validation | Medium | POST bodies cast with `as Type`; no Zod/schema validation |
| Cart tampering | High (commerce) | Client can modify prices/quantities in localStorage |
| No rate limiting | Medium | Admin auth and API routes unthrottled |

---

## Git Status Summary

**Branch:** `main` (3 commits ahead of `origin/main`, not pushed)

**Recent commits:**

```
2eca8c0 Complete Priority 2 security hardening with admin authorization, RLS tooling, and auth fixes.
da881ff Replace mock admin auth with Supabase Auth and server-side session validation.
8c8dc7e Connect storefront catalog to Supabase published inventory.
```

**Working tree:** Uncommitted local work — nothing staged.

| Category | Count | Examples |
|----------|-------|----------|
| Modified | 28 | Storefront pages, Header/Footer, SettingsForm, product components, types, package.json |
| Untracked | 27 | checkout/, cart/, i18n/, search/, storefront lib, hero migration, new types |

**Suggested commit grouping (when ready):**

1. Brand consistency + metadata centralization
2. Shopping foundation (cart, variants, PDP, Zustand)
3. UX foundation (i18n, search, hero settings)

---

## Technical Debt

| Item | Priority | Description |
|------|----------|-------------|
| Synthetic variant system | P0 | Must move to `product_variants` table before production checkout |
| Client-only cart | P0 | Needs server validation at checkout |
| `ProductManager.tsx` monolith | P1 | ~747 lines; form, list, filters, and API in one file |
| `lib/admin-data.ts` legacy | P1 | Coexists with Supabase; partially used for formatting/seed |
| Manual Supabase types | P2 | `lib/supabase/types.ts` can drift from schema |
| `date` vs `timestamptz` | P2 | Weak audit trail on `updated_at` / `created_at` |
| No test suite | P2 | Zero unit, integration, or E2E tests |
| `outputs/` folder | P3 | Stale duplicate project tree |
| Admin metadata branding | P3 | Layout template still says "Atelier Lune Admin" |
| No shared form components | P3 | Input/label classes duplicated across admin forms |

---

## Recommended Next Development Sprint

**Sprint goal:** Complete commerce MVP path — from cart to confirmed order — with mobile-first checkout UX.

### Week 1 — Foundation & commit hygiene

1. **Commit and push local work** in logical chunks (brand → shopping → UX)
2. **Apply hero migration** in Supabase if not already applied
3. **Design schema additions:**
   - `product_variants` (id, product_id, sku, size, color, price, stock)
   - `order_items` (order_id, variant_id, quantity, unit_price)
   - Extend `orders` with shipping/payment fields
   - Add `products.slug` column with unique index
4. **QA sign-off** on i18n, search, hero, and cart UX

### Week 2 — Checkout (Task 1.4)

1. **Checkout page** — Cart review, shipping form, order summary
2. **Server-side validation** — Verify variant stock and prices against DB at submit
3. **Order creation API** — Persist order + line items; clear cart on success
4. **Confirmation page** — Order number, summary, contact/shipping details
5. **Admin orders** — Replace placeholder with real order list and status updates

### Week 3 — Mobile-first polish

1. **Shop filter drawer** — Collapsible sheet on mobile instead of inline sidebar
2. **Sticky PDP CTA** — Fixed "Add to bag" bar on mobile viewports
3. **Bottom navigation** — Shop · Search · Cart · Menu (optional account slot)
4. **Complete i18n** — About, contact, checkout confirmation strings
5. **Performance pass** — ISR for catalog with `revalidateTag`; slug-indexed DB queries

### Week 4 — Hardening

1. **Narrow RLS policies** — Admin role check in JWT, not `using (true)`
2. **Zod validation** on all admin API routes
3. **Remove dead code** — `OrderButtons.tsx`, unused banner placement logic
4. **Playwright E2E** — Browse → add to cart → checkout happy path
5. **Payment integration spike** — Evaluate KBZPay, Wave, or Stripe for Myanmar market

### Success criteria for sprint

- [ ] Customer can complete checkout and receive an order confirmation
- [ ] Admin can view and update order status
- [ ] Variant stock is stored in DB and validated server-side
- [ ] Mobile shop and PDP feel native (filter drawer, sticky CTA)
- [ ] All local work committed and pushed to `origin/main`
- [ ] Build and basic E2E test pass in CI

---

## Appendix: Key Files Reference

| Area | Key files |
|------|-----------|
| Catalog | `lib/storefront/catalog.ts`, `map-catalog.ts`, `variants.ts` |
| Cart | `lib/storefront/cart/store.ts`, `components/cart/MiniCartDrawer.tsx` |
| Auth | `proxy.ts`, `lib/admin-authorization.ts`, `lib/admin-api.ts` |
| i18n | `lib/i18n/messages/en.ts`, `my.ts`, `lib/i18n/locale-store.ts` |
| Search | `lib/storefront/search.ts`, `components/search/ProductSearchModal.tsx` |
| Settings/Hero | `lib/storefront/settings.ts`, `map-settings.ts`, `components/storefront/HomeHeroBanner.tsx` |
| Admin products | `components/admin/forms/ProductManager.tsx`, `app/api/admin/products/` |
| Migrations | `supabase/migrations/` (4 files) |

---

*This document is read-only audit output. Update after each major sprint or before starting a refactor phase.*
