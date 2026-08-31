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

## Hosted Supabase environment

The portfolio runs against a single hosted Supabase project,
`portfolio-production` (ref `gnhhfysekpszoopqdlyo`), in `ap-southeast-1`
(Singapore) for the Indonesia-based audience. Local development uses the local
Supabase stack seeded with `supabase/seed.sql`; the hosted project never
receives seed data.

Authenticate the CLI with `supabase login` or a locally configured
`SUPABASE_ACCESS_TOKEN`. Keep the database password in a password manager or
local shell variables; never paste it into this repository or commit it.
After creation, retrieve the project's publishable and secret API keys from
the Supabase dashboard and store them in the deployment secret manager using
the names in `.env.example`; the secret key is server-only and must never use
a `NEXT_PUBLIC_*` name.

Link and migrate the hosted project:

```bash
supabase link --project-ref gnhhfysekpszoopqdlyo
supabase migration list --linked
supabase db push --linked
```

Never run `supabase db push --include-seed` against the hosted project:
`supabase/seed.sql` contains development sample content, and production must
receive migrations only until real, verified content is entered through the
admin CMS.

After each migration, confirm the migration list matches the files in
`supabase/migrations/`. In the Supabase SQL Editor, verify the storage contract:

```sql
select id, public, file_size_limit
from storage.buckets
where id = 'portfolio-public';

select policyname, cmd, roles
from pg_policies
where schemaname = 'storage' and tablename = 'objects';
```

Verify the anonymous access boundary as the `anon` role inside a transaction;
published pages must be readable (an empty result is expected until real
content is entered) and the inquiry insert privilege must be false:

```sql
begin;
set local role anon;
select slug from public.pages where status = 'published' order by slug;
select has_table_privilege('anon', 'public.inquiries', 'insert');
rollback;
```

The same boundary is observable over the Data API: `GET
/rest/v1/pages?select=slug&status=eq.published` with the publishable key
returns `200 []` until content exists, and `POST /rest/v1/inquiries` with only
the publishable key must return 401.

### Run hosted migrations from GitHub

Migrations can be applied without database credentials on a developer laptop.
In GitHub, create an Environment named `production` and protect it with
required reviewers before using it. Add:

- Secret `SUPABASE_ACCESS_TOKEN`: a Supabase personal access token.
- Secret `SUPABASE_DB_PASSWORD`: the production database password.
- Variable `SUPABASE_PROJECT_REF`: `gnhhfysekpszoopqdlyo`.

Run `Production Database` from the Actions tab only after reviewing the
migration list; it links the project, applies migrations, and never includes
`seed.sql`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run format:check
npm run build
```

Run `npm run test:e2e` when local Supabase is configured and Playwright browsers are installed with `npx playwright install`. The manual `Integration` workflow runs the same smoke tests using GitHub Environment `production` secrets.

## Contribution workflow

Keep `main` deployable. Use feature branches named `feature/<task-id>-<short-name>` (for example, `feature/DEP-001-ci-gate`) and concise Conventional Commit messages such as `ci: add quality gate for portfolio application`. Pull requests should describe the task, validation performed, and any schema, environment, or content-safety impact.
