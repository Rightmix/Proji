# PROJI — Decision Log

Decisions may be **Confirmed**, **Proposed**, **Under review** or **Superseded**. Do not treat a proposed technology as deployed.

| ID | Date | Decision | Status | Rationale / consequence |
|---|---|---|---|---|
| D-001 | 2026-09-27 | PROJI is a customizable Indian congee/protein bowl platform initially targeting Calicut | Confirmed concept | Guides MVP and pilot |
| D-002 | 2026-09-27 | Four-step base → protein → flavor → toppings builder | Confirmed product direction | Requires validated compatibility, price and nutrition logic |
| D-003 | 2026-09-27 | Mobile-first PWA using React, TypeScript, Vite and Tailwind | Proposed architecture | Faster initial delivery; native app deferred |
| D-004 | 2026-09-27 | Supabase/PostgreSQL/Auth, Vercel and GitHub | Proposed architecture | Requires setup and security verification |
| D-005 | 2026-09-27 | Customer, admin/R&D and kitchen route areas sharing one backend | Proposed architecture | Centralizes order and recipe data with strict role permissions |
| D-006 | 2026-09-27 | Three signature bowls and limited Calicut pilot | Proposed pilot | Validate operational capacity and demand before expansion |
| D-007 | 2026-09-27 | Defer subscriptions and personalized nutrition beyond initial ordering MVP | Proposed sequencing | Reduce early complexity and clinical-claim risk |

Record alternatives, impact and approval before major architectural changes.

| D-008 | 2026-09-27 | Stage 4 visual assets use hybrid food photography and AI-assisted asset production, manually aligned and approved | Confirmed planning direction | Consistent realistic bowl layers and distinct animations for all 15 ingredients |
| D-009 | 2026-09-27 | Mobile bowl preview remains fixed near top while ingredient options scroll beneath | Confirmed planning direction | Responsive sticky layout with short-screen and safe-area fallbacks |
| D-010 | 2026-09-27 | First Stage 4 milestone includes all ingredient animations with explicitly illustrative nutrition and pricing | Confirmed planning scope | Validated recipe integration and live orders deferred; no code authorized yet |
| D-011 | 2026-09-27 | Approved four-screen mockup is master design reference | Confirmed requirement; reference asset pending | Obtain actual mockup before implementation; no generic-form substitution |
| D-012 | 2026-09-30 | Extend the brand palette with warm-grey surfaces, natural-green selection (#599A3D) and deep-green actions (#2E6B34); lime #70C043 kept as an accent only (fails text contrast) | Proposed | Matches the four-screen reference and passes WCAG AA; needs owner approval |
| D-013 | 2026-09-30 | Inter (UI) + Fraunces (display headings), self-hosted with @fontsource | Proposed | No third-party font requests; the serif echoes the brand reference |
| D-014 | 2026-09-30 | Catalog price, nutrition and allergens are typed `Verified<T>`: `unavailable`, or `validated` with a source and date. The UI shows only validated values; fixtures can never carry validated values. | Proposed architecture | Stops placeholder figures from being published. Stage 7 supplies validated values. |
| D-015 | 2026-09-30 | The catalog reads through a `CatalogRepository` interface. Production defaults to an empty catalog, and dev/test/previews use labelled, code-split fixtures. Supabase catalog tables are deferred to Stage 7. | Proposed architecture | Avoids fake production data and schema churn before recipes are validated. |
| D-016 | 2026-09-30 | The builder uses one reducer with **fixed flavour (2) and topping (3) slots**. Layers, macros, price and the configuration are all derived from it, and layers are keyed by category, slot and ingredient. | Proposed architecture | Deterministic placement; replaced layers unmount, so rapid changes can't leave stale or duplicate layers |
| D-017 | 2026-09-30 | Layer animations use CSS keyframes (clip-path, transforms, conic mask) and start after image decode; no animation library | Proposed architecture | Small bundle and good mobile performance; reduced motion is honoured globally |
| D-018 | 2026-09-30 | Until photography exists, Stage 4 uses **procedural prototype illustrations** that follow the final alignment rules | Proposed (needs owner acceptance) | Unblocks the engine and tests; replacing them is a file swap |
| D-019 | 2026-09-30 | `BowlConfiguration` (IDs only) is the hand-off to Stages 5, 6, 8 and 9. Client prices and nutrition are display-only, and Stage 6 must reprice on the server. | Proposed architecture | Prevents trusting client-side fixture prices |
| D-020 | 2026-10-01 | Customer-owned tables (`customer_addresses`, `customer_preferences`, `saved_bowls`) use `user_id default auth.uid()`, a single `for all` own-rows RLS policy, and column-level grants that exclude `user_id`, `id` and timestamps. Staff get no access in Stage 5. | Proposed architecture | Ownership is enforced at two layers; staff access will be added explicitly per stage (e.g. Stage 8 delivery address via orders) |
| D-021 | 2026-10-01 | Default-address uniqueness is enforced by a partial unique index, with SECURITY INVOKER triggers and a `set_default_address` RPC that run under the caller's RLS | Proposed architecture | No SECURITY DEFINER code is needed; atomic switching |
| D-022 | 2026-10-01 | Saved bowls persist the Stage 4 `BowlConfiguration` (IDs only, v1). The DB CHECK validates the shape and limits; `savedBowlCodec` is the single decode boundary, and unknown or unavailable items are reported, never substituted. | Proposed architecture | The same boundary will be used for Stage 6 carts and order snapshots |
| D-023 | 2026-10-01 | E2E tests run against a `VITE_TEST_AUTH` build (simulated auth plus an in-memory store that mirrors RLS); real isolation is tested in the SQL RLS suite. The production bundle is checked to exclude the test code. | Proposed (testing) | Enables account UI E2E without hosted credentials in CI |
| D-024 | 2026-10-02 | Meal cards and detail pages may show **illustrative** kcal, macros and ₹, but only for bowls whose components are all Stage 4 builder ingredients, and always labelled "Illustrative". Anything else shows "Nutrition pending". The D-014 validated panel is unchanged. | Proposed (amends D-014 for display) | The approved design needs nutrition everywhere; no validated data exists yet |
| D-025 | 2026-10-02 | Prototype cart and favourites are device-local (`localStorage`) and store IDs only; prices and nutrition are recomputed. Checkout creates no order, and the confirmation is a labelled preview. | Proposed (temporary until Stage 6 / a favourites table) | Lets the UI be built without schema changes or fake orders |
| D-026 | 2026-10-02 | The Stage 5.5 approved board supersedes the Stage 4 four-screen master **for layout**: left step rail, 3-column tiles, "Build Your Own" title. The action green is brightened to `#187a40`, which is AA-tested. | Approved by owner (layout); proposed (green value) | Owner-approved design direction |
