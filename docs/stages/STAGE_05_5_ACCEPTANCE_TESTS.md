# Stage 5.5: Customer UI redesign, acceptance tests and evidence (2026-10-02)

**Reference:** [`docs/design/stage-5.5/approved-reference.jpg`](../design/stage-5.5/approved-reference.jpg). **Results** are from local runs; see STAGE_5_5_REPORT.md.

| ID | Requirement | Test(s) | Result |
|---|---|---|---|
| UI-01 | Bottom nav (Home / Build / Cart / Account) with icons, labels, green active state, cart badge; desktop uses the top navigation | `src/components/nav.test.tsx` N-01; `e2e/design.spec.ts` N-01, N-03, desktop nav | Pass |
| UI-02 | Floating chat button above the nav, never overlapping it; honest "coming with ordering" dialog | nav.test N-01; design.spec N-01; a11y chat dialog | Pass |
| UI-03 | Top-left back arrow on secondary screens; back restores state | `src/pages/stage55.test.tsx` (category, detail, checkout); account.test U-02; `e2e/stage55.spec.ts` back navigation | Pass |
| UI-04 | Home: logo, delivery selector, search, hero with Build Your Own, categories, popular meals, category rails | `src/pages/Home.test.tsx` H-01 to H-03 | Pass |
| UI-05 | Two vertical meal cards per row on mobile (image, name, kcal and macros, price, favourite, quick-add) | Home.test H-02; e2e stage55 "2 meal cards per row" | Pass |
| UI-06 | Category page: back, title, count, search, protein chips, 2-column grid | stage55.test Category page | Pass |
| UI-07 | Meal detail: hero, back/favourite/share, labelled macros, "This includes" rows, ingredients and nutrition, validated panel unchanged, Customize This Bowl | stage55.test Meal detail; menu.test P-01 to P-04 | Pass |
| UI-08 | BYO: vertical step rail with checkmarks, live bowl, KCAL/PROTEIN/CARBS/FAT, n/4 headings | stage55.test BYO; CustomizePage tests; builder E2E | Pass |
| UI-09 | 3 tiles per row (390 and 360 px), 2 at 320 px | stage55.test grid classes; e2e stage55 "BYO grid" | Pass |
| UI-10 | Live price and nutrition on every change; "Next: <step>" CTAs; Add to Cart | stage55.test; e2e stage55 live nutrition; builder P-02 | Pass |
| UI-11 | Stage 4 limits, rapid switching, reduced motion, slow assets, share, saved-bowl reopen unchanged | existing Stage 4/5 suites (unchanged logic) | Pass |
| UI-12 | Builder persistence across Back/navigation | stage55.test persistence; e2e stage55 back navigation | Pass |
| UI-13 | Cart: items, quantity, delete, subtotal, fee "to be confirmed", nutrition totals, recomputed prices, unavailable lines block checkout | `src/features/cart/cart.test.ts`; stage55.test cart | Pass |
| UI-14 | Checkout/confirmation create **no order**: payment disabled, labelled preview, no network writes | stage55.test checkout; e2e stage55 boundary | Pass |
| UI-15 | Account hub: working links; coming-later items disabled; Stage 5 pages keep working | account.test U-02 and existing U-tests; e2e account + stage55 | Pass |
| UI-16 | No horizontal overflow at 390×844, 393×852, 430×932, 360×640, 320×640 (and existing 320–1280 suites) | e2e stage55 responsive; design N-04; menu/builder/account overflow | Pass |
| UI-17 | axe WCAG 2.2 AA: 0 serious/critical issues on all new routes and dialogs | `e2e/a11y.spec.ts` (18 route checks + dialogs) | Pass |
| UI-18 | Keyboard: rail arrows (both axes), tiles with Space/arrows, dialogs with Escape | stage55 e2e; builder P-03 | Pass |
| UI-19 | Data safety: every price/kcal labelled illustrative; meals with non-builder components show "Nutrition pending"; validated fields untouched; production catalog still empty | menu.test M-06; meals.test; Home.test empty catalog | Pass |
| UI-20 | Stage 1–5 regression | all Vitest, Playwright and RLS suites | Pass |
