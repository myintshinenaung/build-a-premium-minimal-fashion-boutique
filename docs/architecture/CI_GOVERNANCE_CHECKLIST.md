# CI governance checklist

Run before merging any **FBEA migration** PR (Phase 2+). Phase 0–1 scaffold-only PRs use the same gates to prove no regression.

## Required commands

| Step | Command | Must pass |
|------|---------|-----------|
| 1 | `npm run typecheck` | Yes |
| 2 | `npm run lint` | Yes (or documented waiver with ticket) |
| 3 | `npm run build` | Yes |
| 4 | `npm run verify:rls` | Yes when DB or RLS touched |

## PR requirements

- [ ] One feature (or scaffold phase) per PR where possible
- [ ] No unrelated business logic changes
- [ ] Import graph diff reviewed (ADR-002)
- [ ] QA smoke notes for affected surface (storefront / admin)
- [ ] Rollback: revert commit or restore checkpoint branch

## Checkpoints

Create `checkpoint/pre-fbea-phase-<N>-<date>` before each phase that moves code.

**Phase 0–1 checkpoint:** `checkpoint/pre-fbea-phase-0-1-20260723`
