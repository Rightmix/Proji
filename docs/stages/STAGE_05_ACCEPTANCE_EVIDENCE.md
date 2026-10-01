# Stage 05: Acceptance evidence (2026-10-01, local sandbox)

| ID group | Result | Evidence |
|---|---|---|
| DB-01 to DB-13 | Pass | `npm run test:rls` → "ALL RLS TESTS PASSED" and "ALL STAGE 5 RLS TESTS PASSED". Five mutation checks were detected |
| V-01 to V-03, B-01 to B-06, R-01 | Pass | `src/features/account/*.test.ts`, `src/features/builder/savedBowlCodec.test.ts` |
| U-01 to U-12 | Pass | `src/pages/account/account.test.tsx`, `src/pages/CustomizePage.accounts.test.tsx`, `e2e/account.spec.ts` |
| U-13, U-14 | Pass | `e2e/account.spec.ts` (overflow at 320/360/390/768/1280 px; 44 px targets; keyboard-only address flow and dialog) |
| U-15 | Pass | `e2e/a11y.spec.ts`: account pages and dialogs |
| X-01 | Pass | Vitest 272/272; Playwright 149 passed, 5 skipped |
| Hosted verification | **Pending** | Requires the migration to be applied to the PROJI Supabase project and a preview deployment |
