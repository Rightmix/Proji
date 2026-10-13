# PROJI environments

**Status:** proposed in Stage 6 Phase 6.0 (D-029, D-035). `proji-dev` **does not exist yet**; creating it needs owner approval.

| Environment | Supabase project | Vercel | Data | Orders |
|---|---|---|---|---|
| **Production** | `uwkgnsjdbjoqiimvefct` ("Proji", ap-south-1) | Production deployments of `main` | Real customers. The catalog is empty until Stage 7 approves data. | Real orders only after prices are approved (D-028). `is_test` is rejected. |
| **Development (hosted)** | `proji-dev` (proposed; Proji organisation, ap-south-1) | Preview and Development deployments | Test accounts and the illustrative seed only | **Test orders only**: `is_test = true`, `TEST-` numbers, never prepared or delivered |
| **Local / CI** | Local Supabase stack or throwaway Postgres (`supabase/tests/run_rls_tests.sh`) | none | Fixtures | Test only |

**Never used:** `rightmix` and `rightmix copy`, or any RightMix resource, credential or data.

## Rules
1. **Same migrations everywhere.** Migrations contain no environment-specific data.
   - The environment is set once per database by `supabase/provision/<env>_environment.sql`, which writes the immutable `app_environment` row.
   - The development script stops if run against `uwkgnsjdbjoqiimvefct`.
2. **Changes flow one way:** local → `proji-dev` → production. Every production migration needs explicit owner approval, after verification on `proji-dev`.
3. **No data copies** between environments in either direction. Production customer data is never used in development.
4. **Separate credentials.**
   - Each project has its own URL and publishable key in the matching Vercel environment.
   - No service-role key is ever used in client code or in Vercel frontend variables.
5. **Build guard** (`scripts/check-env-target.mjs`, Stage 6.1):
   - Production builds must target the production ref.
   - Preview and Development builds must **not** target it.
6. **Seeds:** the illustrative commerce seed runs only where `app_environment = 'development'`.
7. **Free-plan note:** inactive free projects pause.
   - Check the organisation's active-project limit before creating `proji-dev`.
   - RightMix projects are never paused or changed to make room.

## Before Stage 6 hosted work (Phase 6.0 blockers)
See `docs/stages/STAGE_06_PLAN.md` §11.4.
1. Restore the paused production project (owner approval).
2. Read its migration history and reconcile the repository's Stage 1 files.
3. Apply and verify the Stage 5 migration (owner approval).
4. Create `proji-dev` (owner approval).
5. Point the Vercel Preview and Development variables at `proji-dev`.
