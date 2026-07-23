# ADR-002: Module import boundaries

**Status:** Accepted  
**Date:** 2026-07-23  
**Depends on:** ADR-001

## Decision

1. **Features expose a public API** via `features/<name>/index.ts` (to be added when code moves).
2. **Other features may import only** from `@/features/<name>` (barrel), not deep paths like `@/features/catalog/infrastructure/...`.
3. **`shared/` is imported by features**; `shared/` must not import from `features/`.
4. **`app/` imports features and shared**; features must not import from `app/`.
5. **Enforcement:** ESLint `no-restricted-imports` (planned Phase 0+); not enabled until first code move.

## Current state (Phase 0–1)

- Legacy imports (`@/lib/*`, `@/components/*`) remain authoritative.
- New folders are **scaffold-only**; no boundary violations yet.

## Consequences

- Prevents circular dependencies and hidden coupling during migration.
- Requires discipline on PR reviews until lint rules land.
