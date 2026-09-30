# Stage 3 Report: Menu and Catalog

**Date:** 2026-09-30. **Branch:** `stage-3/menu-catalog`. **Status:** draft PR, in review. Not complete until it has been reviewed and verified on a hosted preview.
Acceptance tests were defined before coding: [docs/stages/STAGE_03_ACCEPTANCE_TESTS.md](docs/stages/STAGE_03_ACCEPTANCE_TESTS.md).

## Implemented
See the "Implemented architecture" section in [STAGE_03_MENU.md](docs/stages/STAGE_03_MENU.md).
- New code: `src/features/catalog/*` (types, validation, filters, repository, provider, query hook, fixtures and components) and `src/pages/{Menu,BowlDetail}.tsx`.
- New routes: `/menu` and `/menu/:slug`.

## Fixture data (development only)
There are four concept bowls in `src/features/catalog/fixtures.ts`:
- Kerala Pepper Chicken Kanji: available, with a reference-placeholder image
- Coconut Fish Millet Kanji: available, no image (tests the fallback)
- Tandoori Paneer Red Rice Kanji: sold out
- Kerala Beef Roast Quinoa Bowl: coming soon

All four are marked `development-fixture`, and each shows "Development sample" badges and notices. None has a price, nutrition or allergen values. The names and components are concepts, not final recipes. The fixtures are **not** served in production by default and are **not** seeded into Supabase.

## Test evidence (local sandbox, 2026-09-30)
| Check | Result |
|---|---|
| `npm run lint` | Pass: 0 errors, 0 warnings |
| `npm run format:check` | Pass |
| `npm run build` (`tsc -b` + Vite) | Pass: main JS 344 kB / 108 kB gzip; fixtures are a separate 3.2 kB chunk |
| `npm test` (Vitest) | **115/115 pass**: 76 from Stages 1–2 plus 39 new (integrity, fixture safety, source policy, lazy loading, filters, URL params, menu states, detail page) |
| `npm run test:e2e` (Playwright, Pixel 7 + Desktop Chrome, preview build with fixtures) | **90/90 pass**: all Stage 1–2 suites; menu listing without prices or macros; URL filters with back-button restore; keyboard filters; detail page on direct navigation and reload; not-found; broken-image fallback; no overflow from 320 to 1280 px; 44 px chips; axe WCAG 2.2 AA with 0 serious or critical issues on 10 routes including the menu and detail variants |
| Production-default check | A production build without the environment variable renders "Our menu is coming soon" and doesn't fetch the fixtures chunk. Checked manually with Playwright. |
| RLS | Not re-run: `supabase/`, `src/auth/` and `src/lib/supabase.ts` are unchanged |

No existing test assertions were changed. The a11y spec gained more routes, and the Playwright web server now builds with `VITE_CATALOG_SOURCE=fixtures`.

## Pending
- Hosted preview and CI on the PR.
- Validated bowl content: recipes, descriptions and images (Stage 7 and photography).
