# Stage 02 — Acceptance tests (defined before implementation, 2026-09-30)

Each item maps to an automated test unless marked **manual**. Results are recorded in `STAGE_2_REPORT.md`.

## Tokens and visual foundations
| ID | Test | Where |
|---|---|---|
| T-01 | Token contrast: body/muted text on white and warm-grey surfaces ≥ 4.5:1; white on deep-green action ≥ 4.5:1; deep-green text on selected surface ≥ 4.5:1; focus ring vs. surfaces ≥ 3:1 | `src/design/tokens.test.ts` |
| T-02 | CSS `@theme` values equal the TypeScript token source (no drift) | `src/design/tokens.test.ts` |
| T-03 | Fonts are self-hosted (no third-party font/CDN requests at runtime) | `e2e/design.spec.ts` |

## Components (reusable by Stage 3/4)
| ID | Test | Where |
|---|---|---|
| C-01 | Button/ButtonLink: variants render, disabled is not activatable, link navigates, min 44px touch height | `src/components/ui/ui.test.tsx` |
| C-02 | SelectableCard single-select (radio) and multi-select (checkbox) semantics: `aria-checked`, click + Space/Enter toggle, disabled blocks selection | `src/components/ui/ui.test.tsx` |
| C-03 | SelectableGroup enforces a max selection count without disabling already-selected items | `src/components/ui/ui.test.tsx` |
| C-04 | StatTile exposes value+label as one readable unit; highlight state is not colour-only (has text/aria) | `src/components/ui/ui.test.tsx` |
| C-05 | ResponsiveImage requires alt + intrinsic size, lazy-loads non-priority images, shows fallback on error | `src/components/ui/ui.test.tsx` |
| C-06 | Asset registry: every entry has alt text, dimensions, a status, and the file exists under `public/` | `src/lib/assets.test.ts` |

## Navigation and layout
| ID | Test | Where |
|---|---|---|
| N-01 | Mobile menu button toggles `aria-expanded`, panel closes on navigation and on Escape | `src/components/nav.test.tsx` |
| N-02 | Signed-out shows Sign in; signed-in shows Account + Sign out (Stage 1 behaviour preserved) | `src/components/nav.test.tsx` |
| N-03 | Header remains visible (sticky) after scrolling on mobile | `e2e/design.spec.ts` |
| N-04 | No horizontal overflow at 320, 360, 390, 768 and 1280 px on public routes | `e2e/design.spec.ts` |
| N-05 | Skip link moves focus to main content | `e2e/design.spec.ts` |

## Homepage
| ID | Test | Where |
|---|---|---|
| H-01 | One h1; primary CTA → /build, secondary → /menu | `src/pages/Home.test.tsx` |
| H-02 | No nutrition figures, prices or therapeutic/health claims on the homepage | `src/pages/Home.test.tsx` |
| H-03 | Hero image has alt text, explicit dimensions and is not lazy (LCP) | `src/pages/Home.test.tsx` |

## Accessibility and motion
| ID | Test | Where |
|---|---|---|
| A-01 | axe-core: zero serious/critical violations on /, /menu, /build, /login, /unauthorized, 404 (mobile + desktop) | `e2e/a11y.spec.ts` |
| A-02 | Keyboard focus is visibly indicated (non-none outline) on links and buttons | `e2e/design.spec.ts` |
| A-03 | `prefers-reduced-motion: reduce` collapses transitions/animations to ≈0 | `e2e/design.spec.ts` |

## Regression (Stage 1)
| ID | Test | Where |
|---|---|---|
| R-01 | All Stage 1 unit tests, route-guard tests and E2E route/redirect/bundle tests pass unchanged in intent | existing suites |
| R-02 | Supabase auth/RLS files untouched | `git diff --stat main` |

## Manual
- M-01 Visual review against the four-screen reference (tokens only; builder not implemented).
- M-02 Real-device check on iOS Safari (notch/home indicator) and mid-range Android — pending hosted preview.
