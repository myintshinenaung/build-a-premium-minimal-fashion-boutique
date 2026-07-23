# Shared kernel (`shared/`)

Cross-feature technical building blocks. Phase 0–1: **scaffold only** — legacy code remains in `lib/` and `components/ui/`.

| Folder | Future home for (legacy) |
|--------|---------------------------|
| [ui](./ui/README.md) | `components/ui/*` |
| [supabase](./supabase/README.md) | `lib/supabase/*` |
| [auth](./auth/README.md) | `lib/admin-auth*.ts`, `lib/admin-api.ts`, session helpers |
| [config](./config/README.md) | `lib/storefront/site-url.ts`, env conventions |
| [utils](./utils/README.md) | `lib/utils.ts` |

**Rule:** `shared/` must not import from `features/` (ADR-002).
