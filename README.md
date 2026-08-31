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

### Admin access

Public signup is disabled on the hosted project, so the only auth users are
the ones created deliberately. Admin access is a single Auth user plus a
matching `profiles` row, created manually:

1. Create the Auth user from the Supabase dashboard (Authentication → Users)
   or the Auth admin API with a confirmed email and a strong password from a
   password manager. The email does not need to be a deliverable inbox, but it
   must never be an address owned by someone else.
2. Insert the profile in the SQL Editor:

```sql
insert into public.profiles (id, role, display_name)
values ('<auth-user-uuid>', 'admin', 'Portfolio Admin');
```

The `profiles` table only accepts the `admin` role, no signup trigger
auto-creates profiles, and `public.is_admin()` gates every admin mutation
through RLS. A signed-in user without a matching admin profile is rejected by
`requireAdmin()` with a 404.

Rotate the admin password through the Auth admin API (`PUT
/auth/v1/admin/users/{id}` with `{"password": "..."}` using the secret key) or
by deleting and recreating the user with a fresh profile row. Never commit a
password or add one to `supabase/seed.sql`.

## Vercel deployment

The application is hosted on Vercel as a single project imported from
`github.com/Miyzwan/aurelporto`. `vercel.json` pins the framework preset to
`nextjs` and the function region to `sin1` (Singapore) so server rendering sits
next to the Supabase project in `ap-southeast-1`. Everything else is left to
Vercel's Next.js auto-detection: build command `npm run build`, the repository
root as the root directory (there is no `src/`), and `main` as the production
branch.

Add the environment variables below **before** the first build. The build fails
without `NEXT_PUBLIC_SUPABASE_URL` because `next.config.ts` derives the remote
image host from it.

### Environment variables

Four variables, no more. The names are fixed by the master plan and identical in
every environment; only the values differ.

| Variable | Production | Preview | Development |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | hosted project URL | same hosted project | not set in Vercel |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | hosted publishable key | same hosted key | not set in Vercel |
| `SUPABASE_SECRET_KEY` | hosted secret key, marked Sensitive | same hosted key, marked Sensitive | not set in Vercel |
| `NEXT_PUBLIC_SITE_URL` | canonical production origin | QA branch alias URL | not set in Vercel |

Until DEP-006 assigns a custom domain, the production `NEXT_PUBLIC_SITE_URL` is
the project's `*.vercel.app` production URL; the canonical domain itself is
still `NEEDS_CONFIRMATION`. Preview URLs are per-deployment, so a single Preview
value cannot match every branch — set it to the branch alias of the branch used
for QA and accept that other previews carry that origin in their metadata.
Previews are not indexed, so this is cosmetic.

Vercel's Development environment is deliberately left empty. Local development
reads `.env.local` and points at the local Supabase stack, so `vercel env pull`
must never be the way hosted credentials reach a laptop.

### No staging environment

The master plan assumes a hosted `portfolio-staging` project behind Vercel
Preview. Supabase resource limits allow only one hosted project, so Preview and
Production both read and write the single `portfolio-production` database. This
is a deliberate deviation with real consequences, mitigated as follows:

- Preview deployments are gated by Vercel Deployment Protection (Vercel
  Authentication) so only team members can reach a preview that serves live
  data.
- `app/robots.ts` returns a blanket `disallow: /` whenever `VERCEL_ENV` is not
  `production`, so a preview is never indexed as a duplicate host.
- Preview QA (DEP-005) writes to production. Any draft, media upload, or test
  inquiry created during QA must be deleted afterwards, because DEP-002 requires
  production to hold no sample content.
- Schema changes still go through the `Production Database` workflow with
  required reviewers; previews never migrate the database.

### Secret handling

`SUPABASE_SECRET_KEY` is server-only and exists solely for the validated public
inquiry insert in `lib/supabase/secret.ts`. It must never be renamed to a
`NEXT_PUBLIC_*` variable, read from a client component, or committed. Prove the
boundary against real build output:

```bash
npm run build
npm run verify:client-bundle
```

The script scans everything under `.next/static`, source maps included, and
fails on the configured key value or on any `sb_secret_` / `service_role` /
`SUPABASE_SECRET_KEY` marker. CI runs it after every build.

Vercel applies environment variables to new deployments only, and `NEXT_PUBLIC_*`
values are inlined at build time, so **redeploy after changing any variable** —
editing a value in the dashboard does not affect the running deployment.

Confirm the environment split from outside once a deployment exists:

```bash
curl -s https://<production-host>/robots.txt   # Allow: / plus the admin disallows
curl -s https://<preview-host>/robots.txt      # Disallow: /
```

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
