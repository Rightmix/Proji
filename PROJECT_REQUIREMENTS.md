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
