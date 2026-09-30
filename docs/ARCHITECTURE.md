# PROJI Architecture (Stage 1 baseline)

## Route areas (D-005)
| Area | Routes | Access |
|---|---|---|
| Customer | `/`, `/menu`, `/build`, `/login`, `/unauthorized`, 404 | Public |
| Customer | `/account` | Any signed-in user |
| Admin / R&D | `/admin/*` | `admin`, `rd` |
| Kitchen | `/kitchen/*` | `kitchen`, `admin` |

Client guards (`RequireRole`, `AREA_ROLES` in `src/auth/roles.ts`) mirror database policies but are not the security boundary.

## Data and security
- `auth.users` → trigger creates `public.profiles` + `customer` role.
- `public.user_roles(user_id, role)`; roles: customer, admin, rd, kitchen. Only admins can grant/revoke (not their own), `granted_by` must be the caller.
- `public.has_role(role)` — `SECURITY DEFINER`, fixed `search_path`, used by all future policies.
- Future privileged mutations (pricing, order confirmation) go through server-side functions/RPCs; the browser never computes authoritative price.

## Stage 4 readiness (awareness only — not implemented)
The animated builder will live under `/build` as its own lazily loaded route chunk so heavy layered bowl assets don't bloat other areas. It needs: one canonical bowl-selection state (single store) driving both layers and totals; ingredient/asset metadata served from Supabase (tables + Storage bucket) in later stages; `prefers-reduced-motion` handling; and server-side price/availability validation before orders (Stage 6/7). No Stage 4 code exists yet.
