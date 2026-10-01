# Stage 5 Report: Customer Accounts

**Date:** 2026-10-01. **Branch:** `stage-5/customer-accounts`. **Status:** draft PR, in review. Not complete until the migration has been applied and verified on the hosted PROJI Supabase project, the PR has been reviewed, and the hosted preview has been checked.
Acceptance tests (defined before implementation): [docs/stages/STAGE_05_ACCEPTANCE_TESTS.md](docs/stages/STAGE_05_ACCEPTANCE_TESTS.md). Security model: [docs/SECURITY.md](docs/SECURITY.md).

## Implemented
See "Implemented scope" in [STAGE_05_ACCOUNTS.md](docs/stages/STAGE_05_ACCOUNTS.md).
- **Account pages:** profile, addresses, preferences, saved bowls and an order-history boundary.
- **Builder:** save and reopen bowls.
- **Database:** one migration with RLS.

## Database
- **Migration:** `supabase/migrations/20261001000001_stage5_customer_accounts.sql`. Rollback: `supabase/rollback/20261001000001_stage5_customer_accounts.down.sql` (destructive; needs approval).
- **Not yet applied to any hosted project:** this session had no access to verified PROJI Supabase credentials. The owner must apply it with `supabase db push` against the PROJI project.

## Test evidence (local sandbox, 2026-10-01)
| Check | Result |
|---|---|
| Lint, format, `tsc -b`, `vite build` | Pass, 0 warnings. Main bundle 247 kB / 77 kB gzip, because the account pages are now lazy-loaded chunks |
| `npm run check:bundle` | Pass: no test-auth code or privileged keys in the production bundle |
| `npm run test:rls` | **Pass**: Stage 1 suite unchanged, plus the new Stage 5 suite (DB-01 to DB-13). Mutation checks confirmed the suite fails if the address policy is opened to all rows, `user_id` becomes insertable, default switching is removed, the flavour limit is relaxed or the bowl cap is raised |
| Vitest | **272/272 pass**: 210 from Stages 1–4 plus 62 new (codec, validation, memory-repository ownership, Supabase mapping, account pages, builder save/load) |
| Playwright (Pixel 7 + Desktop Chrome, `VITE_TEST_AUTH` build) | **149 passed, 5 skipped** (desktop skips of the mobile-only visual baselines). Covers all Stage 1–4 suites, account flows, keyboard-only address flow, save/reopen bowl, signed-out save return, cross-user isolation, expired session, orders boundary, no overflow from 320 to 1280 px, 44 px targets |
| axe WCAG 2.2 AA | 0 serious or critical issues on all 7 account pages, the address-form error state, and the save-bowl and delete-confirmation dialogs |

## Existing tests changed
None of the existing assertions were changed.
- The Playwright web server now builds with `VITE_TEST_AUTH=true`. Signed-out behaviour is unchanged, so the Stage 1 redirect tests still apply.
- The builder visual baselines still pass within the existing 2% tolerance, even with the new "Save bowl" link.

## Open items
- Apply the migration to the hosted PROJI Supabase project, then re-run the RLS checks against it (for example with the Supabase SQL editor using the test file adapted for real auth).
- Hosted preview verification of sign-in, the account pages and save/reopen bowl with a real Supabase session.
- Decisions D-020 to D-023.
