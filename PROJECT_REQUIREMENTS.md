# PROJI — Product Requirements

## Vision
**Build Your Bowl. Build Your Body.** Mobile-first customizable traditional Indian congee (kanji), rice and grain-based protein bowls, launching initially in Calicut, Kerala.

## Initial customers and pilot
Fitness-conscious customers, office workers and people seeking convenient customizable meals. Proposed controlled cloud-kitchen pilot: three signature bowls plus a custom builder, one limited delivery zone and an initial target of 30–50 bowls/day. Targets require validation; they are not established capacity.

## Customer experience
1. Choose base: Kerala Matta rice kanji, brown rice congee, millet, oats and other tested bases.
2. Choose protein: chicken, fish, beef, egg, paneer, tofu, chickpeas, lentils and validated alternatives.
3. Choose flavor: Kerala pepper, coconut curry, tandoori and tested regional flavors.
4. Choose toppings: curry leaves, roasted onions, papadam, seeds, vegetables and others.
5. See ingredient information, allergens, validated recipe-based nutrition estimates and dynamic price.
6. Cart, address, delivery scheduling, payment, confirmation and tracking.

## MVP functional requirements
- Mobile-first homepage and signature-bowl catalog.
- Four-step bowl builder with compatible options, portion controls and transparent price/macros.
- Accounts, addresses, saved bowls, order history.
- Server-validated pricing and order snapshots.
- Admin/R&D ingredient and recipe master data, costs, portion weights, nutrition and allergen controls.
- Kitchen tickets with exact component weights, preparation statuses and dispatch.
- Basic inventory and availability control.
- Delivery zone restrictions and order scheduling.

## Later capabilities
Subscriptions, recurring meal plans, pause/skip, loyalty, personalized meal discovery and possible packaged retail. Avoid unsupported clinical or therapeutic claims. Native apps only after PWA validation.

## Non-functional requirements
Role-based access and Supabase RLS; no browser-exposed privileged secrets; auditability of prices and recipes; accessible responsive UI; tested calculations; privacy and data minimization; production monitoring and documented rollback.

## Brand
Lime #70C043; black #111111; off-white #F5F5F5; gray #666666; beige #D9C7A1. Premium food-focused imagery. Generated menu-image macros are illustrative, not validated recipe data.

## Open decisions
Final recipes, supplier prices, nutritional data source, allergen procedures, delivery radius, payments, subscription economics, production capacity and regulatory review. Reference experiences: Lola Cake customization and Calo meal planning; do not copy their proprietary work.

## Animated customization — approved Stage 4 planning specification (2026-09-27)
The previously approved four-screen mockup is the visual master and must be supplied before implementation. The four-stage builder has a persistent matte-black top-down bowl, initially empty with YOUR BOWL BUILDS HERE. A mobile sticky preview stays near the top while ingredient choices scroll below; responsive behavior must avoid hiding controls on short screens. Top navigation has back, Customize, live total and share. Below the bowl: live kcal, protein, carbs and fat (protein highlighted); BASE / PROTEIN / FLAVOUR / TOPPING tabs; ingredient cards; sticky Next / View Nutrition / Add to Cart footer.

Base and protein are single-select; flavours max two; toppings max three. Every selection, replacement and removal must update aligned photorealistic bowl layers and live totals from one canonical state. Animations: base ~600ms, protein ~500ms, flavours ~700ms, toppings ~500ms. Handle rapid changes, reduced-motion preferences, progressive asset loading and accessible selection states. Hybrid professional food photography and AI-assisted assets are approved for planning, subject to compositing and fidelity review. No per-selection AI image generation.

First visual milestone covers all 15 proposed ingredients (3 bases, 4 proteins, 4 flavours, 4 toppings) with clearly labelled illustrative nutrition and pricing, not production-validated values. Exact ingredient list, provisional figures, file targets, acceptance criteria and deferred integrations: [Stage 4 plan](docs/stages/STAGE_04_BOWL_BUILDER.md). Real checkout, saved bowls, subscriptions, kitchen tickets and production recipe data remain their respective stage deliverables; the milestone must not claim those integrations are complete. Production ordering requires backend recipe/availability/price validation and immutable confirmed-order snapshots.
