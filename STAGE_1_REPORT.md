# Stage 1 Report — Project Foundation

**Date:** 2026-09-30 · **Branch:** `stage-1/foundation` · **Status:** Implementation and GitHub CI verified; hosted preview/auth acceptance still in progress.

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

## Acceptance criteria
| Criterion | Status |
|---|---|
| Local app and production build work | ✅ Verified |
| GitHub CI (checks + RLS + E2E) | ✅ Verified |
| Placeholder routes + direct navigation on preview deployment | ⏳ Stage 1 preview deployment pending |
| Auth verified against configured PROJI Supabase project | ⏳ Pending hosted browser verification |
| Customer/kitchen privilege restrictions | ✅ Automated tests; ⏳ final hosted verification |
| No self-granted roles; RLS blocks cross-user access | ✅ Automated RLS tests |
| Migrations / hosted schema security | ✅ PROJI project only; repository migration reconciled to hardened helper design |
| No secrets committed; setup & rollback documented | ✅ |
| Deployment URL recorded | ⏳ Preview URL pending |

## Current infrastructure
- GitHub: `Rightmix/Proji`, PR #25, branch `stage-1/foundation`.
- Supabase: dedicated PROJI project only. Do not modify `rightmix` or `rightmix copy`.
- Vercel: dedicated `proji` project. PROJI Supabase public environment variables configured for Production, Preview and Development.

## Remaining Stage 1 gate
1. Trigger and verify a Vercel preview for `stage-1/foundation`.
2. Verify direct SPA navigation and login against the real PROJI Supabase project.
3. Verify customer denial and authorized staff behavior for `/admin` and `/kitchen` on the hosted preview.
4. Record preview evidence, complete PR review, then merge only after all acceptance checks pass.
