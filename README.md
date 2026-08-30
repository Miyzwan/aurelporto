# Aurelia Interior Portfolio

Next.js App Router portfolio with a protected admin CMS backed by Supabase. Public content is read from published Supabase rows; local seed data is for development only.

## Prerequisites

- Node.js 20.9 or newer and npm.
- Docker Desktop for the local Supabase stack.
- Supabase CLI.

## Local setup

```bash
git clone git@github.com:Miyzwan/aurelporto.git
cd aurelporto
npm ci
cp .env.example .env.local
supabase start
supabase status -o env
```

Fill `.env.local` with the local API URL and publishable key reported by `supabase status`. Keep `SUPABASE_SECRET_KEY` server-only and never commit `.env.local` or credentials.

Reset the local database, apply every migration, and load the development seed with:

```bash
supabase db reset
npm run db:types
npm run dev
```

The site runs at `http://localhost:3000`. The local Supabase Studio runs at `http://localhost:54323`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run format:check
npm run build
```

Run `npm run test:e2e` when local Supabase is configured and Playwright browsers are installed with `npx playwright install`. The manual `Staging Integration` workflow runs the same smoke tests against staging using GitHub Environment `staging` secrets.

## Contribution workflow

Keep `main` deployable. Use feature branches named `feature/<task-id>-<short-name>` (for example, `feature/DEP-001-ci-gate`) and concise Conventional Commit messages such as `ci: add quality gate for portfolio application`. Pull requests should describe the task, validation performed, and any schema, environment, or content-safety impact.
