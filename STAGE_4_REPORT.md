# Stage 4 Report: Animated Build Your Bowl

**Date:** 2026-09-30. **Branch:** `stage-4/bowl-builder`. **Status:** draft PR, in review. Not complete until it has been reviewed, verified on a hosted preview and tested on real devices.

- Approved master: `docs/design/approved/four-screen-customize-master.png`
- Comparison: `docs/design/stage-4/master-vs-implementation.jpg`
- Acceptance tests (defined before the UI was built): `docs/stages/STAGE_04_ACCEPTANCE_TESTS.md`
- Assets: `docs/stages/STAGE_04_ASSETS.md`

## Implemented
- **`/build` full-screen builder** (lazy chunk of 22.6 kB, 8 kB gzip):
  - Top bar: back, "Customize", live illustrative ₹ price, share.
  - Sticky bowl preview, with the size clamped for short screens.
  - Live KCAL / PROTEIN / CARBS / FATS strip, with protein highlighted.
  - BASE / PROTEIN / FLAVOUR / TOPPING tabs (ARIA tabs with arrow keys, check marks on completed steps, later steps locked).
  - Ingredient cards with circular thumbnails, "Pick one" / "Pick up to N" hints, selected states and limit messaging.
  - Sticky Next / View Nutrition / "Add to Cart | ₹" footer.
  - View Nutrition dialog with a per-ingredient breakdown.
  - Prototype Add to Cart dialog, which makes no network request.
  - Shareable URL and Stage 3 `?bowl=` presets.
- **Rules:** exactly one base and one protein, up to 2 flavours and up to 3 toppings. Going back keeps every selection, and later steps unlock only once the earlier required steps are done.
- **Renderer:** stable CSS matte-black bowl plus one layer per selection. Stacking order is deterministic, and flavour and topping slots are rotated so they stay out of the protein area. Layers are keyed by ingredient, so there are no stale or duplicate layers.
- **Animations:**
  - Base: centre reveal, 600 ms.
  - Protein: place and settle, 500 ms.
  - Flavour: drizzle sweep, 700 ms.
  - Topping: scatter and settle, 500 ms.
  - Animations start after the image decodes. With reduced motion, layers appear instantly.
- **Progressive preloading** (current step plus next step). Fallback shapes appear if an asset fails to load.

## Fixture data (illustrative only)
- **Source:** `src/features/builder/illustrativeIngredients.ts`, tagged `illustrative-fixture`.
- **Values:** protein, kcal and ₹ values follow the spec. Carbs and fat are explicitly illustrative.
- **Labelling:** the page shows "Prototype: illustrative prices & nutrition, not validated" at all times. The nutrition dialog adds "No allergen information yet".
- **Scope:** the data is not used by the catalog or Supabase code, which a test checks. Nothing was seeded.
- **Copy:** ingredient descriptions were rewritten to drop the master's health claims (fiber-rich, low GI, antioxidant, omega 3, lean, clean).

## Test evidence (local sandbox, 2026-09-30)
| Check | Result |
|---|---|
| `npm run lint`, `format:check`, `tsc -b` + `vite build` | Pass, 0 warnings |
| Vitest | **210/210 pass** in 20 files: 115 from Stages 1–3 plus 95 new, covering selection rules (including a property test of 500 random 40-action sequences), calculations (all 15 ingredients and all 24 combinations of 2 flavours and 3 toppings), fixture isolation, claims, asset budget, layer ordering, preloader, configuration and share params, the renderer (all 15 layers, replacement, 120-step rapid switching, slow load, error and reduced motion) and the page (journey, tabs, limits, dialogs, share, Stage 3 preset) |
| Playwright (Pixel 7 + Desktop Chrome) | **127 passed, 5 skipped.** The skips are the visual baselines, which run on mobile only. Covers the Stage 1–3 suites; direct `/build`; the master journey; rapid switching with 0.4–1 s asset delays; limits; keyboard; no network call from the prototype cart; share round-trip; sticky preview and footer at 390×844 and 360×640; no overflow from 320 to 1280 px; reduced motion and normal motion; broken-asset fallback; progressive loading |
| Accessibility (axe WCAG 2.2 AA) | 0 serious or critical issues on 12 routes, including the empty and full builder, plus the Nutrition and Cart dialogs |
| Visual regression | 5 mobile baselines in `e2e/builder-visual.spec.ts-snapshots/`: empty plus the four master states |

The only change to an existing assertion is the `/build` heading: "Build your bowl" became "Customize", as in the master (unit and E2E route tests).

## Performance (production build, 390×844, 4× CPU throttle, about 1.6 Mbps and 150 ms RTT)
- Initial `/build` transfer is 471 KB (JS, CSS, fonts, base assets). LCP was 1.46 s, and networkidle was reached at 3.9 s.
- The full journey added about 140 KB of assets. Across 292 frames the median was 16.7 ms and p95 16.8 ms, with no frames over 50 ms.
- The builder asset library is about 430 KB for 30 files. Nothing on the flavour or topping steps loads on the initial visit, apart from 2 tab icons.

## Differences from the approved master
1. **Imagery:** prototype procedural illustrations, not photorealistic food (D-018). This is the largest gap.
2. **Figures:** the master's own numbers don't add up. Our totals are computed: the final state is 585 kcal and ₹340, against the master's 520 kcal and ₹345.
3. **Descriptions:** health-claim wording was removed.
4. **Prototype label:** a line was added under the macro strip.
5. **Master screen 1** shows an empty bowl with Brown Rice already ticked. We show an empty bowl with nothing selected, which is consistent.
6. **Tab icons:** these use ingredient thumbnails instead of the master's illustrated icons.
7. **Bowl size:** the preview is slightly smaller (clamped to about 23% of the viewport height), so three cards stay visible on 844 px screens.
8. **Carousel dots:** the master's dots under the bowl weren't implemented; they have no defined behaviour.

## Pending
- Hosted preview, CI and real-device testing (mid-range Android, iOS Safari safe areas).
- Approved photography and AI-assisted asset library.
- Owner review of D-016 to D-019.
