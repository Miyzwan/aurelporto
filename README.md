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

## Hosted Supabase environments

Use two separate hosted projects: `portfolio-staging` for Vercel Preview and
`portfolio-production` for Vercel Production. For an Indonesia-based audience,
`ap-southeast-1` (Singapore) is the recommended starting region when it is
available; choose the nearest supported region if the project requirements differ.

Authenticate the CLI with `supabase login` or a locally configured
`SUPABASE_ACCESS_TOKEN`. Keep database passwords in a password manager or local
shell variables; never paste them into this repository or commit them.
After creation, retrieve each project's current publishable and secret API keys
from the Supabase dashboard. Store them in the deployment secret manager using
the names in `.env.example`; the secret key is server-only and must never use a
`NEXT_PUBLIC_*` name.

Create each project under the intended Supabase organization, recording its project
ref after creation:

```bash
supabase projects create portfolio-staging \
  --org-id "$SUPABASE_ORG_ID" \
  --region ap-southeast-1 \
  --db-password "$STAGING_DB_PASSWORD"
supabase projects create portfolio-production \
  --org-id "$SUPABASE_ORG_ID" \
  --region ap-southeast-1 \
  --db-password "$PRODUCTION_DB_PASSWORD"
```

Link and migrate staging first. The seed is for staging only:

```bash
supabase link --project-ref "$STAGING_PROJECT_REF" --password "$STAGING_DB_PASSWORD"
supabase migration list --linked
supabase db push --linked --include-seed
supabase test db --linked
```

Link production separately and omit `--include-seed`; production must receive
migrations only until real, verified content is entered through the admin CMS:

```bash
supabase link --project-ref "$PRODUCTION_PROJECT_REF" --password "$PRODUCTION_DB_PASSWORD"
supabase migration list --linked
supabase db push --linked
```

After each migration, confirm the migration lists match the files in
`supabase/migrations/`. In the Supabase SQL Editor, verify the storage contract:

```sql
select id, public, file_size_limit
from storage.buckets
where id = 'portfolio-public';

select policyname, cmd, roles
from pg_policies
where schemaname = 'storage' and tablename = 'objects';
```

Run the following as the `anon` role inside a transaction on staging; the seeded
published pages should be visible, the seeded draft project should remain hidden,
and the privilege check should be false:

```sql
begin;
set local role anon;
select slug from public.pages where status = 'published' order by slug;
select slug from public.projects where slug = 'development-sample-project';
select has_table_privilege('anon', 'public.inquiries', 'insert');
rollback;
```

Repeat the no-sample-content check on production before connecting Vercel. Do not
run `supabase db push --include-seed` against production.

### Run hosted migrations from GitHub

The same setup can run without database credentials on a developer laptop. In
GitHub, create two Environments named `staging` and `production`. Add these to
each Environment:

- Secret `SUPABASE_ACCESS_TOKEN`: a Supabase personal access token.
- Secret `SUPABASE_DB_PASSWORD`: that environment's database password.
- Variable `SUPABASE_PROJECT_REF`: the environment's project ref (staging is
  `wbxfcritqkcjrkblndnc`).

Run `Staging Database` from the Actions tab. Enable `include_seed` only for the
first run against an empty staging database; later runs should leave it disabled.
The workflow links the project, applies migrations, and runs the hosted RLS
regression tests. Run `Production Database` only after reviewing the migration
list; it never includes `seed.sql`. Protect the `production` Environment with
required reviewers before using it.

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
