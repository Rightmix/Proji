# Stage 2 Report: Branding and Design System

**Date:** 2026-09-30. **Branch:** `stage-2/design-system`. **Status:** implemented and tested locally; needs review, a hosted preview and real-device checks.
Acceptance tests were defined before coding in [docs/stages/STAGE_02_ACCEPTANCE_TESTS.md](docs/stages/STAGE_02_ACCEPTANCE_TESTS.md).

## Implemented
- Design tokens (TypeScript source + Tailwind v4 `@theme`, drift-tested), self-hosted Inter and Fraunces, and a type scale, radius, shadows and a surface hierarchy.
- Focus-visible ring, skip link, and a global `prefers-reduced-motion` override.
- Safe-area utilities.
- Reusable UI primitives: see [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).
- Responsive sticky header with desktop nav and an accessible mobile menu (closes on Escape and on route change); footer; restyled staff header.
- New homepage (hero, how it works, why PROJI, pilot band). It shows no nutrition figures, prices or health claims.
- Asset registry and `public/assets` structure, a provisional favicon, and a restyled login screen and placeholders.
- `/build` shows only an empty `BowlSurface` preview; there is no builder logic.

## Test evidence (local sandbox, 2026-09-30)
| Check | Result |
|---|---|
| `npm run lint` | Pass: 0 errors, 0 warnings |
| `npm run format:check` | Pass |
| `npm run build` (`tsc -b` + Vite) | Pass: JS 329 kB / 104 kB gzip, CSS 29 kB / 6.6 kB gzip |
| `npm test` (Vitest) | **76/76 pass**: 18 Stage 1 regression + 37 token contrast/drift + 21 component/nav/home |
| `npm run test:e2e` (Playwright, Pixel 7 + Desktop Chrome) | **60/60 pass**: Stage 1 routes/redirects/bundle scan; overflow at 320–1280 px; sticky header; mobile menu; skip link; focus ring; reduced motion (on and off); self-hosted fonts; hero image; axe-core WCAG 2.2 AA with 0 serious/critical violations on 6 routes plus the open mobile menu |
| RLS (`npm run test:rls`) | Not re-run: Supabase files are unchanged (R-02) |
| Manual screenshots | Mobile 390 px and desktop 1280 px reviewed for home, /build, /login and the open mobile menu |

**Test changes to Stage 1 suites:** the homepage h1 expectation changed from "PROJI" to "Build Your Bowl. Build Your Body." because the homepage was redesigned. No other assertions changed.

## Pending
- Hosted Vercel preview and CI run on the PR.
- Real-device iOS/Android safe-area check (M-02).
- Owner review against the four-screen reference (M-01).
