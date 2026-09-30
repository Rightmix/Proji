# Stage 04 — Acceptance tests (defined before UI implementation, 2026-09-30)

Master reference: [`docs/design/approved/four-screen-customize-master.png`](../design/approved/four-screen-customize-master.png). Results: `STAGE_4_REPORT.md`.

## Selection rules and state (unit)
| ID | Test | File |
|---|---|---|
| S-01 | Base and protein: exactly one; selecting another replaces it | `src/features/builder/selectionRules.test.ts` |
| S-02 | Flavours ≤ 2, toppings ≤ 3; an over-limit attempt leaves the selection unchanged and raises a limit notice | same |
| S-03 | Deselecting a flavour/topping frees its slot; the remaining items keep their slots (stable layer placement) | same |
| S-04 | Step gating: protein needs a base; flavour/topping need base + protein; Next is blocked until required steps are complete | same |
| S-05 | Back/forward navigation preserves all selections | same |
| S-06 | Unknown IDs, wrong-category IDs and duplicates are ignored/sanitized | same |
| S-07 | Rapid action sequences: the final state equals the last requested configuration (property test over random sequences) | same |

## Calculations (unit, pure)
| ID | Test | File |
|---|---|---|
| C-01 | Nutrition totals = sum of selected ingredients (every single ingredient, and the 2 flavour + 3 topping combinations) | `nutrition.test.ts` |
| C-02 | Price = sum of selected ingredients (empty ₹0, base only, and the full master scenario) | `pricing.test.ts` |
| C-03 | Results are tagged `illustrative-fixture`; fixture data is isolated (not imported by the catalog or Supabase code) | `illustrativeIngredients.test.ts` |
| C-04 | The 15 ingredients match the spec list, use Stage 3 `role.slug` IDs and are compatible with Stage 3 catalog components | same |
| C-05 | Fixture descriptions contain no health or nutrition claims | same |

## Renderer (unit/component)
| ID | Test | File |
|---|---|---|
| R-01 | Empty bowl: no layers, "YOUR BOWL BUILDS HERE" shown | `src/components/builder/BowlRenderer.test.tsx` |
| R-02 | Each of the 15 ingredients renders exactly one correct layer with the correct z-order | same |
| R-03 | Replacement removes the obsolete layer (no duplicates); removal clears the layer | same |
| R-04 | 2 flavours + 3 toppings coexist; the protein keeps a higher z than the base and is never covered by sauces (sauces and toppings are placed in rim sectors) | same + `layerOrdering.test.ts` |
| R-05 | Rapid switching: after N random changes the DOM layers equal the final selection | same |
| R-06 | Asset load error → labelled fallback; slow load → placeholder, then the animation starts on load | same |
| R-07 | Reduced motion: layers settle without the animation class | same |
| R-08 | Preloader: only the current step's layers plus the next step's assets are requested, and each is requested once | `assetPreloader.test.ts` |

## Page (component + E2E)
| ID | Test | File |
|---|---|---|
| P-01 | Direct `/build` navigation renders the empty-bowl state (master screen 1) | `CustomizePage.test.tsx`, `e2e/builder.spec.ts` |
| P-02 | Master journey: brown rice → fish → coconut → peanuts + shallots; top price, strip and bowl update live | both |
| P-03 | Tabs: keyboard arrows move between tabs; locked tabs can't be activated; completed tabs show a check | both |
| P-04 | Limit messaging is shown when at max; cards beyond the limit are disabled | both |
| P-05 | View Nutrition dialog: per-ingredient breakdown and totals, labelled illustrative; closes with Escape | both |
| P-06 | Add to Cart (topping step) opens the prototype dialog: no network order request, "no order placed" message, configuration shown | both |
| P-07 | Share: copies/shares a URL that restores the same bowl | both |
| P-08 | `/build?bowl=<stage-3 slug>` preloads compatible components and lists unsupported ones | `CustomizePage.test.tsx` |
| P-09 | Sticky preview: the bowl and footer stay in view while the ingredient list scrolls (mobile, including a short 360×640 screen) | `e2e/builder.spec.ts` |
| P-10 | No horizontal overflow at 320/360/390/768/1280 px | same |
| P-11 | Reduced motion (E2E): layer animation duration ≈ 0 | same |
| P-12 | Slow assets (throttled route): the final state is correct, with no stale layers | same |
| P-13 | Prototype/illustrative labelling is visible on the page | both |
| P-14 | axe WCAG 2.2 AA: 0 serious/critical issues on each step and in both dialogs | `e2e/a11y.spec.ts` |
| P-15 | Visual regression: screenshots of the four master states (mobile 390 px) saved and compared with `toHaveScreenshot` | `e2e/builder-visual.spec.ts` |
| P-16 | Performance: initial `/build` requests no flavour/topping layers; total builder assets < 600 KB | `e2e/builder.spec.ts` |

## Regression
| ID | Test |
|---|---|
| X-01 | All Stage 1–3 unit and E2E suites pass. The only intended expectation change is the `/build` page heading, which becomes "Customize" per the master |
| X-02 | No changes to `supabase/`, `src/auth/`, `src/lib/supabase.ts` or Stage 3 catalog data |
