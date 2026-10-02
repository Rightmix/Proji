# Stage 5.5: Customer UI redesign, implementation plan (2026-10-01)

**Approved visual reference:** [`docs/design/stage-5.5/approved-reference.jpg`](../design/stage-5.5/approved-reference.jpg), the 11-screen mobile board.
**Scope:** a UI/UX layer on top of the existing Stage 1–5 architecture. There are no database changes, no Stage 6 transactions and no new business rules.

## Audit summary
- **Routes:** `/`, `/menu`, `/menu/:slug`, `/build` (full-screen, lazy), `/login`, `/account/*` (Stage 5, protected), plus the staff routes.
- **Reusable pieces:**
  - catalog repository with the `Verified<T>` gate (Stage 3)
  - builder reducer, codec, renderer, illustrative ingredient index and animations (Stage 4)
  - `AccountRepository`, `savedBowlCodec` and `RequireRole` (Stage 5)
- **Gap:** meals had no nutrition or price, by design (D-014). The approved design needs both on every card.

## Approach
1. **App shell** (`AppShell`):
   - mobile bottom navigation (Home / Build / Cart / Account, icon + label, green when active)
   - floating chat button that sits above the nav and sticky CTAs
   - desktop top navigation
   - scroll restoration
   - a shared `BackHeader` (top-left back arrow; history-aware fallback) on every secondary screen
2. **Meal presentation:**
   - a `mealEstimate` adapter derives illustrative kcal, protein, carbs, fat and ₹ for catalog bowls whose components are all Stage 4 builder ingredients
   - every figure is labelled "Illustrative"; anything that can't be fully computed shows "Nutrition pending"
   - the validated `Verified<T>` facts stay gated as before
   - new labelled development-fixture bowls made only of builder ingredients give discovery real content; production still defaults to an empty catalog
3. **Home:** logo, delivery selector, search, hero with Build Your Own CTA, category circles, "Popular right now", then rails per category. Meals show as **2-column vertical `MealCard`s**: image, name, kcal and macros, price, favourite, quick-add.
4. **Category page** `/categories/:id`: back arrow, title, meal count, search, protein chips, 2-column grid. `/menu` keeps its Stage 3 filters and uses the same cards.
5. **Meal detail:** full-bleed hero with back and favourite/share; name, tags, macros, description; "This includes" component rows (thumbnail, kcal, expand); ingredients and nutrition detail; sticky price with "Customize This Bowl". The validated price/nutrition/allergen panel stays.
6. **BYO:**
   - title "Build Your Own" with a back arrow
   - left vertical step rail (Base / Protein / Flavour / Toppings) with checkmarks and a strong green active state
   - large live bowl with prominent KCAL / PROTEIN / CARBS / FAT
   - `n/4` step headings
   - **3-column component tiles** (2 columns below 340 px) using the existing native radio/checkbox semantics and limits
   - sticky summary showing price and macros, with "Next: Protein …" or "Add to Cart"
   - same reducer, codec, renderer and animations; the session draft is kept so Back never loses work
7. **Cart:** a device-local prototype cart (`localStorage`) holding `BowlConfiguration` IDs only; prices and nutrition are recomputed on every render. It has quantity controls, delete, subtotal, nutrition totals, a delivery fee shown as "To be confirmed", and Proceed to Checkout.
8. **Checkout / confirmation:** the UI sections from the design (Stage 5 addresses, delivery/pickup, date and time chips). Continue to Payment is **disabled**, with an explicit "ordering opens in Stage 6" notice. The confirmation screen is a clearly labelled **design preview**; it creates no order.
9. **Account:** a mobile account hub (avatar initial, name, email; Orders, Saved bowls, Favourites; Food preferences; Delivery; PROJI section). Coming-later items are disabled and labelled. Stage 5 subpages get back headers.
10. **Favourites:** device-local (`localStorage`); there is no schema change.

## Database
None.

## Risks and decisions to record
- Showing illustrative nutrition and prices on cards amends D-014 to "validated values only, **or** clearly labelled illustrative estimates from builder fixtures".
- The design shows BHD; the data is ₹ (Calicut pilot), so ₹ is kept.
- "High Protein" and "Low Carb" category thresholds are provisional and based on illustrative data. They need owner and regulatory review.
