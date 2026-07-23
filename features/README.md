# Feature modules (`features/`)

NOVORA **Feature-Based Enterprise Architecture** vertical slices. Phase 0–1: **scaffold only** — no business logic moved.

## Layers

| Folder | Owns |
|--------|------|
| `domain/` | Types, entities, pure rules |
| `application/` | Use cases, orchestration |
| `infrastructure/` | Repositories, mappers, adapters |
| `ui/storefront/` | Customer-facing components |
| `ui/admin/` | Back-office components |

## Modules

| Feature | Status |
|---------|--------|
| [catalog](./catalog/README.md) | Scaffold |
| [cart](./cart/README.md) | Scaffold |
| [checkout](./checkout/README.md) | Scaffold |
| [search](./search/README.md) | Scaffold |
| [settings](./settings/README.md) | Scaffold |
| [content](./content/README.md) | Scaffold |
| [identity](./identity/README.md) | Scaffold |
| [orders](./orders/README.md) | Scaffold |
| [i18n](./i18n/README.md) | Scaffold |

Import boundaries: [ADR-002](../docs/adr/ADR-002-module-import-boundaries.md)
