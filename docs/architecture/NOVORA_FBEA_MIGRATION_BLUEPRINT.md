# NOVORA FBEA migration blueprint

**Status:** Approved  
**Application:** NOVORA Platform (Next.js 16 + Supabase)  
**Strategy:** Strangler migration — no big-bang rewrite

## Current architecture (summary)

- **Layer-first:** `app/` routes, `components/` by type, `lib/repositories` + `lib/services` + `lib/storefront`, global `types/`.
- **Surfaces:** Storefront `(storefront)/`, Admin `admin/`, API `api/admin/`.
- **Security:** `proxy.ts`, Supabase Auth, RLS on catalog tables.

## Target architecture (summary)

- **`features/<name>/`:** `domain`, `application`, `infrastructure`, `ui` (storefront + admin).
- **`shared/`:** UI kit, Supabase, auth, config, utils.
- **`app/`:** Thin routing shell only.

See [ADR-001](../adr/ADR-001-feature-based-enterprise-architecture.md).

## Migration phases

| Phase | Focus | Code moves? |
|-------|--------|-------------|
| 0 | Governance, ADRs, traceability | No |
| 1 | Scaffold `features/`, `shared/` | No |
| 2 | i18n pilot | Yes (with shims) |
| 3 | Settings & brand | Yes |
| 4 | Content (banners) | Yes |
| 5 | Catalog | Yes |
| 6 | Search | Yes |
| 7 | Cart & checkout | Yes |
| 8 | Identity | Yes |
| 9 | Orders | Yes |
| 10 | Decommission shims | Yes |
| 11 | Enterprise hardening | Ongoing |

## Risks (top)

- Import churn / merge conflicts → one feature per PR, shims.
- Circular feature dependencies → public barrels only (ADR-002).
- Catalog + variant DB work collision → sequence catalog shell before variant schema.

## Rollback

- Revert PR; keep shims until Phase 10.
- Checkpoint branches before each phase.
- No schema changes in Phases 0–8.

## Effort (indicative)

~12–18 calendar weeks, ~53–88 person-days (1 senior + 1 mid), excluding variant/checkout product work.

---

Full architectural analysis was approved in planning session 2026-07-23. This file is the persisted summary for the repository.

