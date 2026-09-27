# Stage 01 — Project Foundation

**Status:** In progress. **Estimate:** 1–2 days, provisional.

## Objective
Establish a deployable, tested, secure technical foundation; do not implement the full menu or checkout yet.

## Scope
Inspect existing repo. Initialize React + TypeScript + Vite, Tailwind, React Router; shared layouts and routes /, /menu, /build, /login, /account, /admin, /kitchen, /unauthorized and 404. Configure Supabase Auth and PostgreSQL migrations for profiles and user_roles (customer, admin, rd, kitchen), defaulting to customer. Enforce RLS, prevent self-elevation and restrict privileged routes and backend mutations. Set up Vitest, React Testing Library, Playwright, ESLint, Prettier, environment example, GitHub workflow, Vercel preview and README setup/migration/rollback guidance. Keep privileged credentials out of frontend bundles.

## Acceptance criteria
- Local app and production build work.
- All placeholder routes render and direct navigation works on preview deployment.
- Authentication is verified against configured Supabase project.
- Customer cannot access privileged data or routes; kitchen cannot use admin-only capabilities.
- New users cannot grant themselves privileged roles; RLS blocks cross-user profile access.
- Migrations apply to clean database; lint, unit, E2E and RLS tests pass.
- No secrets committed; setup and rollback documented.
- Actual test output and deployment URL recorded in STAGE_1_REPORT.md.

**Verified so far:** Repository creation only. All other items pending evidence.
