# PROJI Security Model (as of Stage 5)

## Principles
- The browser uses only the Supabase **publishable** key. No service-role key or privileged function is shipped; `npm run check:bundle` and an E2E bundle scan enforce this.
- **Row Level Security is the security boundary.** Route guards and UI filtering are only for user experience.
- **No privilege escalation:** roles live in `user_roles`, are granted only by admins (Stage 1), and are checked through `private.has_role`, which is a SECURITY DEFINER function kept out of the exposed schema.

## Tables
| Table | Owner column | Policies | Client-writable columns |
|---|---|---|---|
| `profiles` | `id = auth.uid()` | read own, insert own (missing-profile recovery), update own; admins can read all | `full_name`, `phone` (insert: also `id`, which must equal `auth.uid()`) |
| `user_roles` | `user_id` | read own; admins read, grant and revoke (not their own) | admin only |
| `customer_addresses` | `user_id default auth.uid()` | own rows only (`for all`) | address fields and `is_default`; never `user_id`, `id` or timestamps |
| `customer_preferences` | `user_id` (PK) | own row only | `spice_level`, `include_cutlery` |
| `saved_bowls` | `user_id default auth.uid()` | own rows only | `name`, `configuration` |

`anon` has no privileges on any of these tables. Staff roles (admin, rd, kitchen) have **no** access to customer addresses, preferences or saved bowls in Stage 5. Any future staff access, such as delivery addresses on Stage 8 orders, must be granted explicitly and tested.

## Integrity rules (enforced in the database)
- **Addresses:**
  - label enum, required fields, phone and postal-code formats, ISO country code, length limits
  - at most 20 per user
  - one default per user (partial unique index); the first address becomes the default, and deleting the default promotes another
- **Saved bowls:**
  - `configuration` must be a v1 `BowlConfiguration` (exact keys, ID formats, at most 2 flavours and 3 toppings, no duplicates)
  - name 1–60 characters, unique per user (case-insensitive)
  - at most 50 per user
  - ingredient existence and availability are checked in the app at restore time (`savedBowlCodec`); there is no catalog table until Stage 7
- **Account deletion:** deleting the auth user cascades to all customer-owned rows.

## Functions
- `public.set_default_address(uuid)` runs as **SECURITY INVOKER**, so it is subject to the caller's RLS. `anon` cannot execute it.
- The address and saved-bowl triggers are SECURITY INVOKER and have a fixed `search_path`.
- `private.is_valid_bowl_configuration(jsonb)` is IMMUTABLE. `authenticated` can execute it so the CHECK constraint can be evaluated.

## Tests
`npm run test:rls` applies every migration to a throwaway Postgres with a Supabase auth shim and runs:
- `supabase/tests/rls_test.sql` (Stage 1)
- `supabase/tests/rls_stage5_test.sql` (Stage 5): anon denial, two-user isolation including guessed IDs and the RPC, ownership spoofing, column privileges, constraints, limits, default rules, staff denial and cascade on deletion

Mutation checks confirmed that the suite fails if a policy is opened or `user_id` becomes insertable.
