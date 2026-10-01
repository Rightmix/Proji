# Stage 04 — Animated Build Your Bowl

**Status:** Complete as a prototype milestone. Merged to `main` (PR #28) and reported production-verified by the owner (2026-10-01). Prototype assets and illustrative values remain (D-018). Evidence: [STAGE_4_REPORT.md](../../STAGE_4_REPORT.md); tests: [STAGE_04_ACCEPTANCE_TESTS.md](STAGE_04_ACCEPTANCE_TESTS.md); assets: [STAGE_04_ASSETS.md](STAGE_04_ASSETS.md). **Earlier status:** planned. **Estimate:** 16–30 sequential working days for the expanded visual milestone (provisional, subject to repository and asset audit).

## Approved product and visual direction
The four-screen mockup is **confirmed (2026-09-30) as the approved master**, stored at [`docs/design/approved/four-screen-customize-master.png`](../design/approved/four-screen-customize-master.png). Do not replace the visual builder with a standard form. Mobile-first white and warm-grey UI, natural green selection states, deep-green actions, matte-black overhead bowl, realistic food imagery. Preserve PROJI brand tokens unless the approved mockup specifies a reviewed variant.

**Approved 2026-09-27 decisions:** Hybrid professional food photography plus AI-assisted asset production; sticky/fixed-near-top bowl preview while ingredient choices scroll below; first milestone covers animations for **all 15 proposed ingredients** with clearly labelled illustrative nutrition and prices. No production checkout or subscriptions are implied.

## Customer journey and layout
Top bar: back, Customize, live price, share. Sticky bowl preview starts empty with YOUR BOWL BUILDS HERE and stays in the same position across four categories; shrink responsibly on short screens rather than hiding choices. Below: live kcal/protein/carbs/fat (protein highlighted); BASE / PROTEIN / FLAVOUR / TOPPING tabs; realistic thumbnail cards with name, description, protein, kcal, price and selection state. Sticky footer: Next, View Nutrition, final Add to Cart. Backtracking preserves selections.

- Base: exactly one of Brown Rice Kanji (5 g protein, 220 kcal, ₹120), Millet Kanji (6 g, 200 kcal, ₹130), Red Rice Kanji (5 g, 230 kcal, ₹130). ~600 ms base reveal/replacement.
- Protein: exactly one of Kerala Grilled Fish (28 g, 180 kcal, +₹150), Pepper Chicken (30 g, 200 kcal, +₹140), Roasted Soya Chunks (20 g, 160 kcal, +₹90), Boiled Egg (13 g, 140 kcal, +₹40). ~500 ms place/replace.
- Flavours: choose up to two of Kerala Coconut Sauce (80 kcal, +₹30), Spicy Chilli Oil (30 kcal, +₹20), Herb Mint Sauce (25 kcal, +₹20), Garlic Tadka (45 kcal, +₹20). ~700 ms consistency-appropriate pour/drizzle.
- Toppings: choose up to three of Roasted Peanuts (60 kcal, +₹20), Crispy Shallots (45 kcal, +₹20), Fresh Herbs (10 kcal, +₹10), Pickled Vegetables (20 kcal, +₹10). ~500 ms ingredient-appropriate scatter/settle.

**All listed figures are design placeholders**, not production nutrition or approved menu prices. Carbs/fat/other missing nutrient fields require explicitly illustrative fixture values during the visual milestone, never invented production records. Grilled-fish omega-3 claims require species-specific validation.

## Layered bowl engine
One stable empty matte-black bowl background; one base layer; one protein layer; up to two independent flavour layers; up to three topping layers; optional finishing effect. Each ingredient has transparent aligned asset(s) and animation metadata. All layers share overhead perspective, lighting, bowl placement, canvas dimensions and resolution. Deterministic ordering and designated topping placement prevent sauces/toppings from hiding protein. Transitions must handle rapid changes by cancelling/superseding obsolete animation state; the last selected configuration always wins. Preload the current and next likely assets, not every animation on first load. Respect reduced-motion preferences.

**Asset workflow:** photograph real prepared ingredients and master bowl under consistent overhead lighting; use AI assistance for controlled cutouts/missing views and manually review every composite. Inventory: 1 empty bowl, 3 base assets, 4 protein assets, 4 flavour assets, 4 topping assets, 15 ingredient-card thumbnails, and transition sequences as needed. Generated reference images are not production assets until aligned and approved.

## File-by-file target plan (verify actual repository structure first)
### UI
- `src/pages/CustomizePage.tsx`: page composition and four-stage flow.
- `src/components/builder/StickyBowlPreview.tsx`: responsive persistent preview.
- `src/components/builder/CategoryNavigation.tsx`: stage navigation and completion.
- `src/components/builder/IngredientCard.tsx`, `IngredientSelector.tsx`: card UI and category selections.
- `src/components/builder/NutritionSummary.tsx`, `NutritionDetails.tsx`: live totals and detailed breakdown.
- `src/components/builder/CustomizationFooter.tsx`, `FinalBowlPreview.tsx`: footer and final review.
- `src/styles/bowl-builder.css`: sticky layout, safe areas, mobile dimensions.

### Visual engine
- `src/components/builder/BowlRenderer.tsx`: deterministic composite.
- `src/components/builder/AnimatedIngredientLayer.tsx`: keyed enter/exit/replace.
- `src/features/builder/assetManifest.ts`, `layerOrdering.ts`, `animationPresets.ts`: asset mapping and animation policy.
- `src/features/builder/useAssetPreloader.ts`, `useReducedMotion.ts`: performance/accessibility.
- `public/assets/bowl-builder/{bowl,bases,proteins,flavours,toppings,thumbnails,animations}/`: approved assets.

### State and fixture data
- `src/features/builder/types.ts`, `useBowlBuilder.ts`, `selectionRules.ts`, `validation.ts`: single canonical selection state, stable ingredient IDs, limits.
- `src/features/builder/illustrativeIngredients.ts`: replaceable, prominently labelled design fixtures.
- `src/features/builder/nutrition.ts`, `pricing.ts`: pure calculations from same selection state.
- `src/features/builder/ingredientRepository.ts`: future standardized-recipe adapter.

### Later integrations (not first-milestone completion criteria)
Stage 5 saved bowls (IDs, portions, recipe versions); Stage 6 server-validated cart and historical price snapshots; Stage 7 recipe/nutrition/allergen/availability and visual-asset management; Stage 8 exact kitchen production tickets; Stage 9 reuse builder for subscriptions. Never silently update confirmed order snapshots when recipe records change.

## Delivery phases
1. Inspect repo and audit approved four-screen mockup; produce file-by-file change proposal.
2. Match static interface and mobile sticky layout.
3. Produce and approve aligned hybrid asset library.
4. Animate all 15 ingredients and combinations; handle fast switching.
5. Connect isolated illustrative nutrition/pricing fixtures and enforce limits.
6. Test visual accuracy, mobile performance, accessibility, combinations and reduced motion.
Later: validated recipes, real checkout, saved bowls, kitchen and subscription integrations.

## Milestone 1 acceptance criteria
- Mockup fidelity reviewed against actual approved four screens.
- Empty black bowl initially; exactly one correct base and protein displayed; two flavours and three toppings coexist without covering the main protein.
- Every proposed ingredient has a distinct correct visual and suitable transition; removal/replacement clears obsolete layers.
- Selection limits, back navigation, sticky layout, immediate illustrative price/macros, final configuration and reduced motion work.
- Rapid changes produce no flicker, stale ingredients or duplicates; assets progressively preload.
- Test on mobile viewports, real mid-range devices and slower connections.
- Visual-regression screenshots and actual test results recorded.
- Add to Cart may be a clearly labelled prototype action; no claim of live order placement.

## Test file targets
`src/features/builder/{selectionRules,nutrition,pricing}.test.ts`; `src/components/builder/BowlRenderer.test.tsx`; `tests/e2e/{bowl-builder,bowl-animation,bowl-mobile}.spec.ts`; `tests/visual/bowl-builder/`.

## Dependencies / open questions
Actual approved four-screen mockup must be supplied; inspect real repository code before locking filenames; determine ingredient photoshoot/AI review workflow and animation library after architecture audit. Original Stage 4 estimate of 4–7 days is superseded for this expanded visual milestone. Do not implement code without a separate authorization.

## Implementation notes (2026-09-30)
- **Route:** `/build` is a full-screen layout loaded as a lazy chunk (`src/pages/CustomizePage.tsx`). It accepts share params (`?base=&protein=&flavours=&toppings=`) and Stage 3 presets (`?bowl=<catalog slug>`).
- **State:** one reducer (`selectionRules.ts`) with fixed flavour and topping slots. `useBowlBuilder` derives the layers, nutrition, price and the `BowlConfiguration` boundary from that single selection.
- **Renderer:** `BowlRenderer` and `AnimatedIngredientLayer` key each layer by category, slot and ingredient. The enter animation starts after the image decodes, and there is a timeout safety net. Failed loads show a fallback shape, and reduced motion settles layers instantly.
- **Animations:** CSS keyframes; no animation library. Base is a centre reveal (600 ms), protein a slide-and-settle (500 ms), flavour a conic-mask drizzle sweep (700 ms), topping a drop-scatter-settle (500 ms).
- **Fixture data:** illustrative values live only in `illustrativeIngredients.ts` and are tagged `illustrative-fixture`. The ingredient descriptions were reworded to remove the master's health claims. Add to Cart is a local no-op boundary (`cartBoundary.ts`).
