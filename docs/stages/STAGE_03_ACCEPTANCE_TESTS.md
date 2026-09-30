# Stage 03 — Acceptance tests (defined before implementation, 2026-09-30)

Results recorded in `STAGE_3_REPORT.md`.

## Data model and integrity
| ID | Test | Where |
|---|---|---|
| D-01 | Catalog integrity: unique ids/slugs, valid slug format, at least one base and one protein component per bowl, known roles/families | `src/features/catalog/validation.test.ts` |
| D-02 | Development fixtures carry `dataStatus: 'development-fixture'` and **no** validated nutrition, price or allergen values | `src/features/catalog/fixtures.test.ts` |
| D-03 | Validator rejects a bowl that claims validated nutrition/price/allergens without source + validation date, or a fixture that claims validated data | `validation.test.ts` |
| D-04 | Component ingredient IDs use the `role.slug` convention shared with Stage 4 (`base.*`, `protein.*`, `flavour.*`, `topping.*`, `vegetable.*`, `accompaniment.*`) | `validation.test.ts` |
| D-05 | Catalog source selection: fixtures in dev/test or when `VITE_CATALOG_SOURCE=fixtures`; production default is an empty catalog (no sample data published) | `src/features/catalog/source.test.ts` |

## Filtering
| ID | Test | Where |
|---|---|---|
| F-01 | Filter by base family and protein type; combined filters intersect; "All" resets a dimension | `src/features/catalog/filters.test.ts` |
| F-02 | Filter options are derived from data (new families such as quinoa/beef appear without code changes) with stable ordering | `filters.test.ts` |
| F-03 | "Available now" filter hides sold-out/coming-soon | `filters.test.ts` |
| F-04 | Filter state is stored in the URL (shareable; back button restores) and invalid params are ignored | `src/pages/menu.test.tsx`, `e2e/menu.spec.ts` |

## Menu page states and UI
| ID | Test | Where |
|---|---|---|
| M-01 | Loading state announced (`role=status`) before data resolves | `menu.test.tsx` |
| M-02 | Error state shows an alert and Retry reloads successfully | `menu.test.tsx` |
| M-03 | Empty catalog shows "menu coming soon" (no fake items) | `menu.test.tsx` |
| M-04 | Filters with no matches show a message and a Clear filters action | `menu.test.tsx` |
| M-05 | Each card links to its detail page, shows availability as text (not colour only) and a visible "Development sample" label for fixtures | `menu.test.tsx` |
| M-06 | Cards never display prices, kcal/macros, allergens or health claims while data is unvalidated | `menu.test.tsx`, `e2e/menu.spec.ts` |
| M-07 | Missing/broken image falls back to a labelled placeholder without layout break | `menu.test.tsx`, `e2e/menu.spec.ts` |

## Detail page
| ID | Test | Where |
|---|---|---|
| P-01 | `/menu/:slug` shows name (h1), description, components grouped by role, availability | `menu.test.tsx`, `e2e/menu.spec.ts` |
| P-02 | Nutrition, price and allergens show "Pending validation" when unvalidated | `menu.test.tsx` |
| P-03 | Unknown slug shows a not-found state with a link back to the menu | `menu.test.tsx`, `e2e/menu.spec.ts` |
| P-04 | Customise CTA links to `/build?bowl=<slug>` only when available; disabled/absent otherwise | `menu.test.tsx` |
| P-05 | Direct navigation/refresh on `/menu/:slug` works on the production build | `e2e/menu.spec.ts` |

## Accessibility, mobile, regression
| ID | Test | Where |
|---|---|---|
| A-01 | axe WCAG 2.2 AA: 0 serious/critical on `/menu`, filtered `/menu`, `/menu/:slug`, unknown slug | `e2e/a11y.spec.ts` |
| A-02 | Filters fully operable by keyboard (Tab + Space/arrow keys) | `e2e/menu.spec.ts` |
| A-03 | No horizontal overflow at 320–1280 px on menu and detail pages; touch targets ≥ 44 px | `e2e/menu.spec.ts`, `e2e/design.spec.ts` |
| R-01 | All Stage 1–2 unit/E2E suites pass unchanged (Stage 2 `/menu` h1 "Menu" preserved) | existing suites |
| R-02 | No changes to `supabase/`, `src/auth/`, `src/lib/supabase.ts` | `git diff --stat main` |
