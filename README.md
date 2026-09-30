# PROJI

Build Your Bowl. Build Your Body.

PROJI is a planned mobile-first customizable Indian congee and protein bowl platform, initially targeting Calicut, Kerala. Project documentation and the 12-stage roadmap live in this repository ([roadmap](PROJECT_ROADMAP.md), [requirements](PROJECT_REQUIREMENTS.md), [decisions](DECISIONS.md)).

**Stage 1: Project Foundation — in progress.** See [STAGE_1_REPORT.md](STAGE_1_REPORT.md) for verified evidence and open items.

> **Isolation rule:** PROJI must never use RightMix's Supabase, Vercel, storage, keys or data. Verify the project ref/name before every migration or deployment.

## Stack
React 19 + TypeScript + Vite, Tailwind CSS v4, React Router, Supabase (Auth + Postgres + RLS), Vitest + React Testing Library, Playwright, ESLint + Prettier, GitHub Actions, Vercel. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Local setup
```bash
npm ci
cp .env.example .env.local   # fill with the PROJI project's URL + publishable key only
npm run dev                  # http://localhost:5173
```
Without Supabase env vars the app still runs; sign-in is disabled and protected routes redirect to `/login`.

## Scripts
| Command | Purpose |
|---|---|
| `npm run lint` / `format:check` / `typecheck` | Static checks |
| `npm test` | Unit/component tests (Vitest) |
| `npm run test:e2e` | Playwright on mobile + desktop (builds and serves `dist`). Set `E2E_BASE_URL` to test a preview deployment. |
| `npm run test:rls` | Applies migrations to a throwaway local Postgres (needs PostgreSQL server binaries, run as non-root) and runs RLS tests |
| `npm run build` | Production build |

## Database migrations
Migrations live in `supabase/migrations`. Apply only to the verified PROJI project:
```bash
npx supabase login
npx supabase link --project-ref <PROJI_PROJECT_REF>   # confirm the name is PROJI, not rightmix
npx supabase db push --dry-run                          # review
npx supabase db push
```
**Bootstrap the first admin** (SQL editor, as project owner — not possible from the app by design):
```sql
insert into public.user_roles (user_id, role) select id, 'admin' from auth.users where email = '<owner email>';
```

## Rollback
- **App:** in Vercel, promote the previous successful deployment ("Instant Rollback"), or `git revert` the merge commit and redeploy.
- **Database:** write a forward migration that reverses the change. Emergency manual scripts are in `supabase/rollback/` and are destructive — take a backup and get approval first; never run against production without confirmation.

## Security notes
Only the publishable (anon) key is used in the browser; the `service_role` key must never appear in `VITE_*` variables (an E2E test scans the bundle). Route guards are UX only — Postgres RLS is the enforcement layer.
