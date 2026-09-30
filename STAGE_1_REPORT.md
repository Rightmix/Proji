# Stage 1 Report — Project Foundation

**Date:** 2026-09-30 · **Branch:** `stage-1/foundation` · **Status:** Acceptance verified; ready for final PR review and merge.

## Implemented
- Vite + React 19 + TypeScript, Tailwind v4 (provisional brand tokens), React Router with customer/staff layouts.
- Routes: `/`, `/menu`, `/build`, `/login`, `/account`, `/admin`, `/kitchen`, `/unauthorized`, 404.
- Supabase Auth client (publishable key only), `AuthProvider`, email/password sign-in/sign-up, `RequireRole` guard.
- Migration `20260929000001_stage1_profiles_roles.sql`: `profiles`, `user_roles`, `app_role` enum, private `has_role()` helper, new-user trigger (customer default), RLS + column grants; manual rollback script.
- Tooling: ESLint, Prettier, Vitest + RTL, Playwright (mobile + desktop), RLS test harness, GitHub Actions CI, `vercel.json` SPA rewrites, `.env.example`, README setup/migration/rollback.

## Verification evidence
| Check | Result |
|---|---|
| `npm run lint` / formatting / TypeScript | ✅ Pass locally and GitHub CI |
| Production build | ✅ Pass locally and GitHub CI |
| Unit tests | ✅ 18/18 pass |
| Browser E2E | ✅ 20/20 pass locally; GitHub E2E job pass |
| RLS/security tests | ✅ Local harness pass; GitHub RLS job pass |
| Supabase project isolation | ✅ Dedicated PROJI project (`uwkgnsjdbjoqiimvefct`); RightMix projects untouched |
| Hosted RLS structure | ✅ `profiles` / `user_roles` RLS policies present; privileged role helper hardened outside exposed `public` schema |
| Vercel project | ✅ Dedicated `proji` project created; RightMix Copy untouched |
| Hosted preview | ✅ `stage-1/foundation` deployed successfully on Vercel |
| Real Supabase authentication | ✅ Test user signup/sign-in and `/account` verified on hosted preview |
| Default role | ✅ New test user received `customer` only |
| Customer → `/admin` | ✅ Redirected to `/unauthorized` |
| Customer → `/kitchen` | ✅ Redirected to `/unauthorized` |
| Temporary admin positive test | ✅ Authorized test account opened `/admin` |
| Temporary kitchen positive test | ✅ Authorized test account opened `/kitchen` |
| Test-role cleanup | ✅ Temporary staff roles removed; database re-verified as `customer` only |

## Acceptance criteria
| Criterion | Status |
|---|---|
| Local app and production build work | ✅ Verified |
| GitHub CI (checks + RLS + E2E) | ✅ Verified |
| Placeholder routes + direct navigation on preview deployment | ✅ Verified |
| Auth verified against configured PROJI Supabase project | ✅ Verified |
| Customer/staff privilege restrictions | ✅ Hosted negative + positive access tests verified |
| No self-granted roles; RLS blocks cross-user access | ✅ Automated RLS tests |
| Migrations / hosted schema security | ✅ PROJI project only; repository migration reconciled to hardened helper design |
| No secrets committed; setup & rollback documented | ✅ |
| Preview deployment | ✅ Verified |

## Current infrastructure
- GitHub: `Rightmix/Proji`, PR #25, branch `stage-1/foundation`.
- Supabase: dedicated PROJI project only. Do not modify `rightmix` or `rightmix copy`.
- Vercel: dedicated `proji` project. PROJI Supabase public environment variables configured for Production, Preview and Development.

## Stage 1 gate
All planned Stage 1 implementation, automated CI, hosted authentication, route, role-denial and role-positive acceptance checks have passed. Temporary staff privileges used for acceptance testing were removed and the test account was re-verified as `customer` only.

Next action: complete final PR review, mark PR #25 ready, merge to `main`, verify the resulting production deployment, then close Stage 1 before authorizing Stage 2.
