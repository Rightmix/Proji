# PROJI — Change Log

## 2026-09-27 — Project initialization
- Initialized GitHub repository documentation.
- Established 12-stage roadmap, product requirements, architecture decisions and change-management conventions.
- Stage 1 remains in progress; no application code, deployment, Supabase connection or test completion has been verified.

Future entries: date, change, reason, affected requirements/stages, Issue or PR and verification status.

## 2026-09-27 — Stage 4 animated customization planning update
- Approved hybrid photography/AI-assisted visual asset workflow, sticky mobile bowl preview and all-15-ingredient animation milestone with illustrative nutrition.
- Expanded Stage 4 file-by-file implementation plan, selection rules, animation engine, acceptance tests and downstream integration dependencies.
- Revised provisional Stage 4 visual milestone effort to 16–30 sequential working days; Stage 4 remains planned and application implementation remains unauthorized.
- Updated related roadmap, requirements, design-stage notes, decision log and GitHub planning Issues.

## 2026-09-29
- Stage 1 foundation scaffold (app, routes, auth, roles/RLS migration, tests, CI). Hosted Supabase/Vercel verification pending.

## 2026-09-30: Stage 2 design system (in review)
- Tokens, self-hosted typography, UI primitives reusable by Stage 4, responsive sticky navigation, homepage, asset registry and accessibility/motion foundations.
- Vitest 76/76, Playwright 60/60 (including axe WCAG 2.2 AA), lint, format and build all pass locally. Hosted preview pending.
- The homepage hero is a reference-placeholder image. The four-screen mockup candidate was added to docs/design and needs confirmation.

## 2026-09-30: Stage 3 menu and catalog (draft, in review)
- Added the catalog domain model with a validated-data gate for price, nutrition and allergens, a repository interface, derived filters with URL state, the `/menu` and `/menu/:slug` pages, availability states, image fallbacks, and loading/error/empty states.
- Added labelled development fixture bowls. They are never shown in production by default and carry no prices, nutrition or allergens. No database changes.
- Tests: Vitest 115/115 and Playwright 90/90 (including axe on the menu and detail pages) pass locally.

## 2026-09-30: Stage 4 bowl builder (draft, in review)
- Saved the approved four-screen master to `docs/design/approved/` and removed the downscaled candidate.
- The `/build` animated builder: sticky layered bowl, BASE/PROTEIN/FLAVOUR/TOPPING steps, selection limits, live illustrative macros and price, View Nutrition, share link, Stage 3 presets, and a prototype Add to Cart.
- 30 procedural prototype assets (about 430 KB) with a generator script and manifest. No database changes.
