# ADR-001: Feature-Based Enterprise Architecture (FBEA)

**Status:** Accepted  
**Date:** 2026-07-23  
**Context:** NOVORA enterprise platform; working Next.js + Supabase monolith (Atelier Lune Boutique).

## Decision

Adopt **Feature-Based Enterprise Architecture**:

- Vertical **feature modules** under `features/` own domain, application, infrastructure, and UI.
- **`app/` remains the routing shell** (Next.js App Router); pages compose features without growing business logic.
- **Shared kernel** under `shared/` for cross-cutting technical concerns (UI kit, Supabase clients, auth helpers, config, utils).
- Migrate incrementally (strangler fig); **do not rewrite** working behavior.

## Feature layers

| Layer | Responsibility |
|-------|----------------|
| `domain/` | Types, entities, pure rules |
| `application/` | Use cases, orchestration (services) |
| `infrastructure/` | Repositories, mappers, external adapters |
| `ui/` | React components (`storefront/` and `admin/` channels) |

## Consequences

- **Positive:** Cohesion, Bible traceability, safer scaling (catalog, orders, variants).
- **Negative:** Short-term duplication via re-export shims until Phase 10 decommission.
- **Neutral:** Existing `@/*` imports remain valid during migration.

## References

- [Migration blueprint](../architecture/NOVORA_FBEA_MIGRATION_BLUEPRINT.md)
- [Module boundaries (ADR-002)](./ADR-002-module-import-boundaries.md)
