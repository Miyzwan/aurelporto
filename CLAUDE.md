# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

This repo currently contains **specification documents only** — no application code, no `package.json`, not a git repo yet. The first implementation task (`FE-001`) scaffolds the Next.js app at the repo root (no `src/` directory — paths in the plan assume `app/`, `components/`, `lib/` at root).

Three documents drive everything:

| File | Role |
|---|---|
| `MASTER_IMPLEMENTATION_PLAN_INTERIOR_PORTFOLIO_SUPABASE.md` | **Source of truth for implementation.** Task IDs, DB schema, routes, env var names, repo structure, RLS matrix, verification commands. |
| `CLIENT_CONTEXT_GABRIELLE_AURELIA_INTERIOR_PORTFOLIO.md` | **Source of truth for facts and copy.** Verified client/project facts, positioning limits, known content gaps. |
| `PRD_Portfolio_Interior_Designer_Interactive.md` | Product/UX/motion spec — scroll choreography, layout, responsive/perf/a11y rules. |

**Precedence when they conflict:** master plan > client context > PRD. Two known conflicts:
- The PRD's §71 and §119 recommend **Sanity CMS / MDX**. That is superseded — content lives in **Supabase**.
- The PRD/master plan assume a commercial studio (e.g. `"Start a Project"` CTA, a Services page). The client is a **student, not a studio** — see "Content truth rules" below. Copy defaults in the plan's JSON examples are placeholders, not approved copy.

Changing a table name, enum, route, env var name, or section type requires **editing the master plan first**, then the code.

## Task-driven workflow

The plan decomposes work into task IDs: `FE-001`…`FE-018` (frontend), `BE-001`…`BE-014` (Supabase), `INT-001`…`INT-017` (integration), `DEP-001`…`DEP-009` (deploy). Each task lists its dependencies, exact files, acceptance criteria, verification commands, and commit message.

- Execute **one task ID at a time**; do not merge tasks or run ahead.
- Follow the dependency-ordered list in §13 (not category order — categories interleave). §10 gives the same order grouped into waves.
- If a dependency task is unfinished, stop and report it rather than improvising the missing piece.
- Use each task's stated `**Commit:**` line verbatim (`feat(frontend|backend|integration): …`, `chore(deploy): …`).
- Do not add dependencies a task does not list.

## Commands

These exist once `FE-001` is complete:

```bash
npm run dev
npm run lint
npm run typecheck
npm run test          # Vitest
npm run test:watch
npm run test:e2e      # Playwright
npm run build
npm run format:check
```

Database (Supabase CLI, from `BE-001`):

```bash
supabase start
supabase db reset     # replays supabase/migrations/ + seed.sql
supabase test db      # pgTAP RLS regression tests in supabase/tests/
```

Single test: `npx vitest run path/to/file.test.ts -t "name"` · `npx playwright test tests/e2e/foo.spec.ts -g "name"`.

Before any production deploy, all of `lint`, `typecheck`, `test`, `test:e2e`, `build`, and `supabase test db` must pass.

## Architecture

**One Next.js 16.3.3 App Router application** serves both the public portfolio and a protected `/admin` CMS. Supabase provides Postgres, Auth, and Storage; Vercel hosts. TypeScript strict, Tailwind, Server Components by default.

### Content flow

All public copy and media come from Supabase — never hardcode business content in JSX. Only static UI chrome (`Save`, `Delete`, `Published`) lives in source.

```
pages → page_sections (typed jsonb `content`, discriminated by section_type)
projects → project_sections (same pattern)
both → media_assets → Supabase Storage bucket `portfolio-public`
```

`page_sections.section_type` and `project_sections.section_type` are **closed sets** enumerated in plan §5 and §6. Do not invent new types. Each type has a canonical JSON shape validated by Zod in `lib/validation/`, and a renderer resolved through `lib/content/section-registry.ts` / `project-section-registry.ts`. Adding a section type means: plan → enum list → Zod schema → registry → renderer → admin editor.

### Supabase client boundaries (four distinct clients, `lib/supabase/`)

| File | Key | Use |
|---|---|---|
| `client.ts` | publishable | browser, `createBrowserClient` from `@supabase/ssr` |
| `server.ts` | publishable | server, cookie-bound user session, `createServerClient` |
| `public.ts` | publishable | server reads with no user session |
| `secret.ts` | `SUPABASE_SECRET_KEY` | first line is `import "server-only"` — only for the inquiry insert action |

Env contract (exact names): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL`.

### Security invariants

- RLS is the authorization layer, not an afterthought. Every `public` table has RLS enabled with explicit grants. Access matrix: plan §7.
- Admin CRUD goes through the **authenticated user's** client under RLS. Never use the secret key to bypass RLS for ordinary admin work.
- Verify server-side identity with `supabase.auth.getClaims()`, never `getSession()` alone. Authorize `/admin/**` server-side (`lib/auth/require-admin.ts`); hiding routes client-side is not security.
- Anonymous visitors read published rows only, and cannot read `profiles` or `inquiries`, nor insert inquiries directly — the public form posts through a validated server action using the secret client.
- No public `/signup` route; admin users are created manually. Never use `@supabase/auth-helpers-nextjs`.
- `portfolio-public` is a deliberately public bucket — never upload confidential plans, budgets, or client identities.
- Admin and auth routes are dynamic; never ISR them.

### Motion architecture

Ownership is split and must not overlap — **GSAP and Motion must never animate the same element's `transform`**.

- **Lenis** — smooth scroll and velocity source.
- **GSAP + ScrollTrigger** — scroll choreography, reveals, parallax, pinned plan sequences, before/after scrub, marquee.
- **Motion** — menu, filter state, hover, modals, pointer spring.
- **CSS** — masking, simple hover, typography, layout.

Public pages must remain fully usable with JS animation disabled, and must honor `prefers-reduced-motion`. Motion must not distort interior perspective — no large warps, tilts, or scale on renders. Per plan §30 of the client context: do not build advanced motion before static content and the CMS data flow work.

The three signature interactions to get right (PRD §120): hero space reveal, plan-to-space sequence, material-to-final-detail.

## Content truth rules

The client is **Gabrielle Aurelia Sulistya**, an Interior Design student at BINUS University. These rules are binding on copy, seed data, and any content an agent writes:

- **Never invent client or project facts.** If it is not in the client-context doc or confirmed by the user, mark it `NEEDS_CONFIRMATION` — do not infer it into public copy.
- Brand-named academic work (Starbucks, Netflix, Accor, Greenhost) must **not** be described as real client commissions.
- Do not call a render built, completed, or delivered. Do not position her as studio founder, principal, senior designer, or architect. No "award-winning", "leading", "expert".
- Do not hardcode age; use academic status instead.
- Unresolved inconsistencies documented in client-context §28 (internship status; Table-of-Contents vs. project-page naming) must be settled with the user before seeding the database.
- Copy may be improved for clarity; copy may not create new factual claims.
- Signature project is **Menavigasi Batavia** (hospitality). Categories: hospitality, office, retail, furniture.
