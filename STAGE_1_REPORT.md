# Stage 1 Report — Project Foundation

**Date:** 2026-09-29 · **Branch:** `stage-1/foundation` · **Status:** Implementation done locally; **NOT complete** (acceptance items blocked — see below).

## Implemented
- Vite + React 19 + TypeScript, Tailwind v4 (provisional brand tokens), React Router with customer/staff layouts.
- Routes: `/`, `/menu`, `/build`, `/login`, `/account`, `/admin`, `/kitchen`, `/unauthorized`, 404.
- Supabase Auth client (publishable key only), `AuthProvider`, email/password sign-in/sign-up, `RequireRole` guard.
- Migration `20260929000001_stage1_profiles_roles.sql`: `profiles`, `user_roles`, `app_role` enum, `has_role()`, new-user trigger (customer default), RLS + column grants; manual rollback script.
- Tooling: ESLint, Prettier, Vitest + RTL, Playwright (mobile + desktop), RLS test harness, GitHub Actions CI, `vercel.json` SPA rewrites, `.env.example`, README setup/migration/rollback.

## Test evidence (local sandbox, 2026-09-29)
| Check | Result |
|---|---|
| `npm run lint` | Pass (0 problems) |
| `npm run format:check` | Pass |
| `npm run build` (incl. `tsc -b`) | Pass — JS 319 kB / 101 kB gzip |
| `npm test` | **18/18 pass** (roles + route guards for anon/customer/kitchen/admin/rd) |
| `npm run test:e2e` | **20/20 pass** (10 × mobile Pixel 7, 10 × desktop Chrome) against local production build: direct navigation to all public routes, protected-route redirects, no service_role in bundle |
| `npm run test:rls` | **Pass** on clean Postgres 16 with a Supabase auth shim: default customer role, no self-elevation (customer/kitchen), no cross-user profile read/update, no id change, anon denied, admin grant/revoke, no granted_by spoofing, no self-revoke. Mutation check: an over-permissive policy was correctly detected as FAIL. |

## Acceptance criteria
| Criterion | Status |
|---|---|
| Local app and production build work | ✅ Verified |
| Placeholder routes + direct navigation on **preview deployment** | ⚠️ Verified locally only; no Vercel preview yet |
| Auth verified against configured Supabase project | ❌ Blocked — no PROJI Supabase project exists |
| Customer/kitchen privilege restrictions | ✅ Verified (unit + RLS on local Postgres); ⏳ re-run on hosted project |
| No self-granted roles; RLS blocks cross-user access | ✅ Verified locally |
| Migrations apply to clean database | ✅ Local Postgres 16; ⏳ hosted Supabase |
| Lint, unit, E2E, RLS pass | ✅ Locally; ⏳ CI not yet run on GitHub |
| No secrets committed; setup & rollback documented | ✅ |
| Deployment URL recorded | ❌ Blocked |

## Blockers / decisions needed
1. **GitHub write access:** the automated session could not push to `Rightmix/Proji` (repo not authorised for the session) and could not read Issues #1, #13–19. Branch delivered as a patch/bundle instead.
2. **Supabase:** only `rightmix` and `rightmix copy` projects exist — neither may be used. Need approval to create a new **PROJI** project (region suggestion: ap-south-1 Mumbai; confirm free vs paid plan).
3. **Vercel:** no PROJI project; create after the repo branch is pushed, with PROJI-only env vars.
4. Email confirmation / SMTP settings and first-admin bootstrap need the owner.
