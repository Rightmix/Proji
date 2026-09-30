# PROJI — Decision Log

Decisions may be **Confirmed**, **Proposed**, **Under review** or **Superseded**. Do not treat a proposed technology as deployed.

| ID | Date | Decision | Status | Rationale / consequence |
|---|---|---|---|---|
| D-001 | 2026-09-27 | PROJI is a customizable Indian congee/protein bowl platform initially targeting Calicut | Confirmed concept | Guides MVP and pilot |
| D-002 | 2026-09-27 | Four-step base → protein → flavor → toppings builder | Confirmed product direction | Requires validated compatibility, price and nutrition logic |
| D-003 | 2026-09-27 | Mobile-first PWA using React, TypeScript, Vite and Tailwind | Proposed architecture | Faster initial delivery; native app deferred |
| D-004 | 2026-09-27 | Supabase/PostgreSQL/Auth, Vercel and GitHub | Proposed architecture | Requires setup and security verification |
| D-005 | 2026-09-27 | Customer, admin/R&D and kitchen route areas sharing one backend | Proposed architecture | Centralizes order and recipe data with strict role permissions |
| D-006 | 2026-09-27 | Three signature bowls and limited Calicut pilot | Proposed pilot | Validate operational capacity and demand before expansion |
| D-007 | 2026-09-27 | Defer subscriptions and personalized nutrition beyond initial ordering MVP | Proposed sequencing | Reduce early complexity and clinical-claim risk |

Record alternatives, impact and approval before major architectural changes.

| D-008 | 2026-09-27 | Stage 4 visual assets use hybrid food photography and AI-assisted asset production, manually aligned and approved | Confirmed planning direction | Consistent realistic bowl layers and distinct animations for all 15 ingredients |
| D-009 | 2026-09-27 | Mobile bowl preview remains fixed near top while ingredient options scroll beneath | Confirmed planning direction | Responsive sticky layout with short-screen and safe-area fallbacks |
| D-010 | 2026-09-27 | First Stage 4 milestone includes all ingredient animations with explicitly illustrative nutrition and pricing | Confirmed planning scope | Validated recipe integration and live orders deferred; no code authorized yet |
| D-011 | 2026-09-27 | Approved four-screen mockup is master design reference | Confirmed requirement; reference asset pending | Obtain actual mockup before implementation; no generic-form substitution |
| D-012 | 2026-09-30 | Extend the brand palette with warm-grey surfaces, natural-green selection (#599A3D) and deep-green actions (#2E6B34); lime #70C043 kept as an accent only (fails text contrast) | Proposed | Matches the four-screen reference and passes WCAG AA; needs owner approval |
| D-013 | 2026-09-30 | Inter (UI) + Fraunces (display headings), self-hosted with @fontsource | Proposed | No third-party font requests; the serif echoes the brand reference |
