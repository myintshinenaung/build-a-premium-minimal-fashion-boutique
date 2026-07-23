# Bible traceability matrix

Maps NOVORA platform Bibles to **feature modules** and **current repository paths**. Update as each phase completes.

| Bible | Feature module | Current paths (legacy) | Phase | Status |
|-------|----------------|----------------------|-------|--------|
| Database | (platform) | `supabase/migrations/` | — | Active |
| API | catalog, settings, content, identity | `app/api/admin/*` | 5+ | Not started |
| Backend | all features | `lib/services/`, `lib/repositories/` | 2–9 | Not started |
| Frontend | all `ui/` layers | `components/*`, `app/(storefront)/`, `app/admin/` | 2–9 | Not started |
| Implementation | per feature README | See `features/*/README.md` | 0–1 | Scaffold |
| Business / Product | — | Product requirements (external docs) | — | Reference |

## Feature ↔ domain quick map

| Feature | Primary legacy locations |
|---------|-------------------------|
| catalog | `lib/storefront/catalog.ts`, `map-catalog.ts`, `variants.ts`, `lib/repositories/product-*`, `components/product/` |
| cart | `lib/storefront/cart/`, `components/cart/` |
| checkout | `app/(storefront)/checkout/` |
| search | `lib/storefront/search*.ts`, `components/search/` |
| settings | `lib/storefront/settings.ts`, `map-settings.ts`, `metadata.ts`, `SettingsForm` |
| content | `lib/storefront/banners.ts`, `components/storefront/*Banner*` |
| identity | `lib/admin-auth*.ts`, `lib/supabase/auth-*`, `proxy.ts`, `components/admin/auth/` |
| orders | `lib/services/order-service.ts`, `app/admin/orders/` |
| i18n | `lib/i18n/`, `components/i18n/` |

## Column definitions

- **Phase:** Migration phase from [blueprint](./NOVORA_FBEA_MIGRATION_BLUEPRINT.md).
- **Status:** `Scaffold` | `Shim` | `Migrated` | `Decommissioned`.
