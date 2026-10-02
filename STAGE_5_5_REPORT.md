# Stage 5.5 Report: Customer UI redesign

**Date:** 2026-10-02. **Branch:** `stage-5.5/customer-ui-redesign`. **Status:** draft PR, awaiting design review. Stage 6 has not been started.
- Plan: [docs/stages/STAGE_05_5_PLAN.md](docs/stages/STAGE_05_5_PLAN.md)
- Acceptance tests and evidence: [docs/stages/STAGE_05_5_ACCEPTANCE_TESTS.md](docs/stages/STAGE_05_5_ACCEPTANCE_TESTS.md)
- Visual comparison: [docs/design/stage-5.5/](docs/design/stage-5.5/) contains `approved-reference.jpg`, 11 `compare-*.jpg` side-by-sides, `comparison-overview.jpg`, and `screens/` (390×844 and 320×640 captures).

## What changed
- **App shell:**
  - mobile bottom navigation (Home / Build / Cart / Account)
  - floating CX chat button (support chat is labelled as opening with ordering)
  - desktop top navigation
  - scroll restoration
  - `BackHeader` with a history-aware back arrow on every secondary screen
- **Home:** logo and delivery selector (default address), search, hero ("Your Bowl. Your Rules."), category circles, "Popular right now" and category rails, with **2 vertical meal cards per row**.
- **Category page** `/categories/:id` (includes `all`): back arrow, count, search, protein chips, 2-column grid. `/menu` keeps its Stage 3 filters and uses the new cards.
- **Meal detail:** full-bleed visual with back, favourite and share; labelled macros; "This includes" rows (thumbnail, kcal, expandable); ingredients and nutrition table; the unchanged validated panel; sticky "Customize This Bowl".
- **BYO:**
  - "Build Your Own" with a left vertical step rail (checkmarks, strong green active state) and a large live bowl
  - KCAL / PROTEIN / CARBS / FAT tiles
  - n/4 headings
  - **3 component tiles per row**, falling back to 2 via a container query when the column is narrower than 248 px (320 px screens)
  - sticky summary with price and macros, "Next: Protein / Flavour / Toppings" and "Add to Cart"
  - session draft, so Back never loses work
  - same reducer, codec, renderer and animations, with no rule changes
- **Cart:** a device-local prototype cart storing IDs only. It recomputes prices and nutrition each time, has quantity, delete and clear (with confirmation), and shows the delivery fee as "to be confirmed" and nutrition totals. Unavailable lines block checkout.
- **Checkout:** saved addresses, Delivery/Pickup, day and time chips. **Continue to Payment is disabled.** The order confirmation is a **labelled design preview**; no order, cart or payment is created.
- **Account hub:** avatar initial, name and email; Orders, Saved bowls, Favourites, Spice level, Cutlery, Addresses and Profile are linked. Dietary preferences, Subscription, Refer & earn and Offers are disabled and marked "Coming later". All Stage 5 pages keep working and gain back arrows.
- **Favourites:** device-local; no schema change.
- **Data:** 4 new labelled development-fixture bowls built only from builder ingredients, so cards can show **illustrative** estimates (D-024). Production still defaults to an empty catalog.
- **Design tokens:** the action green is brightened to match the approved board (`#187a40`, AA-tested as text on canvas and as a background for white text), and macro dot colours were added.

**Fixes found while doing this:**
- Layer CSS now loads with `BowlRenderer`, so composites render outside `/build`.
- The bowl creates its own stacking context, so layers can no longer paint over the nav.
- Already-cached layer images now settle correctly.
- Scroll padding keeps focused or auto-scrolled controls clear of the nav and chat button.

## Database changes
None.

## Test evidence (local sandbox, 2026-10-02)
| Check | Result |
|---|---|
| Lint, Prettier, `tsc -b`, `vite build`, `check:bundle` | Pass |
| Vitest | **306/306 pass** in 29 files |
| `npm run test:rls` | Pass: Stage 1 and Stage 5 suites (no DB changes) |
| Playwright (Pixel 7 + Desktop Chrome) | **189 passed, 5 skipped** (desktop skips of the mobile-only visual baselines), including the new `e2e/stage55.spec.ts` |
| axe WCAG 2.2 AA | 0 serious or critical issues across 18 routes plus the builder, account and chat dialogs |

## Existing tests changed (intentional, from the approved design)
| Test | Change | Why |
|---|---|---|
| `routes.test`, `e2e/routes` | `/` h1 is now "Your Bowl. Your Rules."; `/build` h1 is now "Build Your Own" | Approved copy |
| `nav.test` N-01/N-02, `design.spec` N-01/N-03 | The hamburger and sticky-header tests are replaced by bottom-nav tests; the auth checks are scoped to the desktop header | The approved design replaces the mobile menu |
| `design.spec` A-03, `a11y` | Hero link name "Build Your Own"; axe runs on the chat dialog instead of the removed mobile menu | Approved design |
| `Home.test` H-01/H-02 | The new layout is asserted. "No figures" became "all figures labelled illustrative", and the no-health-claims check is kept | D-024 |
| `menu.test` M-06, `e2e/menu` M-06 | "No prices/macros" became "every figure labelled; unmappable bowls show none" | D-024 |
| `menu.test`, `filters.test`, `e2e/menu` counts | Counts updated for the 4 new fixture bowls | Data change, not weakened |
| `menu.test`/`e2e/menu` detail | `/customise/` became `/customi[sz]e/` | Approved US spelling "Customize This Bowl" |
| `CustomizePage` tests, builder E2E | Heading "Build Your Own"; the price is read from the summary instead of the Add to Cart button | Approved design |
| `account.test` U-02, `e2e/account` | The account hub's rows replace the Stage 5 section cards; navigate to `/account` instead of the old "Overview" pill | Approved design |
| `builder-visual` baselines | Regenerated | The BYO layout intentionally changed |

## Performance (production builds, 390×844, 4× CPU throttle, about 1.6 Mbps)
- **Main JS:** 82.8 kB gzip, up from 77.0 kB on `main` (+5.8 kB). The shared chunk is +0.9 kB. The builder chunk is 6.1 kB, down from 7.3 kB. New pages are lazy chunks of 1–2 kB gzip each.
- **Transfer and LCP:**
  - `/`: 379 KB, LCP about 2.9 s (`main`: 391 KB, about 2.8 s)
  - `/build`: 487 KB, LCP about 1.7 s (`main`: 481 KB, about 1.5 s)
- CLS ≤ 0.002.
- These were measured while other tests were running, so treat differences of ±10% as noise.
- Meal-card previews reuse the cached prototype layer files.

## Differences from the approved design
1. **Imagery:** prototype illustrations and builder-layer composites instead of the reference's food photography (D-018). This is the largest gap.
2. **Currency:** ₹ (Calicut pilot data) instead of BHD. Fixture values are not converted.
3. **Delivery fee:** "To be confirmed"; the reference's fee value was not invented.
4. **Hero copy:** "Balanced nutrition" became "Nutrition you can see", because the nutrition is unvalidated.
5. **Labels:** "Illustrative" tags and the "Development sample" badge are added for data safety.
6. **Checkout and confirmation:** the confirmation is a labelled preview with disabled Track/View buttons, and payment is disabled (Stage 6 boundary).
7. **Account hub:** adds Profile and a Sign out button. Four items are disabled as "Coming later".
8. **Nutrition near the bowl:** shown as 4 prominent tiles rather than the reference's single line, per the "nutrition prominent" requirement.
9. **Not built:** the carousel dots under the hero.
10. **Ingredient list:** the BYO ingredients are the Stage 4 set; the reference shows a different list (e.g. White Rice, Quinoa, Prawns).

## Unresolved decisions
- D-024: showing illustrative estimates on cards.
- D-025: device-local cart and favourites until Stage 6 / a favourites table.
- D-026: approved board supersedes the Stage 4 BYO layout, plus the green change.
- Currency for launch (₹ vs BHD).
- "High Protein" (≥ 30 g) and "Low Carb" (≤ 50 g) thresholds, which need regulatory review.
- Support chat provider.
- Whether to extend the builder ingredient list to the reference's set (a Stage 7 data decision).


## BYO interaction refinement (Lola-style behaviour, PROJI design)
Only the interaction behaviour was adapted from the reference recording; its branding, colours, content and exact layout were not copied. No business rules, nutrition engine, limits, saved-bowl, draft, Supabase or account code changed. No migrations.

- **Single top-down bowl** at the top. **KCAL / PROTEIN / CARBS / FAT** sit directly under it, live from the Stage 4 calculation.
- The **selection workspace starts below the nutrition**: a left vertical rail (Base / Protein / Flavour / Toppings) plus a scrolling ingredient panel. The bowl, nutrition and summary stay fixed while the panel scrolls.
- **Rail behaviour:**
  - the active highlight slides between steps (320 ms; disabled under reduced motion)
  - completed steps get a check
  - completed or available steps can be revisited without losing the bowl
  - locked steps are announced as "(locked)"
  - each new step opens at the top of its options
  - the panel fades and slides in the direction of travel
- **Compact tiles:** 3 per row, 2 when the panel is narrower than 17rem (360 px and 320 px phones). Each tile shows image, name, kcal, P/C/F, add-on price and selected state.
- **Sticky summary:** `₹ · kcal · P · C · F` with "Next: <step> →" or "Add to Cart". The header shows Save only for a complete bowl.
- **Screenshots:** `docs/design/stage-5.5/byo-refinement/` covers 390×844, 393×852, 360×800 and 320×640 in the Base, Protein and Toppings states. Horizontal overflow is 0 at every width.
