# Stage 6: Persistent cart, checkout and order management (plan)

**Status:** Architecture conditionally approved (2026-10-13). Phase 6.0 (verification and planning) is complete; see section 11. Phases 6.1–6.6 are **not started**, and nothing in this document has been implemented.
**Baseline:** `main` @ `b794eb8` (Stage 5.5 merged, PR #30).
**Target backend:** only the PROJI Supabase project `uwkgnsjdbjoqiimvefct` ("Proji", ap-south-1). Never RightMix.

## 1. Audit of existing code and database

### Database (from the repository's migrations)

**Stage 1**
- Tables: `profiles` and `user_roles`, with the `app_role` enum: customer, admin, rd, kitchen.
- `private.has_role()` is a SECURITY DEFINER function, used by every RLS policy.
- `touch_updated_at()`.
- A sign-up trigger gives every new user the `customer` role only.

**Stage 5**
- Tables: `customer_addresses`, `customer_preferences` and `saved_bowls`.
- Ownership: `user_id default auth.uid()`, one "own rows" RLS policy per table, and column-level grants.
- `private.is_valid_bowl_configuration(jsonb)` validates the saved-bowl shape (version 1, ID patterns, flavours ≤ 2, toppings ≤ 3, no duplicates). Stage 6 reuses it.

**Not in the database:** there are **no catalog, price, ingredient, cart or order tables**. D-015 deferred catalog tables to Stage 7.
- Production shows an empty catalog.
- Dev and preview builds use labelled TypeScript fixtures (`features/builder/illustrativeIngredients.ts`, `features/catalog/fixtures.ts`).

**Hosted state:** see section 11 for the Phase 6.0 verification results.

### Client code
- **Cart (`features/cart/cartStore.ts`):** device-local `localStorage`.
  - Lines hold `{id, name, mealSlug, configuration, quantity}`, with at most 30 lines and a quantity of 20 each.
  - Duplicate lines are merged by `mealSlug` plus `JSON.stringify(configuration)`. That comparison depends on array order, so it is fragile.
- **Cart totals (`cartTotals.priceCart`):** every line is decoded with `savedBowlCodec` and repriced from the illustrative index. **Stored prices are never trusted (good).**
- **Pricing (`builder/pricing.ts`):** the price is the sum of ingredient `priceMinor`, labelled `illustrative-fixture`. The file states that Stage 6 must reprice on the server (D-019).
- **Signature meals:** they are already expressed as a `BowlConfiguration` plus a `mealSlug`. **Signature and custom bowls share one line type.**
- **Checkout (`pages/order/CheckoutPage.tsx`):**
  - It uses Stage 5 addresses.
  - Date and time slots are **provisional placeholders** (`checkoutOptions.ts`).
  - The payment button is disabled.
  - The confirmation page is a labelled preview.
- **Order history:** `OrderHistoryContext` and `pages/account/OrdersPage.tsx` report "not available until Stage 6".
- **Tests:**
  - Vitest and Playwright run against a `VITE_TEST_AUTH` build with in-memory repositories that mirror RLS (D-023).
  - SQL RLS suites run against a throwaway local Postgres (`supabase/tests/run_rls_tests.sh`).

### Consequence (the central issue)
The server currently has **no source of truth for prices, availability or nutrition**, so it can't validate an order. All existing prices and nutrition are **illustrative**.

Stage 6 must therefore:
- (a) introduce a minimal server-side **commerce catalog**, and
- (b) refuse real orders until **owner-approved prices** exist.

## 2. Proposed architecture

```
Browser (React)                         Supabase "Proji" (Postgres + Auth)
─────────────────                       ──────────────────────────────────
Guest cart (localStorage, IDs only) ──► merge_guest_cart(items)      ┐
Signed-in cart  ◄── select own rows ──  carts / cart_items (RLS)     │ SECURITY DEFINER RPCs:
Checkout ──────────► quote_checkout(address, slot) → server quote   │ auth.uid()-scoped,
                 ──► place_order(idempotency_key, quote_hash, …)    │ search_path='', granted
Order history ◄──── select own rows ─── orders / order_items (RLS)  │ to authenticated only
Cancel ────────────► cancel_my_order(id)                            ┘
(Stage 8 kitchen) ─► set_order_status(id, to, reason)  [role-checked]
                        commerce catalog: sellable_ingredients, sellable_meals,
                        delivery_zones, delivery_windows, commerce_settings
```

Principles:
- **No new server runtime.** Every authoritative calculation runs in **Postgres functions**, each inside a single transaction, so there are no service-role keys anywhere and no Edge Function. An Edge Function is added later only when online payment needs webhook signature verification.
- **The browser sends IDs only:** configuration, meal slug, quantity, address ID, slot and idempotency key. **Prices, nutrition, fees and taxes are never accepted from the client.**
- **One quote engine.** `private.price_configuration()` serves both the quote and the order, so the price on screen and the price stored on the order can't diverge.
- **Kill switch.** Ordering is gated by `commerce_settings.ordering_enabled`, which defaults to **false**, and `commerce_settings.allow_illustrative_orders`, which defaults to **false** and is only ever true in a dev database.
- **Client structure:**
  - `CartRepository` and `OrderRepository` interfaces with Supabase and in-memory implementations, matching the Stage 5 pattern.
  - The Stage 5.5 UI, navigation and four-step builder stay as they are. Only the data boundaries change.

## 3. Database schema and RLS design

### Migration A: `stage6_commerce_catalog`
**`sellable_ingredients`**
- `id text pk` in the form `base.slug`, the same IDs as the builder.
- `category` (base/protein/flavour/topping), `name`.
- `price_minor int ≥ 0` and `price_status` (`illustrative` | `approved`).
- `kcal`, `protein_g`, `carbs_g`, `fat_g` and `nutrition_status` (`illustrative` | `validated`).
- `allergens text[]`, `is_available bool`, `updated_at`.

**`sellable_meals`**
- `slug pk`, `name`, `configuration jsonb`, which must pass `is_valid_bowl_configuration`.
- `price_mode` (`sum_of_components` | `fixed`), `fixed_price_minor`, `is_available`.

**`delivery_zones`**
- `id`, `name`, `postal_codes text[]`.
- `delivery_fee_minor int null`, `min_order_minor int null`, `is_active`.
- **A null fee means the zone is not configured, and ordering is blocked there. The fee is never assumed.**

**`delivery_windows`**
- `id`, `label`, `start_time`, `end_time`, `days smallint[]`, `cutoff_minutes`, `capacity int null`, `is_active`.
- All times are in Asia/Kolkata.
- A CHECK constraint means a window **cannot be active while its capacity is null**. Capacity is never assumed to be unlimited.

**`delivery_slot_usage`** (`window_id`, `delivery_date`, `booked_units int ≥ 0`, primary key `(window_id, delivery_date)`)
- Booking and release are done only by the order functions. No role has direct grants.
- See section 5.2.

**`commerce_settings`** (a single row)
- `ordering_enabled`, `allow_illustrative_orders`.
- `tax_mode` (`not_configured` | `inclusive` | `exclusive`) and `tax_rate_bp int null`.
- `max_active_orders_per_user`.

**`app_environment`** (a single row: `environment` of `development` | `production`, `provisioned_at`)
- This row is **not created by any migration**, so migrations stay identical in both environments. It is written once by an environment provisioning script.
- A trigger blocks every update and delete. The `authenticated` and `anon` roles have no grants on it.
- Every commerce function **fails closed** if the row is missing.
- See D-035 and section 5.3.

**Access**
- Customers can read only rows where the item is available or the zone/window is active. Admin and R&D can write; their UI comes in Stage 7.
- `anon` can read the ingredient and meal tables for menu display, never `commerce_settings`.

### Migration B: `stage6_carts`
**`carts`**
- `id`, `user_id unique default auth.uid()`, `updated_at`.
- One active cart per user.

**`cart_items`**
- `id`, `cart_id`, `kind` (`custom` | `signature`), `meal_slug null`, `configuration jsonb` (CHECK `is_valid_bowl_configuration`), `item_key text`, `quantity 1..20`, `created_at`, `updated_at`.
- **`unique (cart_id, item_key)`.** `item_key` is a canonical hash of kind, slug and the configuration with sorted add-on arrays. Duplicates become a quantity increase.
- A trigger caps a cart at 30 lines.
- **No price or nutrition columns.**

**Access**
- RLS uses "own rows" through the cart's `user_id`, with column grants that exclude `user_id`, `id`, `item_key` and timestamps.
- `item_key` is computed by a trigger, never sent by the client.
- Writes go through `add_cart_item`, `set_cart_item_quantity`, `remove_cart_item` and `merge_guest_cart`. Those RPCs handle the upsert-and-increment and enforce the caps. Direct `select` is allowed.

### Migration C: `stage6_orders`
**`order_status` enum:** `placed`, `confirmed`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `cancelled`, `rejected`.

**`orders`**
- Identity: `id uuid`, `order_number` (`PJ-YYMMDD-NNNN` in production, **`TEST-PJ-YYMMDD-NNNN`** in development, from a sequence), `user_id`, `status`.
- Delivery: `fulfilment` (`delivery`), `delivery_zone_id`, `delivery_date`, `delivery_window_id` and a window-label snapshot.
- **Address and contact snapshot (`address_snapshot jsonb`).** Copied from the address at placement, so later edits or deletions never change the order.
- **Money:** `subtotal_minor`, `delivery_fee_minor`, `tax_minor`, `discount_minor` (always 0 in Stage 6), `total_minor`, `currency 'INR'`, `price_status` (`approved` | `illustrative`).
- Payment: `payment_method` and `payment_status` (`unpaid` | `paid` | `refunded` | `void`).
- Idempotency: `idempotency_key uuid`, `request_hash`, **`unique(user_id, idempotency_key)`**.
- **Environment:**
  - `environment text not null` and `is_test boolean not null`. Both are copied from `app_environment` at placement and never accepted from the client.
  - CHECK `(environment = 'production' or is_test)`.
  - CHECK `(price_status = 'approved' or is_test)`: an order with illustrative prices can only ever be a test order.
  - A trigger rejects `is_test = true` when the database's `app_environment` is `production`.
- `slot_units int`: the capacity booked by this order, so it can be released exactly once.
- `customer_note` (up to 300 characters), `placed_at`, `updated_at`.

**`order_items`**
- `order_id`, `line_no`, `kind`, `meal_slug`, `name_snapshot`, `configuration jsonb`.
- **`components_snapshot jsonb`:** for each ingredient, its ID, name, category, unit price, allergens and data status.
- `unit_price_minor`, `quantity`, `line_total_minor`.
- **`nutrition_snapshot jsonb`**, which includes a `status`, so an illustrative value can never be shown as verified.

**`order_status_events`**
- `order_id`, `from_status`, `to_status`, `actor_id`, `actor_role`, `reason`, `created_at`.
- Append-only.

**Immutability**
- `authenticated` has **no insert, update or delete grants** on any order table.
- A trigger rejects any update to snapshot or money columns, even by the function owner, once an order exists. Only `status`, `payment_status` and `updated_at` can change, and only through the functions.

**RLS on orders**
- Customer: `select` own orders, own order items and own order events.
- Staff (`kitchen`, `admin`): `select` all orders, through `private.has_role`. This is the read interface for Stage 8. The policy is in place now with tests, but no staff UI is built.
- Nobody updates directly; every status change goes through a function.

**Functions** (all SECURITY DEFINER, `search_path=''`, `revoke from public, anon`, `grant to authenticated`)

| Function | Who | Does |
|---|---|---|
| `quote_checkout(address_id, delivery_date, window_id)` | customer | Reads the caller's cart. Validates availability, zone, window and cutoff. Computes lines, subtotal, fee, tax and total. Returns the quote, a `quote_hash` and any blocking reasons. Writes nothing. |
| `place_order(idempotency_key, address_id, delivery_date, window_id, quote_hash, note)` | customer | Locks the cart (`for update`) and re-runs the quote. **`quote_hash` mismatch → `price_changed` with the new quote.** Inserts the order, items and first event, then empties the cart, all in one transaction. **A repeated key returns the existing order** if `request_hash` matches; otherwise it raises `idempotency_conflict`. |
| `cancel_my_order(order_id, reason)` | customer | Own order only, and only while `placed` (owner decides any time limit). Records an event. |
| `set_order_status(order_id, to_status, reason)` | kitchen/admin | Enforces the transition table below and records an event. **This is the Stage 8 interface.** |
| `merge_guest_cart(items jsonb)` | customer | Validates each item with the same checks. Adds or increments up to the caps. Returns accepted and rejected items. Idempotent per `merge_id`. |

## 4. Cart and checkout data flow
1. **Guest:**
   - The cart stays in `localStorage`, holding IDs only.
   - Totals are illustrative estimates shown in the client, as today.
   - **Checkout requires sign-in**, because addresses belong to an account.
2. **Sign-in, or opening checkout while signed in:**
   - The client calls `merge_guest_cart` with the local items and a `merge_id`.
   - Duplicates are folded by `item_key`, with quantities summed and capped at 20.
   - Invalid or unavailable items are returned and shown as "removed", never silently dropped.
   - The local cart is cleared **only after success**. A retry is safe because the same `merge_id` is a no-op.
3. **Signed in:**
   - The server cart is the source of truth.
   - Cart edits call the cart RPCs, with optimistic UI that rolls back on error.
   - The cart is recovered on any device after sign-in.
4. **Checkout:**
   - The customer picks a saved address, a date and a window.
   - The client calls `quote_checkout`, which returns an itemised INR breakdown with **only server values**.
   - Blocking reasons are shown inline: outside zone, unavailable item, past cutoff, fee or tax not configured, ordering closed, illustrative prices.
5. **Place order:**
   - The client creates an idempotency key (a UUID) per checkout session, held in `sessionStorage`.
   - It calls `place_order` with the `quote_hash`.
   - On `price_changed`, it shows the new totals and requires the customer to confirm again.
   - On a network timeout, it retries with the **same key**, so no duplicate order is created.
6. **Success:** the cart is cleared server-side, and the customer goes to `/orders/:id/confirmation`, which replaces the preview page. That page reads the stored order.

## 5. Order lifecycle and failure handling

| From | Allowed to | Actor |
|---|---|---|
| placed | confirmed, rejected | kitchen/admin |
| placed | cancelled | customer (own order), admin |
| confirmed | preparing, cancelled | kitchen/admin (cancel: admin only) |
| preparing | ready | kitchen/admin |
| ready | out_for_delivery | kitchen/admin |
| out_for_delivery | delivered | kitchen/admin |
| delivered / cancelled / rejected | (terminal) | none |

| Failure | Handling |
|---|---|
| Double tap or retry | The same idempotency key returns the same order. |
| Price or availability changed after the quote | `price_changed` or `item_unavailable`, with the new quote. Nothing is created. |
| Item unavailable or ingredient removed | That line is rejected with a reason. The order is not created. |
| Address deleted mid-checkout or not owned | `address_invalid`. |
| Outside zone, or no fee configured | `delivery_unavailable`. |
| Window full or past its cutoff | `window_unavailable`. |
| Ordering disabled, or illustrative prices in production | `ordering_closed`, with a clear customer message. |
| Concurrent checkout from two tabs | The cart row lock means the second call sees an empty cart or the idempotent result. |
| Too many active orders | `limit_reached`. |
| Transaction failure | Full rollback. The cart is untouched. |

Customer-facing errors are mapped to friendly copy. Raw database messages are never shown.

### 5.2 Concurrency-safe delivery capacity (D-034)
**Unit.** The booking unit is **orders** or **bowls**; this is pending decision P-4. The design below supports either: `units` is 1 per order, or the sum of the quantities.

**Booking, inside `place_order`'s transaction:**
1. Take `pg_advisory_xact_lock(hashtextextended(user_id || idempotency_key, 0))`. A replay with the same key therefore waits, then returns the existing order **without booking again**.
2. Read the window (`is_active`, the capacity, and whether the date and cutoff are valid in Asia/Kolkata) with `for share`. This stops the window from being deactivated or resized mid-booking.
3. Run the atomic conditional upsert:
   ```sql
   insert into delivery_slot_usage (window_id, delivery_date, booked_units)
   select $w, $d, $units where $units <= $capacity
   on conflict (window_id, delivery_date) do update
     set booked_units = delivery_slot_usage.booked_units + excluded.booked_units
     where delivery_slot_usage.booked_units + excluded.booked_units <= $capacity
   returning booked_units;
   ```
   If no row comes back, the result is `window_full`, and the whole transaction rolls back.
   - Concurrent bookings serialise on the row lock of the unique key, so **overbooking is impossible**.
   - No `serializable` isolation or retry loop is needed.
4. Insert the order with `slot_units = $units`.

**Release.**
- When an order moves into `cancelled` or `rejected`, `set_order_status` and `cancel_my_order` subtract `slot_units` in the same transaction and then set it to 0.
- Release therefore happens exactly once, and a CHECK keeps `booked_units ≥ 0`.

**Capacity reduced below current bookings.** Existing orders are kept, and new bookings fail until usage drops back below the capacity.

**Phase 6.0 proof of concept.** This was a throwaway local PostgreSQL 16 run with real parallel `psql` sessions; nothing was committed or hosted.

| Scenario | Placed | Booked |
|---|---|---|
| 20 parallel orders of 1 unit against capacity 5 | 5 | 5 |
| 12 parallel orders of 2 units against capacity 10 | 5 | 10 |
| One order of 4 units against capacity 3 | 0 | no usage row |

**Tests (`supabase/tests/concurrency_stage6.sh`)** run real parallel `psql` sessions against the throwaway local Postgres:
- **C-01:** 20 parallel orders for a window with capacity 5 → exactly 5 placed and 15 `window_full`, with `booked_units = 5`.
- **C-02:** 10 parallel calls with the same idempotency key → 1 order and 1 unit booked.
- **C-03:** parallel cancel and place on a full window → never over capacity, never below 0.
- **C-04:** a window deactivated mid-flight → no booking on the inactive window.
- **C-05:** two tabs checking out the same cart → 1 order. The second call gets an empty cart or the idempotent result.

### 5.3 Test orders can never become production orders (D-035)
1. **Physical separation.** Development orders live only in the dev database (`proji-dev`, or the local stack). No migration, seed, script or function copies data between environments.
2. **Environment marker.**
   - `app_environment` is written once at provisioning. The dev provisioning script checks that the target project ref is **not** `uwkgnsjdbjoqiimvefct` and stops if it is.
   - The marker is immutable, so a dev database can never be relabelled `production`.
3. **Order labelling.**
   - Every order in a development database gets `is_test = true`, `environment = 'development'` and a `TEST-` order number.
   - These values come from the database, never from the browser.
4. **Constraints.**
   - Illustrative prices require `is_test`.
   - Production rejects `is_test`.
   - The columns `is_test`, `environment` and `order_number` are immutable after insert.
5. **Seed guard.** `supabase/seed/dev_illustrative_commerce.sql` starts with a check that raises an error unless `app_environment = 'development'`. A missing marker also aborts.
6. **Build and deploy guard.**
   - A new `scripts/check-env-target.mjs` fails the Vercel build if `VERCEL_ENV=production` is not pointed at the production project ref.
   - It also fails if a preview or development build **is** pointed at the production ref.
7. **UI.** The client reads the label from the order row. Test orders show a persistent "TEST ORDER – will not be prepared or delivered" banner in the confirmation, the order history and (in Stage 8) the kitchen view.
8. **Tests.** S-14 to S-17 in section 8.1.

## 6. Payment and delivery boundaries
- **Payment:**
  - **No online payment in Stage 6** unless you approve a provider.
  - The proposal: `payment_method = 'pay_on_delivery'` only, with `payment_status` set by staff.
  - The schema reserves fields so that Razorpay (or similar) can be added later through an Edge Function and signed webhooks.
  - No card or UPI data ever touches PROJI.
- **Delivery:**
  - Zones are defined by postal-code allow-lists that you configure.
  - Fees and minimum order values come from those zones. **If a fee is unset, ordering is blocked in that zone.**
  - Scheduled windows come from `delivery_windows`, replacing the placeholder slots.
  - **There is no live rider tracking.** The customer sees a status timeline. Rider assignment and dispatch come in Stage 8.
- **Taxes and discounts:**
  - Tax is applied only when `tax_mode` is configured. Otherwise checkout shows "Taxes: to be confirmed" and **ordering is blocked**.
  - There are no discounts or coupons in Stage 6.

## 7. Security risks and mitigations

| Risk | Mitigation |
|---|---|
| Client tampers with price or nutrition | They're never accepted. Server functions compute and snapshot both. |
| Duplicate orders | `unique(user_id, idempotency_key)`, the request hash and the cart row lock. |
| IDOR on orders or addresses | RLS on `auth.uid()`, and the functions re-check ownership. Tests cover cross-user reads and writes. |
| Customer escalates status | No update grants. Customers can only call `cancel_my_order`; transitions are role-checked. |
| SECURITY DEFINER misuse | `search_path=''`, schema-qualified names, `revoke from public, anon`. Each function does its own `auth.uid()` and role checks. Supabase advisors are reviewed after each migration. |
| Service-role key leaks | No service key is used anywhere. `check:bundle` is extended to fail on `service_role` or JWT-like secrets. |
| Illustrative prices taken as real | `price_status` is stored on orders. `allow_illustrative_orders = false` in production. The UI labels any illustrative values. |
| Cart spam or abuse | Caps of 30 lines and quantity 20, active-order limits, and guests can't write to the database. |
| PII exposure to staff | Staff read the order's address snapshot only, never `customer_addresses` (D-020 kept). The snapshot is minimal: name, phone, address, landmark and instructions. |
| Mutating historical orders | An immutability trigger and no grants. |
| Overbooking a delivery window | Atomic conditional upsert on `delivery_slot_usage`, exactly-once release, and parallel-session tests C-01 to C-05. |
| Test orders mixed with real ones | A separate dev database, the immutable environment marker, the `is_test` constraints, `TEST-` numbering, the seed guard and the build target guard (section 5.3). |
| Testing against production | RLS tests run on local Postgres. Hosted checks run on a dev database. **Production migration only with your confirmation.** |

## 8. Implementation phases and acceptance tests
Each phase is one small PR (or a commit on `stage-6/ordering`), and you approve each one before the next starts.

| Phase | Scope | Key acceptance tests |
|---|---|---|
| **6.0 Prerequisites** | Your decisions (section 9). Resume or confirm the PROJI project, and set up a dev environment. Confirm the Stage 5 migration is applied. | Project ID and name verified. Migration list matches the repo. |
| **6.1 Commerce catalog** | Migration A, the dev-only illustrative seed, and RLS tests. A client `CommerceCatalog` reader is used only for availability. | Anon reads only available rows. Customers can't write. Admin and R&D can write. Settings are hidden from anon. |
| **6.2 Persistent cart** | Migration B, cart RPCs, `CartRepository` (local, Supabase and in-memory), and the guest merge. | Add the same bowl twice → quantity 2, 1 line. Add-on order doesn't create duplicates. Caps hold. Merge is idempotent. The cart survives a reload and appears on another device. Users can't read other users' carts. |
| **6.3 Quote and checkout** | `quote_checkout`, the real zones and windows in the UI, and blocking reasons. The Stage 5.5 layout is kept. | Server totals equal the sum of the lines plus fee plus tax. A tampered client value has no effect. Each blocking reason shows its message. |
| **6.4 Place order** | Migration C, `place_order`, snapshots, the idempotency path, and the real confirmation page. | 10 parallel calls with the same key create 1 order. A price change returns `price_changed`. Unavailable items are rejected. Snapshots are unchanged after catalog edits. The cart is emptied. |
| **6.5 Orders** | Order history and detail, `cancel_my_order`, `set_order_status` with the transition table, and staff read RLS (no staff UI). | Customers see only their own orders. They can't update status. Cancel only works while `placed`. Invalid transitions are rejected. A kitchen user can read but not modify an order outside the allowed transitions. |
| **6.6 Hardening** | Advisors, the extended `check:bundle`, full E2E at 390, 393, 360 and 320 px, accessibility, docs and hosted verification on dev. | All Stage 1–5.5 suites green. Zero serious axe issues. No overflow. Security advisors clean. |

### 8.1 Explicit RPC security tests (`supabase/tests/rls_stage6_test.sql`)

| ID | Test |
|---|---|
| S-01 | Catalog audit: every `SECURITY DEFINER` function in `public` and `private` has `search_path=''`, and none is executable by `PUBLIC` or `anon`. The test queries `pg_proc` and `has_function_privilege`. |
| S-02 | Each RPC called as `anon` → permission denied. |
| S-03 | Each RPC called as customer A against B's cart line, address or order → "not found". There is no difference between "exists" and "not yours", so nothing leaks. |
| S-04 | Function signatures (from `pg_proc`) contain no price, total, fee, tax or nutrition arguments. Extra JSON keys such as `price`, `unitPriceMinor` or `total` in cart and merge payloads are ignored, and the stored result is unchanged. |
| S-05 | Input bounds: quantity of 0, 21 or −1; 31 lines; malformed or oversized configuration; unknown IDs; a null key; a past or invalid date; a window outside its days → each rejected with a coded error. |
| S-06 | Direct `insert`, `update` and `delete` by `authenticated` on `orders`, `order_items`, `order_status_events`, `delivery_slot_usage`, `app_environment` and `commerce_settings` → denied. |
| S-07 | Immutability: updating money or snapshot columns raises an error, even as the table owner. |
| S-08 | `cancel_my_order` works on own orders in `placed` only; any other status or another user's order → rejected. |
| S-09 | `set_order_status`: customer and `rd` denied; `kitchen` and `admin` allowed only on valid transitions. Every change writes exactly one event, with `actor_id = auth.uid()`. |
| S-10 | Staff read policy: kitchen and admin can read orders but not `customer_addresses`. Customers read only their own orders. |
| S-11 | Idempotency: the same key with the same payload returns the same order; the same key with a different payload → `idempotency_conflict`. |
| S-12 | Quote integrity: after an admin price change, `place_order` with the old `quote_hash` → `price_changed`, and no order is created. |
| S-13 | `ordering_enabled = false`, a missing `app_environment`, a zone fee not configured, or `tax_mode = not_configured` → `ordering_closed` or `delivery_unavailable`. Fails closed. |
| S-14 | In a development environment, every order has `is_test = true` and a `TEST-` number. |
| S-15 | In a production environment, an order with illustrative prices is rejected, and inserting `is_test = true` is rejected. |
| S-16 | `app_environment` cannot be updated or deleted, by any role. |
| S-17 | The seed script aborts when the environment is `production` or the marker is missing. |
| S-18 | Mutation check (as in Stage 5): temporarily dropping each policy or grant, or removing `search_path`, makes at least one test fail. |

Concurrency tests C-01 to C-05 are listed in section 5.2.

Tests to add:
- `supabase/tests/rls_stage6_test.sql`, covering catalog, cart, orders, functions, immutability and idempotency.
- Vitest: repositories, merge, item key and error mapping.
- Playwright: `e2e/stage6-ordering.spec.ts`, against the test-auth build plus an in-memory order store that mirrors the functions.

## 9. Product decisions (updated 2026-10-13)

| # | Decision | Status | Record |
|---|---|---|---|
| 1 | Minimal commerce catalog tables in Stage 6, extended by Stage 7. This amends D-015. | **Adopted (recommended)** | D-027 |
| 2 | Production ordering stays closed until you approve prices. Development allows illustrative **test** orders only. | **Adopted** | D-028 |
| 3 | Separate development database (`proji-dev`), with production untouched | **Proposed; creating it needs your approval** | D-029, `docs/ENVIRONMENTS.md` |
| 4 | Payment: pay on delivery only (`payment_status` set by staff). No online payment in Stage 6. | **Adopted (recommended)** | D-030 |
| 5 | Checkout requires sign-in. Guests keep a device cart that merges on sign-in. | **Adopted (recommended)** | D-031 |
| 6 | Signature meals are priced as the sum of their components. The schema supports a fixed price later. | **Adopted (recommended)** | D-032 |
| 7 | Customers can cancel only while an order is `placed`. Order numbers are `PJ-YYMMDD-NNNN`, with a `TEST-` prefix in dev. Staff can read orders and change status through functions now; the UI comes in Stage 8. | **Adopted (recommended)** | D-033 |
| 8 | Concurrency-safe delivery capacity | **Adopted** | D-034 |
| 9 | Test orders isolated and labelled | **Adopted** | D-035 |
| P-1 | Delivery zones: postal codes, fee per zone, minimum order value, pickup | **Pending.** Ordering stays blocked until set. | D-036 |
| P-2 | Delivery windows: times, days, cutoffs | **Pending.** Inactive until set. | D-036 |
| P-3 | Tax: GST-inclusive or exclusive, and the rate (confirm with your accountant) | **Pending.** `tax_mode = not_configured` blocks ordering. | D-036 |
| P-4 | Capacity: unit (orders or bowls) and size per window | **Pending.** A window can't be activated without it. | D-036 |
| P-5 | Online payment provider (for example Razorpay) in a later stage | **Pending** | none |

## 10. Files and migrations to create or modify

### New
| Path | Purpose |
|---|---|
| `supabase/migrations/2026MMDD000001_stage6_commerce_catalog.sql` | Migration A |
| `supabase/migrations/2026MMDD000002_stage6_carts.sql` | Migration B and the cart RPCs |
| `supabase/migrations/2026MMDD000003_stage6_orders.sql` | Migration C, the quote, place, cancel and status functions, and the immutability trigger |
| `supabase/rollback/stage6_*.sql` | Rollback for each migration |
| `supabase/seed/dev_illustrative_commerce.sql` | Dev-only seed generated from the builder fixtures. **Never production.** |
| `supabase/tests/rls_stage6_test.sql` | RLS, function and idempotency tests S-01 to S-18 |
| `supabase/tests/concurrency_stage6.sh` | Parallel-session capacity and idempotency tests C-01 to C-05 |
| `supabase/provision/{development,production}_environment.sql` | Writes `app_environment` once, with the project-ref guard |
| `scripts/check-env-target.mjs` | Vercel build guard: production builds use the production ref, previews never do |
| `src/features/cart/{cartRepository,supabaseCartRepository,memoryCartRepository,itemKey,mergeGuestCart,CartProvider}.ts(x)` | Persistent cart |
| `src/features/orders/{types,orderRepository,supabaseOrderRepository,memoryOrderRepository,status,errors,idempotency,OrdersProvider}.ts(x)` | Orders |
| `src/features/commerce/{types,commerceRepository}.ts` | Zones, windows, availability |
| `src/pages/order/OrderConfirmationPage.tsx` | Real confirmation, replacing the preview |
| `src/pages/account/OrderDetailPage.tsx` | Order detail and timeline |
| `e2e/stage6-ordering.spec.ts`, plus unit tests beside each module | Tests |
| `docs/stages/STAGE_06_ACCEPTANCE_TESTS.md`, `STAGE_6_REPORT.md` | Docs |
| `docs/ENVIRONMENTS.md` | Environment map and rules. **Added in Phase 6.0.** |

### Modified
| Path | Change |
|---|---|
| `src/features/cart/cartStore.ts`, `cartTotals.ts`, `checkoutOptions.ts` | Guest-only store; server quote for signed-in users; remove placeholder slots |
| `src/features/builder/cartBoundary.ts`, `src/pages/CustomizePage.tsx`, meal quick-add components | Add to Cart goes through `CartRepository` |
| `src/pages/order/CartPage.tsx`, `CheckoutPage.tsx` | Wired to the repositories; layout unchanged |
| `src/pages/order/ConfirmationPreviewPage.tsx` | Removed or redirected |
| `src/pages/account/OrdersPage.tsx`, `src/features/account/{accountContext,types}.ts` | Real order history |
| `src/main.tsx` (routes) | `/orders/:id/confirmation`, `/account/orders/:id` |
| `src/testing/*` | In-memory cart and order stores for the test-auth build |
| `supabase/tests/run_rls_tests.sh` | Run the Stage 6 suite |
| `scripts/check-bundle.mjs` | Fail on service-role or secret patterns |
| `docs/stages/STAGE_06_CHECKOUT.md`, `DECISIONS.md` (D-027 onwards), `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `PROJECT_ROADMAP.md`, `CHANGELOG.md` | Documentation |

### Not touched
- Stage 1 and Stage 5 migrations.
- `saved_bowls`, addresses and preferences tables.
- The builder engine and nutrition calculations.
- The Stage 5.5 visual design.
- Anything RightMix.

## 11. Phase 6.0 findings (2026-10-13, read-only)

### 11.1 PROJI Supabase project
I only read project metadata; I did not restore, migrate or query data.

| Check | Result |
|---|---|
| Project | `uwkgnsjdbjoqiimvefct`, name **"Proji"**, ap-south-1, Postgres 17.6, created 2026-09-29 |
| Organisation | `rzijhbdkywqdtgvjlcfq` ("Proji"), **free plan** |
| Status | **INACTIVE (paused).** Free-plan projects pause after a period of inactivity. |
| Migration history | **Not readable.** The read-only call times out while the project is paused. |
| Branches | None |
| Connector visibility | Resolves by ID, but `list_projects` shows only the RightMix organisation (`rightmix`, `rightmix copy`). RightMix was not touched. |

**Consequence: the production app is probably degraded right now.**
- Sign-in and every Supabase-backed page fail while the project is paused.
- `main` (Stage 5.5) calls Stage 5 tables that may not exist on the hosted database.
- I couldn't check Vercel from this session; the connector was disconnected.

### 11.2 Stage 5 verification discrepancy, reconciled

| Source | Says |
|---|---|
| `PROJECT_ROADMAP.md` | Stage 5 "Complete: merged (PR #29)" |
| `STAGE_5_REPORT.md` | "**Not yet applied to any hosted project** … the owner must apply it with `supabase db push`" |
| `STAGE_05_ACCEPTANCE_EVIDENCE.md` | Hosted verification **Pending** |

**Reconciled status:**
- Stage 5 is **merged and locally verified**.
- Whether its migration is on the hosted project is **unverified**. Assume it is **not applied** until the migration history is read.
- The roadmap is corrected on this branch.

**Second finding: the repository's migration history doesn't match a CLI push.**
- `supabase/migrations/` holds `20260929000001_stage1_profiles_roles.sql`, which is the full Stage 1 schema.
- It also holds two **empty** files, `20260929220823_stage1_profiles_roles.sql` and `20260929220838_stage1_harden_has_role_rpc.sql`. Their names suggest they mirror the hosted history, which was applied through the dashboard or MCP.
- If the hosted history lacks `20260929000001`, `supabase db push` would try to re-run the whole Stage 1 schema and fail ("type already exists").
- It could also skip the hardening that only exists in the hosted copy.
- **This must be reconciled before any hosted migration.** The fix: read the hosted `schema_migrations`, then either `supabase migration repair` or replace the empty files with their real content. Both are your decision.

### 11.3 Development database proposal (D-029)

| Option | Cost and limits | Fit |
|---|---|---|
| **A. New hosted project `proji-dev`** in the Proji organisation (ap-south-1) | Free | **Recommended** for Vercel preview deployments and hosted verification. **Possible blocker:** Supabase's free plan limits how many projects can be active at once, and `rightmix copy` is currently active. Restoring Proji *and* running `proji-dev` may exceed it. Please check this in the dashboard. I won't pause anything RightMix. |
| B. Supabase branching on Proji | Needs a paid plan, plus compute per branch | Clean, but changes cost. Not recommended yet. |
| C. Local Supabase stack (`supabase start`) | Free; needs Docker | Use **in addition** for development and CI. The SQL tests already use a throwaway local Postgres. |

**Proposed mapping** (written up in `docs/ENVIRONMENTS.md`):

| Vercel environment | Supabase project |
|---|---|
| Production | `uwkgnsjdbjoqiimvefct` (Proji) |
| Preview and Development | `proji-dev` |
| Local and CI | Local stack or throwaway Postgres |

- Credentials are independent: each project has its own publishable key, and there are no service-role keys in the client.
- **Nothing is created until you approve it.**

### 11.4 Blockers before Phase 6.1

| # | Blocker | Needs |
|---|---|---|
| B-1 | The production project is paused, so its migration history can't be read | Your approval to **restore** it (it is resumed only, nothing else changes), or you restore it from the dashboard |
| B-2 | Hosted migration history may not match the repository (11.2) | A read-only check after B-1, then your choice of repair approach |
| B-3 | The Stage 5 migration is probably not applied to production | Your approval to apply it, after B-2 |
| B-4 | No development database | Approval for `proji-dev` (option A), and a check of the free-plan project limit |
| B-5 | Vercel environment variables for Preview must point at `proji-dev` once it exists | Vercel access in a later session, or you set them |
| B-6 | Zones, fees, windows, tax and capacity are undecided (P-1 to P-4) | **Not blocking 6.1 to 6.4 in dev.** Production ordering stays closed until they are decided. |
