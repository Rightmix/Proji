# Stage 05 — Acceptance tests (defined before implementation, 2026-10-01)

Results are recorded in `STAGE_5_REPORT.md`.

## Database / RLS (`supabase/tests/rls_stage5_test.sql`, run by `npm run test:rls`)
| ID | Test |
|---|---|
| DB-01 | Migrations apply to a clean database after Stage 1 |
| DB-02 | `anon` cannot read or write profiles, addresses, preferences or saved bowls |
| DB-03 | User A cannot select, update or delete User B's profile, addresses, preferences or saved bowls, including by guessing row IDs |
| DB-04 | Inserting a row for another user fails (`user_id` defaults to and is checked against `auth.uid()`; the column is not insertable or updatable) |
| DB-05 | A user can insert their own missing profile row only (missing-profile recovery); no duplicates |
| DB-06 | Address constraints: label enum, required fields, phone format, ISO country code, length limits, max 20 per user |
| DB-07 | Default address: the first address becomes default; setting a new default unsets the old one; at most one default per user (unique index); deleting the default promotes another |
| DB-08 | `set_default_address` RPC is SECURITY INVOKER and cannot affect another user's addresses |
| DB-09 | Saved bowl configuration CHECK rejects malformed JSON shapes, bad ID formats, more than 2 flavours or 3 toppings, duplicates and unknown versions; name 1–60 characters, unique per user (case-insensitive); max 50 per user |
| DB-10 | Preferences: one row per user; enum constraint on spice level |
| DB-11 | Deleting the auth user cascades all customer-owned rows |
| DB-12 | Kitchen/admin roles get **no** extra access to customer addresses, preferences or saved bowls (no staff read policies in Stage 5) |
| DB-13 | Stage 1 RLS suite still passes unchanged |

## Domain (unit)
| ID | Test | File |
|---|---|---|
| V-01 | Profile validation (name, phone) | `src/features/account/validation.test.ts` |
| V-02 | Address validation for IN and BH shapes; postal code optional; country-agnostic | same |
| V-03 | Preference validation | same |
| B-01 | Saved-bowl codec round-trip for valid Stage 4 configurations | `src/features/builder/savedBowlCodec.test.ts` |
| B-02 | Malformed payloads (non-object, missing keys, wrong types, bad version) are rejected | same |
| B-03 | Unknown and wrong-category IDs → `stale` with the missing items listed; never substituted | same |
| B-04 | Unavailable ingredient → `stale`, item excluded and reported | same |
| B-05 | Limits: more than 2 flavours or 3 toppings rejected; duplicates rejected | same |
| B-06 | Old saved configuration after ingredient list changes restores the valid parts only | same |
| R-01 | In-memory repository enforces ownership like RLS (used by tests and the test build) | `src/features/account/memoryRepository.test.ts` |

## UI (component + E2E)
| ID | Test | Where |
|---|---|---|
| U-01 | Signed out: `/account/*` redirects to login and returns to the requested page after sign-in | `account.test.tsx`, `e2e/account.spec.ts` |
| U-02 | Overview shows email and links; sign out returns to the signed-out state | both |
| U-03 | Profile edit with inline validation, focus moved to the first invalid field, saved confirmation | both |
| U-04 | Missing profile row is recreated transparently | `account.test.tsx` |
| U-05 | Addresses: empty, loading and error states; add/edit/delete (confirmation dialog); default switching; labels | both |
| U-06 | Preferences persist after reload | both |
| U-07 | Saved bowls: save from `/build` (name prompt), list, rename, delete (confirmation), open restores selections in `/build` | both |
| U-08 | Saving while signed out sends you to login and back to the same bowl | `CustomizePage.test.tsx` |
| U-09 | `/build?saved=<malformed>` and stale saved bowls show a safe notice without crashing or substituting | both |
| U-10 | Expired session (repository auth error) shows a "sign in again" state | `account.test.tsx` |
| U-11 | Order history shows an empty-state boundary only; no fake orders | both |
| U-12 | Malformed address ID route → not found | `account.test.tsx` |
| U-13 | Mobile: no horizontal overflow at 320–1280 px; touch targets ≥ 44 px | `e2e/account.spec.ts` |
| U-14 | Keyboard-only completion of the address form and delete confirmation | `e2e/account.spec.ts` |
| U-15 | axe WCAG 2.2 AA: 0 serious/critical on every account page and dialog | `e2e/a11y.spec.ts` |
| X-01 | Stage 1–4 unit, RLS and E2E suites pass | all |
