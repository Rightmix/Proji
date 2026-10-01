# Stage 03 — Menu and catalog

**Status:** Complete. Merged to `main` (`1edba53`) and reported production-verified by the owner (2026-10-01). Evidence and history are in the stage report.

## Objective and scope
Signature congee bowl catalog, validated descriptions, images, filters and availability.

## Dependencies
Prior relevant foundation, data and workflow stages; review architecture and approved requirements before implementation.

## Deliverables
Implemented feature(s), appropriate documentation, tests and a reviewed pull request.

## Acceptance criteria
Document task-specific functional, permission, mobile usability and operational tests before coding; execute and record real test results. Validate nutrition, prices and allergen data before publishing where applicable. Update related Issues, roadmap and changelog with evidence.

## Risks and deferred decisions
Confirm recipes, data sources, operational constraints, security, third-party integrations and costs before committing to production behavior. Do not mark complete without review.

## Implemented architecture (2026-09-30)
- **Model** (`src/features/catalog/types.ts`): `SignatureBowl` has a `baseFamily` (rice, red-rice, brown-rice, millet, quinoa, oats) and a `proteinType` (chicken, fish, beef, egg, vegetarian). Both are registries, so adding a family is a data change. Components carry stable `role.slug` ingredient IDs; the roles are base, protein, flavour, vegetable, topping and accompaniment. These IDs are shared with the Stage 4 builder and Stage 7 recipes. `availability` is one of available, sold-out, coming-soon or unavailable.
- **Validated data gate:** `price`, `nutrition` and `allergens` are `Verified<T>`, which is either `unavailable` or `validated` with a source and a validation date. Stage 3 renders only "Pending validation". `dataStatus` is `development-fixture` or `validated`, and `recipeVersionId` stays null until Stage 7.
- **Repository interface:** `CatalogRepository` (`listBowls`, `getBowl`) is injected through `CatalogProvider`. The static and lazy implementation validates integrity and refuses to serve an invalid catalog. Stage 7 adds a Supabase-backed implementation.
- **Source policy:** development and test builds use development fixtures. Production builds default to an **empty** catalog, which shows "menu coming soon". `VITE_CATALOG_SOURCE=fixtures` enables the labelled fixtures for previews only. Fixtures are code-split and never fetched when the catalog is empty.
- **UI:** `/menu` has base and protein filter chips plus "Available now only". Filter state lives in the URL, and filter options are derived from the data. The page has loading, error with retry, empty and no-match states. `/menu/:slug` shows components grouped by role, availability, a pending price/nutrition/allergen panel, and a "Customise" link to `/build?bowl=<slug>` for available bowls only. Unknown slugs get a not-found state.
- **No database changes.** Catalog tables are deferred to Stage 7 with validated recipes (D-015).
