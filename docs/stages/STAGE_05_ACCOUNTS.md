# Stage 05 — Customer accounts

**Status:** In review (2026-10-01), as a draft PR on `stage-5/customer-accounts`. Evidence: [STAGE_5_REPORT.md](../../STAGE_5_REPORT.md); tests: [STAGE_05_ACCEPTANCE_TESTS.md](STAGE_05_ACCEPTANCE_TESTS.md).

## Objective and scope
Sign-in, customer profiles, addresses, preferences, saved bowls and order history.

## Dependencies
Prior relevant foundation, data and workflow stages; review architecture and approved requirements before implementation.

## Deliverables
Implemented feature(s), appropriate documentation, tests and a reviewed pull request.

## Acceptance criteria
Document task-specific functional, permission, mobile usability and operational tests before coding; execute and record real test results. Validate nutrition, prices and allergen data before publishing where applicable. Update related Issues, roadmap and changelog with evidence.

## Risks and deferred decisions
Confirm recipes, data sources, operational constraints, security, third-party integrations and costs before committing to production behavior. Do not mark complete without review.

## Implemented scope (2026-10-01)
- **Routes:** everything under `/account` is protected by the Stage 1 `RequireRole` (any signed-in role) and lazy-loaded:
  - overview with sign out
  - `profile`: name and phone; email is read-only from auth
  - `addresses`, `addresses/new`, `addresses/:id`: list, add, edit, delete with confirmation, default address; labels Home, Work and Other (with a custom name)
  - `preferences`: spice level and cutlery only
  - `bowls`: list, open in builder, rename, delete with confirmation
  - `orders`: Stage 6 boundary, showing an empty state only
- **Addresses:** country-agnostic, using an ISO 3166-1 alpha-2 country code, recipient, phone, line 1 and 2, area, city, region, postal code, landmark and instructions. The UI offers India (6-digit PIN required) and Bahrain (block/road; postal code optional).
- **Saved bowls:** store only the Stage 4 `BowlConfiguration` (ingredient IDs). Every restore goes through `src/features/builder/savedBowlCodec.ts`. It re-validates the shape and limits, rejects corrupted data, and reports unknown or unavailable ingredients without substituting them. `/build?saved=<id>` reopens a bowl, and "Save bowl" in the builder footer saves one; signed-out users are sent to sign in and returned to the same bowl.
- **Data access:** an `AccountRepository` interface. The Supabase implementation uses the publishable key with RLS. An in-memory implementation mirrors the database rules and is used by unit tests and the E2E-only `VITE_TEST_AUTH` build. `npm run check:bundle` fails CI if test-auth code reaches a production bundle.
- **Database:** see the migration `20261001000001_stage5_customer_accounts.sql` and docs/SECURITY.md.

## Explicitly not in Stage 5
Cart, checkout, payments, delivery scheduling, real orders, kitchen, subscriptions, recommendations, validated nutrition, password reset and email-provider changes.
