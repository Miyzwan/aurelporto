# Interior Designer Portfolio + Supabase Admin CMS — Master Implementation Plan

> **For GPT Luna / agentic coding workers:** execute exactly one task ID at a time. Do not combine tasks unless the task explicitly says so. Every task must end with verification commands and a concise report of changed files, test results, and remaining blockers.

**Goal:** Build an interactive interior designer portfolio from zero through production deployment, using Next.js for the public site and admin panel, Supabase for Auth/Postgres/Storage, and Vercel for hosting.

**Architecture:** One Next.js App Router application serves both the public portfolio and a protected `/admin` CMS. Public content is read from Supabase and only published records are visible. Admin mutations use authenticated Supabase sessions protected by RLS; the Supabase secret key is reserved for tightly controlled server-only operations such as public inquiry insertion.

**Tech Stack:** Next.js 16.3.3, React, TypeScript, Tailwind CSS, Supabase Postgres/Auth/Storage, `@supabase/ssr`, `@supabase/supabase-js`, GSAP + ScrollTrigger, Motion, Lenis, Zod, React Hook Form, dnd-kit, Vitest, React Testing Library, Playwright, Vercel.

**Spec:** `/mnt/data/PRD_Portfolio_Interior_Designer_Interactive.md`

---

# 1. NON-NEGOTIABLE GLOBAL CONSTRAINTS

1. Use Next.js App Router. Do not introduce Pages Router.
2. Pin `next` to `16.3.3` or a later patched 16.x Active-LTS release only after confirming the patch is security-safe.
3. Use TypeScript strict mode.
4. Use Tailwind CSS for styling; do not mix a second global CSS framework.
5. Use Server Components by default. Add `"use client"` only where interaction requires it.
6. Use `@supabase/ssr` for cookie-based Supabase authentication.
7. Use `supabase.auth.getClaims()` for server-side identity verification; do not authorize based only on `getSession()`.
8. Use current Supabase publishable keys for browser/user-scoped operations:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
9. If a secret Supabase key is required, use:
   - `SUPABASE_SECRET_KEY`
   It must only be imported from a `server-only` module. Never expose it through `NEXT_PUBLIC_*`.
10. Do not use legacy `@supabase/auth-helpers-nextjs`.
11. Disable public user registration for the production portfolio. Admin users are created manually.
12. Every exposed `public` table must have RLS enabled and explicit grants/policies.
13. Anonymous visitors may read only published public content.
14. Anonymous visitors may not read admin profiles or inquiries.
15. Anonymous visitors may not directly insert inquiries through the Supabase Data API. The public inquiry form must submit through a validated server action.
16. Admin CRUD uses the authenticated user's Supabase client and RLS. Do not use the Supabase secret key to bypass RLS for normal admin CRUD.
17. `/admin/**` is authenticated and authorized server-side. Client-side route hiding is not security.
18. Admin/auth routes must not use ISR. Treat authenticated routes as dynamic.
19. All public-facing editable copy must come from Supabase. Do not hardcode business content in JSX.
20. Static UI labels such as `"Save"`, `"Delete"`, `"Cancel"`, `"Published"` may remain in source code.
21. Store portfolio media in Supabase Storage bucket `portfolio-public`.
22. `portfolio-public` is deliberately public for delivery performance. Never upload confidential plans, budgets, client identities, or unreleased confidential assets.
23. Only authenticated admins can upload, update, archive, or delete portfolio media.
24. Use `next/image` for images and a dedicated video component for video.
25. Public portfolio pages must remain usable with JavaScript animation disabled.
26. Respect `prefers-reduced-motion`.
27. GSAP and Motion must not mutate the same DOM element's `transform`.
28. Run lint, typecheck, unit tests, E2E tests, and production build before production deployment.
29. Do not change database table names, enum names, route names, environment variable names, or section type names defined in this document without updating this document first.
30. Never commit `.env.local`, secret keys, generated Supabase tokens, or database passwords.

---

# 2. EXECUTION PROTOCOL FOR GPT LUNA

For every task:

1. Read this master plan and the latest repository state.
2. Work on **only the requested task ID**.
3. Inspect existing files before creating duplicate utilities/components.
4. Preserve interfaces created by completed tasks.
5. If a dependency task is incomplete, stop and report the missing dependency instead of improvising.
6. Write/adjust tests for the task.
7. Run the exact verification commands listed in the task.
8. Fix all failures caused by the task.
9. Do not silently suppress TypeScript, ESLint, database, or test errors.
10. Do not use `any` to avoid typing work unless a third-party boundary has no usable type and the use is documented.
11. Do not add new dependencies unless the task explicitly allows them.
12. At the end report:
    - task ID;
    - files created;
    - files modified;
    - commands executed;
    - test/build results;
    - any blocker;
    - recommended commit message.

Preferred commit style:

```text
feat(frontend): ...
feat(backend): ...
feat(integration): ...
test: ...
chore(deploy): ...
```

---

# 3. SOURCE-OF-TRUTH ROUTES

Public:

```text
/
 /projects
 /projects/[slug]
 /services
 /process
 /about
 /explorations
 /contact
```

Authentication:

```text
/auth/login
/auth/signout
```

Admin:

```text
/admin
/admin/site
/admin/navigation
/admin/pages
/admin/pages/[slug]
/admin/projects
/admin/projects/new
/admin/projects/[id]
/admin/services
/admin/process
/admin/explorations
/admin/testimonials
/admin/media
/admin/inquiries
/admin/inquiries/[id]
/admin/preview/projects/[id]
```

Do not create a public `/signup` route.

---

# 4. SOURCE-OF-TRUTH DATABASE CONTRACT

## 4.1 Enums

```text
content_status:
- draft
- published
- archived

project_status:
- concept
- ongoing
- completed

inquiry_status:
- new
- contacted
- qualified
- won
- lost
- spam
```

## 4.2 Tables

### `profiles`

```text
id uuid primary key references auth.users(id) on delete cascade
role text not null check role in ('admin')
display_name text
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### `site_settings`

Singleton row; `id = 1`.

```text
id smallint primary key check (id = 1)
site_name text not null
professional_role text not null
location text
service_area text
email text
phone text
whatsapp text
social_links jsonb not null default '[]'
footer_text text
default_seo_title text not null
default_seo_description text not null
default_og_media_id uuid null
inquiry_config jsonb not null default '{}'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

`inquiry_config` canonical shape:

```json
{
  "projectTypes": ["Residential", "Apartment", "Villa", "Office", "Retail", "F&B", "Hospitality", "Other"],
  "projectStatuses": ["New Build", "Renovation", "Furnishing Only", "Still Exploring"],
  "timelineOptions": ["Immediately", "1–3 Months", "3–6 Months", "6+ Months", "Flexible"],
  "budgetOptions": [],
  "showBudgetField": false,
  "showPhoneField": true,
  "successTitle": "Thank you",
  "successBody": "Your project inquiry has been received."
}
```

### `navigation_items`

```text
id uuid primary key default gen_random_uuid()
label text not null
href text not null
placement text not null check placement in ('header','footer','social')
sort_order integer not null default 0
is_visible boolean not null default true
target_blank boolean not null default false
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### `pages`

Canonical slugs: `home`, `projects`, `services`, `process`, `about`, `explorations`, `contact`.

```text
id uuid primary key default gen_random_uuid()
slug text not null unique
title text not null
nav_label text
seo_title text
seo_description text
og_media_id uuid null
status content_status not null default 'draft'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### `page_sections`

```text
id uuid primary key default gen_random_uuid()
page_id uuid not null references pages(id) on delete cascade
section_key text not null
section_type text not null
content jsonb not null default '{}'
settings jsonb not null default '{}'
sort_order integer not null default 0
is_enabled boolean not null default true
status content_status not null default 'draft'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
unique(page_id, section_key)
```

### `media_assets`

```text
id uuid primary key default gen_random_uuid()
bucket text not null default 'portfolio-public'
storage_path text not null unique
media_type text not null check media_type in ('image','video')
alt_text text not null
caption text
photographer text
width integer
height integer
poster_path text
mime_type text not null
file_size_bytes bigint
is_archived boolean not null default false
created_by uuid references auth.users(id)
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### `projects`

```text
id uuid primary key default gen_random_uuid()
slug text not null unique
title text not null
year integer not null
location text not null
project_type text not null
area_sqm numeric
project_status project_status not null
client_type text
design_role text[] not null default '{}'
services text[] not null default '{}'
summary text not null
hero_media_id uuid references media_assets(id)
featured boolean not null default false
featured_order integer not null default 0
sort_order integer not null default 0
seo_title text
seo_description text
og_media_id uuid references media_assets(id)
status content_status not null default 'draft'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### `project_sections`

```text
id uuid primary key default gen_random_uuid()
project_id uuid not null references projects(id) on delete cascade
section_key text not null
section_type text not null
title text
content jsonb not null default '{}'
sort_order integer not null default 0
is_enabled boolean not null default true
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
unique(project_id, section_key)
```

### `services`

```text
id uuid primary key default gen_random_uuid()
slug text not null unique
name text not null
short_description text not null
full_description text
ideal_client text
scope text[] not null default '{}'
deliverables text[] not null default '{}'
included text[] not null default '{}'
excluded text[] not null default '{}'
typical_project_types text[] not null default '{}'
media_id uuid references media_assets(id)
sort_order integer not null default 0
featured boolean not null default false
status content_status not null default 'draft'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### `process_steps`

```text
id uuid primary key default gen_random_uuid()
step_no integer not null
title text not null
description text not null
media_id uuid references media_assets(id)
sort_order integer not null default 0
status content_status not null default 'draft'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### `explorations`

```text
id uuid primary key default gen_random_uuid()
slug text not null unique
title text not null
category text not null
description text
year integer
cover_media_id uuid references media_assets(id)
sort_order integer not null default 0
status content_status not null default 'draft'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### `exploration_media`

```text
id uuid primary key default gen_random_uuid()
exploration_id uuid not null references explorations(id) on delete cascade
media_id uuid not null references media_assets(id)
caption text
sort_order integer not null default 0
created_at timestamptz not null default now()
unique(exploration_id, media_id)
```

### `testimonials`

```text
id uuid primary key default gen_random_uuid()
client_name text not null
client_role text
project_name text
quote text not null
sort_order integer not null default 0
featured boolean not null default false
status content_status not null default 'draft'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### `inquiries`

```text
id uuid primary key default gen_random_uuid()
name text not null
email text not null
phone text
project_type text not null
project_location text not null
area_sqm numeric
required_service text not null
project_status text not null
desired_timeline text not null
budget_range text
project_brief text not null
referral_source text
status inquiry_status not null default 'new'
admin_notes text
submitted_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

---

# 5. PAGE SECTION TYPE CONTRACT

Do not invent additional section types during implementation.

## Public page section types

```text
home_hero
positioning
featured_projects
philosophy
services_preview
process_preview
material_moment
credibility
cta
rich_text
gallery
```

Canonical JSON shapes are validated in `lib/validation/page-sections.ts`.

### `home_hero`

```json
{
  "eyebrow": "Interior Designer",
  "headline": "Spaces shaped around how people live.",
  "subheadline": "",
  "location": "",
  "heroMediaId": "uuid",
  "signatureProjectId": "uuid",
  "primaryCtaLabel": "View Projects",
  "primaryCtaHref": "/projects",
  "secondaryCtaLabel": "Start a Project",
  "secondaryCtaHref": "/contact"
}
```

### `positioning`

```json
{
  "eyebrow": "",
  "lines": ["WE DESIGN INTERIORS", "AROUND THE WAY PEOPLE", "LIVE, MOVE, AND FEEL."],
  "body": ""
}
```

### `featured_projects`

```json
{
  "title": "Selected Projects",
  "intro": "",
  "maxItems": 5
}
```

### `philosophy`

```json
{
  "title": "Design Philosophy",
  "intro": "",
  "items": [
    {"title": "Form", "body": ""},
    {"title": "Function", "body": ""},
    {"title": "Material", "body": ""},
    {"title": "Light", "body": ""}
  ]
}
```

### `services_preview`

```json
{
  "title": "Services",
  "intro": "",
  "maxItems": 6
}
```

### `process_preview`

```json
{
  "title": "Process",
  "intro": "",
  "maxItems": 10
}
```

### `material_moment`

```json
{
  "title": "Material Matters",
  "intro": "",
  "mediaIds": []
}
```

### `credibility`

```json
{
  "title": "",
  "stats": [],
  "testimonialIds": []
}
```

Each stat:

```json
{"value": "", "label": ""}
```

### `cta`

```json
{
  "eyebrow": "",
  "title": "Have a space in mind?",
  "body": "",
  "ctaLabel": "Start a Project",
  "ctaHref": "/contact"
}
```

### `rich_text`

```json
{
  "title": "",
  "body": ""
}
```

### `gallery`

```json
{
  "title": "",
  "intro": "",
  "mediaIds": []
}
```

---

# 6. PROJECT SECTION TYPE CONTRACT

Allowed `project_sections.section_type`:

```text
overview
brief
existing_condition
challenge
concept
plan_sequence
material_palette
lighting_strategy
custom_furniture
visualization
implementation
before_after
gallery
outcome
credits
rich_text
```

Narrative sections (`overview`, `brief`, `challenge`, `concept`, `lighting_strategy`, `custom_furniture`, `visualization`, `implementation`, `outcome`, `rich_text`) use:

```json
{
  "body": "",
  "mediaIds": []
}
```

`existing_condition`:

```json
{
  "body": "",
  "mediaIds": []
}
```

`plan_sequence`:

```json
{
  "intro": "",
  "items": [
    {
      "title": "",
      "type": "existing",
      "mediaId": "uuid",
      "caption": ""
    }
  ]
}
```

Allowed `type` values:

```text
existing
zoning
layout
furniture
lighting
ceiling
custom
```

`material_palette`:

```json
{
  "intro": "",
  "items": [
    {
      "name": "",
      "application": "",
      "description": "",
      "mediaId": "uuid"
    }
  ]
}
```

`before_after`:

```json
{
  "intro": "",
  "pairs": [
    {
      "label": "",
      "beforeMediaId": "uuid",
      "afterMediaId": "uuid"
    }
  ]
}
```

`gallery`:

```json
{
  "intro": "",
  "mediaIds": []
}
```

`credits`:

```json
{
  "items": [
    {
      "role": "",
      "name": "",
      "url": ""
    }
  ]
}
```

---

# 7. RLS ACCESS MATRIX

| Resource | Anonymous | Authenticated non-admin | Admin |
|---|---|---|---|
| `profiles` | no access | select own profile only | select own profile; admin authorization via `is_admin()` |
| `site_settings` | select singleton | select singleton | select/update |
| `navigation_items` | select visible | select visible | CRUD |
| `pages` | select `status='published'` | select published | CRUD |
| `page_sections` | select only enabled+published sections whose parent page is published | same | CRUD |
| `media_assets` | select metadata; bucket contains no confidential assets | select metadata | CRUD |
| `projects` | select `status='published'` | select published | CRUD |
| `project_sections` | select enabled sections whose parent project is published | same | CRUD |
| `services` | select published | select published | CRUD |
| `process_steps` | select published | select published | CRUD |
| `explorations` | select published | select published | CRUD |
| `exploration_media` | select when parent exploration published | same | CRUD |
| `testimonials` | select published | select published | CRUD |
| `inquiries` | no access | no access | CRUD |

`SUPABASE_SECRET_KEY` may insert into `inquiries` from a server-only validated action. It must not be used by the browser.

---

# 8. REPOSITORY STRUCTURE

```text
app/
  (public)/
    layout.tsx
    page.tsx
    projects/
      page.tsx
      [slug]/page.tsx
    services/page.tsx
    process/page.tsx
    about/page.tsx
    explorations/page.tsx
    contact/page.tsx

  admin/
    layout.tsx
    page.tsx
    site/page.tsx
    navigation/page.tsx
    pages/page.tsx
    pages/[slug]/page.tsx
    projects/page.tsx
    projects/new/page.tsx
    projects/[id]/page.tsx
    services/page.tsx
    process/page.tsx
    explorations/page.tsx
    testimonials/page.tsx
    media/page.tsx
    inquiries/page.tsx
    inquiries/[id]/page.tsx
    preview/projects/[id]/page.tsx

  auth/
    login/page.tsx
    signout/route.ts

  error.tsx
  not-found.tsx
  robots.ts
  sitemap.ts

components/
  public/
    Header.tsx
    Footer.tsx
    MobileMenu.tsx
    Media.tsx
    ImageMedia.tsx
    VideoMedia.tsx
    ProjectCard.tsx
    ProjectSectionRenderer.tsx

  home/
    Hero.tsx
    Positioning.tsx
    FeaturedProjects.tsx
    Philosophy.tsx
    ServicesPreview.tsx
    ProcessPreview.tsx
    MaterialMoment.tsx
    Credibility.tsx
    FinalCTA.tsx

  projects/
    ProjectGrid.tsx
    ProjectFilter.tsx
    ProjectHero.tsx
    ProjectFacts.tsx
    PlanSequence.tsx
    MaterialPalette.tsx
    BeforeAfter.tsx
    EditorialGallery.tsx
    ProjectCredits.tsx
    NextProject.tsx

  motion/
    SmoothScrollProvider.tsx
    ReducedMotionProvider.tsx
    MaskReveal.tsx
    ImageReveal.tsx
    ParallaxMedia.tsx
    VelocityStrip.tsx

  admin/
    AdminShell.tsx
    AdminSidebar.tsx
    AdminHeader.tsx
    FormField.tsx
    TextInput.tsx
    TextArea.tsx
    ArrayField.tsx
    StatusSelect.tsx
    MediaPicker.tsx
    MediaUploader.tsx
    SortableList.tsx
    ConfirmDialog.tsx
    SaveBar.tsx
    SectionEditor.tsx
    ProjectSectionEditor.tsx

lib/
  supabase/
    client.ts
    server.ts
    public.ts
    secret.ts
    proxy.ts

  auth/
    require-admin.ts

  data/
    site.ts
    pages.ts
    projects.ts
    services.ts
    process.ts
    explorations.ts
    testimonials.ts
    media.ts
    inquiries.ts

  actions/
    site.ts
    navigation.ts
    pages.ts
    projects.ts
    services.ts
    process.ts
    explorations.ts
    testimonials.ts
    media.ts
    inquiries.ts

  validation/
    site.ts
    page-sections.ts
    projects.ts
    project-sections.ts
    services.ts
    process.ts
    explorations.ts
    testimonials.ts
    inquiries.ts

  content/
    section-registry.ts
    project-section-registry.ts

  media/
    urls.ts

  utils/
    slugify.ts
    reorder.ts

types/
  database.generated.ts
  content.ts
  admin.ts

supabase/
  migrations/
  tests/
  seed.sql

tests/
  unit/
  e2e/

proxy.ts
.env.example
```

---

# 9. GLOBAL VERIFICATION COMMANDS

These scripts must exist by FE-001:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

For database tasks:

```bash
supabase db reset
supabase test db
```

---

# 10. EXECUTION WAVES

Do not execute by category from top to bottom. Execute in these waves so dependencies exist.

```text
Wave 0:
FE-001
BE-001

Wave 1:
FE-002..FE-008
BE-002..BE-010

Wave 2:
BE-011..BE-014
INT-001..INT-003
FE-012..FE-014

Wave 3:
INT-004..INT-008
FE-009..FE-011

Wave 4:
INT-009..INT-013
FE-015..FE-017

Wave 5:
INT-014..INT-017
FE-018

Wave 6:
DEP-001..DEP-009
```

---

# CATEGORY A — FRONTEND TASKS

## FE-001 — Initialize the Next.js application and quality tooling

**Depends on:** none

**Files:** project root, `package.json`, `tsconfig.json`, `eslint.config.*`, `vitest.config.*`, `playwright.config.ts`, `.env.example`

**Work:**
- Create a Next.js App Router application with TypeScript, Tailwind, ESLint, and `src` disabled so paths match this plan.
- Pin Next.js to `16.3.3`.
- Install runtime dependencies:
  - `@supabase/supabase-js`
  - `@supabase/ssr`
  - `zod`
  - `react-hook-form`
  - `@hookform/resolvers`
  - `gsap`
  - `@gsap/react`
  - `motion`
  - `lenis`
  - `lucide-react`
  - `@dnd-kit/core`
  - `@dnd-kit/sortable`
  - `@dnd-kit/utilities`
  - `sonner`
  - `clsx`
  - `tailwind-merge`
- Install dev dependencies:
  - `vitest`
  - `jsdom`
  - `@testing-library/react`
  - `@testing-library/jest-dom`
  - `@playwright/test`
  - `prettier`
- Add scripts:
  - `lint`
  - `typecheck`
  - `test`
  - `test:watch`
  - `test:e2e`
  - `format:check`
- Create `.env.example` with the exact environment contract from INT-001.
- Ensure no Supabase key is committed.

**Acceptance criteria:**
- `npm run dev` starts.
- Default page renders.
- TypeScript is strict.
- All global verification scripts exist.

**Verify:**
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

**Commit:** `chore(frontend): initialize nextjs portfolio application`

---

## FE-002 — Create visual tokens, typography, grid, and responsive foundations

**Depends on:** FE-001

**Files:** `app/globals.css`, `app/layout.tsx`, `lib/utils/cn.ts` or equivalent, font configuration

**Work:**
- Implement brand-neutral starting tokens from the PRD:
  - Ink `#171714`
  - Warm White `#F2F0E9`
  - Stone `#D9D3C7`
  - Taupe `#A49B8C`
- Define CSS variables for colors, spacing, container widths, borders, and motion durations.
- Define a 12-column desktop grid utility.
- Configure one editorial display type family and one neutral sans family using locally licensed or web-safe/project-approved fonts.
- Do not bundle unauthorized font files.
- Define base typography scales for display, heading, body, metadata.
- Define breakpoints for mobile `<768`, tablet `768–1279`, desktop `>=1280`.
- Define visible focus styles.

**Acceptance criteria:**
- Tokens are reusable; components do not hardcode PRD colors repeatedly.
- Typography wraps correctly at mobile and desktop widths.
- Focus ring is visible on keyboard navigation.

**Verify:**
```bash
npm run lint
npm run typecheck
npm run build
```

**Commit:** `feat(frontend): add editorial design system foundations`

---

## FE-003 — Build the public application shell

**Depends on:** FE-002

**Files:** `app/(public)/layout.tsx`, `components/public/Header.tsx`, `Footer.tsx`, `MobileMenu.tsx`

**Work:**
- Build semantic header/nav/footer.
- Navigation data is temporarily passed as typed props; no hardcoded business labels inside final data path.
- Desktop nav supports keyboard.
- Mobile menu traps focus while open and returns focus to trigger on close.
- Add `Start a Project` CTA slot.
- Add skip-to-content link.
- Prepare components to consume navigation and site settings from INT-005.

**Acceptance criteria:**
- Works at all three breakpoints.
- Mobile menu closes on route change.
- No essential link is hover-only.
- Shell works with empty optional phone/social data.

**Verify:**
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

**Commit:** `feat(frontend): build responsive public site shell`

---

## FE-004 — Build reusable responsive media components

**Depends on:** FE-002

**Files:** `components/public/Media.tsx`, `ImageMedia.tsx`, `VideoMedia.tsx`, `lib/media/urls.ts`

**Work:**
- Define a typed `MediaAsset` view model.
- `ImageMedia` uses `next/image`, explicit aspect ratio, responsive `sizes`, alt text, optional caption/photographer.
- `VideoMedia` supports poster, muted loop only when explicitly configured, `playsInline`, no forced autoplay on mobile if not requested.
- Provide loading placeholder behavior.
- Add an error fallback that does not collapse layout.
- Do not serve full-resolution originals directly when an optimized source is available.

**Acceptance criteria:**
- No layout shift from missing width/height.
- Images remain proportional.
- Video controls/fallback are accessible.
- Empty optional caption does not render blank layout.

**Verify:**
```bash
npm run test
npm run typecheck
npm run build
```

**Commit:** `feat(frontend): add responsive portfolio media primitives`

---

## FE-005 — Build the static Home page component system

**Depends on:** FE-003, FE-004

**Files:** `app/(public)/page.tsx`, `components/home/*`

**Work:**
Implement static typed-prop versions of:
- `Hero`
- `Positioning`
- `FeaturedProjects`
- `Philosophy`
- `ServicesPreview`
- `ProcessPreview`
- `MaterialMoment`
- `Credibility`
- `FinalCTA`

Rules:
- Section order follows the PRD.
- No complex motion yet.
- Featured project metadata is readable without hover.
- Credibility can disappear cleanly if no content.
- MaterialMoment can disappear cleanly if no media.
- CTA remains visible without animation.

**Acceptance criteria:**
- Home renders with mock typed data.
- Empty optional sections do not leave large blank spaces.
- Mobile is a native vertical reading flow.

**Verify:**
```bash
npm run test
npm run typecheck
npm run build
```

**Commit:** `feat(frontend): build static interior portfolio home sections`

---

## FE-006 — Build the static Projects index UI

**Depends on:** FE-003, FE-004

**Files:** `app/(public)/projects/page.tsx`, `components/projects/ProjectGrid.tsx`, `ProjectFilter.tsx`, `components/public/ProjectCard.tsx`

**Work:**
- Large editorial project grid.
- Card fields: title, type, location, year, optional area, status.
- Filter component uses query-friendly values and has `All`.
- Filter controls are keyboard/touch accessible.
- Hover scale maximum `1.02`.
- Metadata remains accessible without hover.

**Acceptance criteria:**
- 0 projects shows an intentional empty state.
- 1–3 projects do not produce broken grid gaps.
- Filter UI does not jump page position.

**Verify:**
```bash
npm run test
npm run typecheck
npm run build
```

**Commit:** `feat(frontend): build editorial projects index`

---

## FE-007 — Build the static Project Case Study renderer

**Depends on:** FE-004, FE-006

**Files:** `app/(public)/projects/[slug]/page.tsx`, `components/public/ProjectSectionRenderer.tsx`, `components/projects/*`

**Work:**
Build:
- ProjectHero
- ProjectFacts
- narrative section
- PlanSequence
- MaterialPalette
- BeforeAfter
- EditorialGallery
- ProjectCredits
- NextProject

Create `ProjectSectionRenderer` that maps the exact project section types in this document to components. Unknown section types must fail visibly in development and be skipped with logged error in production; do not crash the page.

**Acceptance criteria:**
- Optional sections can be omitted.
- Case-study order follows `sort_order`.
- Before/after has visible labels and non-drag fallback.
- Project credits render external links safely.

**Verify:**
```bash
npm run test
npm run typecheck
npm run build
```

**Commit:** `feat(frontend): build project case study renderer`

---

## FE-008 — Build Services, Process, About, Explorations, Contact static pages

**Depends on:** FE-003, FE-004

**Files:** public route files and corresponding components

**Work:**
- Services: intro + service list/detail blocks.
- Process: intro + ordered timeline.
- About: portrait/profile + configurable generic page sections.
- Explorations: editorial grid and detail-ready cards.
- Contact: project inquiry form UI from the canonical inquiry config.

Contact form fields:
- Name
- Email
- Phone optional/configurable
- Project Type
- Project Location
- Approximate Area
- Required Service
- Project Status
- Desired Timeline
- Budget Range optional/configurable
- Project Brief
- Referral Source
- hidden honeypot field

Do not wire submission yet.

**Acceptance criteria:**
- All labels are associated with fields.
- Required fields have visible errors in later validation-ready markup.
- Services/process support zero media gracefully.
- Contact form remains usable on mobile keyboard.

**Verify:**
```bash
npm run test
npm run typecheck
npm run build
```

**Commit:** `feat(frontend): build supporting portfolio pages and inquiry form`

---

## FE-009 — Implement the motion foundation

**Depends on:** FE-005, FE-007

**Files:** `components/motion/*`, `app/(public)/layout.tsx`, motion utilities

**Work:**
- Add `SmoothScrollProvider` using Lenis on supported desktop/tablet conditions.
- Register GSAP/ScrollTrigger once.
- Add lifecycle-safe GSAP context cleanup.
- Add `ReducedMotionProvider`.
- Add reusable `MaskReveal`, `ImageReveal`, `ParallaxMedia`, `VelocityStrip`.
- Reduced motion:
  - disables Lenis smoothing;
  - disables parallax;
  - disables scrub zoom;
  - disables pointer movement;
  - disables long pins.
- No animation may be required to make content visible.

**Acceptance criteria:**
- Route navigation creates no duplicate ScrollTriggers.
- Reduced-motion content is fully readable.
- No console warnings from stale animation refs.

**Verify:**
```bash
npm run test
npm run typecheck
npm run build
```

**Commit:** `feat(frontend): add motion and reduced-motion foundation`

---

## FE-010 — Implement Home signature interactions

**Depends on:** FE-009

**Files:** Home sections and motion utilities

**Work:**
Implement only:
1. Intro mask reveal.
2. Hero Space Reveal: framed hero image expands subtly toward full-width on scroll.
3. Positioning masked line reveal.
4. Featured projects editorial movement; avoid prolonged scroll lock.
5. Process progress visualization.
6. Material strip with slow velocity response.
7. Final CTA reveal.

Motion constraints:
- interior image scale generally stays within roughly `1.00–1.04`;
- pointer movement maximum about `±6px X`, `±4px Y`;
- no aggressive 3D tilt.

**Acceptance criteria:**
- Photography perspective is not visibly distorted.
- Mobile removes expensive pointer/parallax effects.
- Scroll backward behaves correctly.

**Verify:**
```bash
npm run typecheck
npm run test:e2e
npm run build
```

**Commit:** `feat(frontend): add restrained home signature motion`

---

## FE-011 — Implement Project Case Study interactions

**Depends on:** FE-009, FE-007

**Files:** `PlanSequence.tsx`, `BeforeAfter.tsx`, `EditorialGallery.tsx`, `NextProject.tsx`

**Work:**
- Desktop plan-to-space sequence uses short pinning/scrub.
- Mobile plan sequence becomes normal stacked content.
- Before/After supports pointer, touch, and keyboard.
- Gallery uses subtle reveal only.
- Next Project has full-width preview transition.
- No interaction may prevent normal page scrolling.

**Acceptance criteria:**
- Before/After can be operated without mouse.
- No long pinned section on mobile.
- Direct reload on project route has no animation initialization error.

**Verify:**
```bash
npm run test
npm run test:e2e
npm run build
```

**Commit:** `feat(frontend): add project storytelling interactions`

---

## FE-012 — Build the Admin shell

**Depends on:** FE-002

**Files:** `app/admin/layout.tsx`, `components/admin/AdminShell.tsx`, `AdminSidebar.tsx`, `AdminHeader.tsx`

**Work:**
- Responsive admin layout.
- Sidebar routes exactly match Source-of-Truth Routes.
- Mobile admin nav works without hover.
- Include logout control slot.
- Admin shell receives authenticated profile data as props later.
- Do not put route authorization in client components.

**Acceptance criteria:**
- All admin pages can mount inside shell.
- Sidebar active state is visible.
- Mobile navigation is usable.

**Verify:**
```bash
npm run typecheck
npm run build
```

**Commit:** `feat(frontend): build admin dashboard shell`

---

## FE-013 — Build the Admin login UI

**Depends on:** FE-002

**Files:** `app/auth/login/page.tsx`, login form component

**Work:**
- Email/password fields.
- No registration link.
- Submit pending state.
- Generic invalid-credentials error; do not reveal whether email exists.
- Redirect target handled by integration task.
- Add password manager compatible autocomplete values.

**Acceptance criteria:**
- Fully keyboard accessible.
- No public signup CTA.
- Error state does not expose technical Supabase messages.

**Verify:**
```bash
npm run test
npm run typecheck
npm run build
```

**Commit:** `feat(frontend): add secure admin login interface`

---

## FE-014 — Build reusable Admin form/editing primitives

**Depends on:** FE-012

**Files:** `components/admin/*`

**Work:**
Implement reusable:
- FormField
- TextInput
- TextArea
- ArrayField
- StatusSelect
- MediaPicker placeholder contract
- SortableList using dnd-kit
- ConfirmDialog
- SaveBar
- toast handling using Sonner

All form components accept server-returned field errors in a consistent structure:

```ts
type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[]> }
```

**Acceptance criteria:**
- No editor page invents a separate error shape.
- Destructive action always requires confirmation.
- SortableList works with keyboard sensors.

**Verify:**
```bash
npm run test
npm run typecheck
npm run build
```

**Commit:** `feat(frontend): add reusable admin editing primitives`

---

## FE-015 — Build Admin site, navigation, page, and section editors

**Depends on:** FE-014

**Files:** admin routes for site/navigation/pages, `SectionEditor.tsx`

**Work:**
- Site settings editor.
- Inquiry config editor.
- Header/footer/social navigation CRUD UI.
- Page list with status.
- Page metadata editor.
- Page section list with add, edit, enable/disable, publish/archive, delete, reorder.
- `SectionEditor` form selection is driven by `section-registry.ts`; it must not infer fields from arbitrary JSON.
- Allowed page section types are exactly those listed in this plan.

**Acceptance criteria:**
- Every editable Home section can be edited from admin.
- About/Contact generic page sections can be edited.
- Reorder UI gives visible order.
- JSON is never edited through a raw JSON textarea.

**Verify:**
```bash
npm run test
npm run typecheck
npm run build
```

**Commit:** `feat(frontend): build admin page and section editors`

---

## FE-016 — Build Admin project editor

**Depends on:** FE-014

**Files:** admin project routes, `ProjectSectionEditor.tsx`

**Work:**
Project list:
- search by title;
- filter by content status;
- show featured indicator.

Project editor:
- title/slug;
- metadata;
- type/location/year/area/status;
- role/services arrays;
- summary;
- hero media;
- SEO;
- featured toggle/order;
- publish status.

Project section editor:
- add only allowed project section types;
- type-specific form from `project-section-registry.ts`;
- reorder;
- enable/disable;
- delete;
- media selection;
- preview link.

**Acceptance criteria:**
- User can create a project without manually editing database rows.
- Project can remain draft.
- Optional sections are optional.
- Raw JSON is not exposed to normal admin user.

**Verify:**
```bash
npm run test
npm run typecheck
npm run build
```

**Commit:** `feat(frontend): build full project cms editor`

---

## FE-017 — Build remaining Admin collection screens

**Depends on:** FE-014

**Files:** admin routes for services/process/explorations/testimonials/media/inquiries

**Work:**
- Services CRUD and reorder.
- Process step CRUD and reorder.
- Explorations CRUD; manage ordered exploration media.
- Testimonials CRUD and featured toggle.
- Media grid/list, upload modal, archive control.
- Inquiry list with status filter.
- Inquiry detail with notes/status update.

**Acceptance criteria:**
- Every collection from the PRD can be managed without Supabase dashboard access.
- Destructive actions are confirmed.
- Admin tables remain usable at narrow desktop widths.

**Verify:**
```bash
npm run test
npm run typecheck
npm run build
```

**Commit:** `feat(frontend): build remaining admin cms screens`

---

## FE-018 — Frontend accessibility, responsive, and visual QA hardening

**Depends on:** FE-003..FE-017

**Files:** all UI components as required

**Work:**
- Verify heading order.
- Verify focus states.
- Verify color contrast.
- Verify keyboard operation.
- Verify alt/caption behavior.
- Verify filter and before/after keyboard controls.
- Verify mobile typography wrapping.
- Verify floor plan legibility.
- Verify no image stretching.
- Verify admin forms have labels, descriptions, errors.
- Remove horizontal overflow at 320px.
- Confirm reduced motion.
- Add automated accessibility-friendly assertions where practical.

**Acceptance criteria:**
- Public and admin core flows work without mouse.
- No known critical accessibility defect.
- No horizontal page overflow at 320px.

**Verify:**
```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

**Commit:** `fix(frontend): harden responsive and accessible ui`

---

# CATEGORY B — BACKEND / SUPABASE TASKS

## BE-001 — Initialize Supabase local development

**Depends on:** none

**Files:** `supabase/config.toml`, Supabase project folder

**Work:**
- Install/use Supabase CLI.
- Run `supabase init`.
- Start local Supabase.
- Record local API URL and local publishable/secret equivalents only in local ignored env.
- Ensure `supabase/migrations` and `supabase/tests` are committed.

**Acceptance criteria:**
- `supabase start` succeeds.
- Local Studio is reachable.
- No local secret is committed.

**Verify:**
```bash
supabase status
```

**Commit:** `chore(backend): initialize local supabase`

---

## BE-002 — Create database enums and timestamp infrastructure

**Depends on:** BE-001

**Files:** first SQL migration

**Work:**
- Create enums:
  - `content_status`
  - `project_status`
  - `inquiry_status`
- Create `set_updated_at()` trigger function.
- Every table with `updated_at` will later use the trigger.
- Use `gen_random_uuid()`.

**Acceptance criteria:**
- Migration applies from an empty local database.
- Re-running through `supabase db reset` is deterministic.

**Verify:**
```bash
supabase db reset
```

**Commit:** `feat(backend): add content enums and timestamp function`

---

## BE-003 — Create profiles and admin authorization function

**Depends on:** BE-002

**Files:** SQL migration

**Work:**
- Create `profiles`.
- Create `public.is_admin()` as a safe `security definer` function whose only purpose is checking whether `auth.uid()` has role `admin`.
- Set a safe `search_path`.
- Do not create public signup trigger that automatically grants admin.
- Admin profile is inserted manually after Auth user creation.

**Acceptance criteria:**
- Normal user cannot become admin by updating profile.
- `is_admin()` returns false when unauthenticated.

**Verify:**
```bash
supabase db reset
supabase test db
```

**Commit:** `feat(backend): add admin profile authorization model`

---

## BE-004 — Create global content tables

**Depends on:** BE-002

**Files:** SQL migration

**Work:**
Create exactly:
- `site_settings`
- `navigation_items`
- `pages`
- `page_sections`

Add:
- primary keys;
- foreign keys;
- unique constraints;
- updated_at triggers;
- indexes on status/order/slug where useful.

Do not add content data in the migration; seed is BE-012.

**Acceptance criteria:**
- `site_settings` enforces singleton id `1`.
- `page_sections` cannot duplicate `(page_id, section_key)`.

**Verify:**
```bash
supabase db reset
```

**Commit:** `feat(backend): add global content schema`

---

## BE-005 — Create media metadata schema

**Depends on:** BE-002, BE-003

**Files:** SQL migration

**Work:**
- Create `media_assets` exactly as specified.
- Index `is_archived`, `created_at`, `media_type`.
- Add updated_at trigger.
- `created_by` references auth user.
- After `media_assets` exists, add foreign keys:
  - `site_settings.default_og_media_id -> media_assets(id)` with `ON DELETE SET NULL`;
  - `pages.og_media_id -> media_assets(id)` with `ON DELETE SET NULL`.

**Acceptance criteria:**
- Storage path is unique.
- Asset can be archived without deleting file.

**Verify:**
```bash
supabase db reset
```

**Commit:** `feat(backend): add media asset metadata`

---

## BE-006 — Create project and project section schema

**Depends on:** BE-002, BE-005

**Files:** SQL migration

**Work:**
- Create `projects`.
- Create `project_sections`.
- Add indexes:
  - `projects(status, sort_order)`
  - `projects(featured, featured_order)`
  - `projects(project_type)`
  - `projects(year)`
  - `project_sections(project_id, sort_order)`
- Add updated_at triggers.

**Acceptance criteria:**
- Project slug unique.
- Deleting project cascades sections.
- Deleting media referenced as hero is blocked until reference is changed.

**Verify:**
```bash
supabase db reset
```

**Commit:** `feat(backend): add portfolio project schema`

---

## BE-007 — Create Services, Process, Explorations, Testimonials schema

**Depends on:** BE-002, BE-005

**Files:** SQL migration

**Work:**
Create:
- `services`
- `process_steps`
- `explorations`
- `exploration_media`
- `testimonials`

Add appropriate order/status indexes and updated_at triggers.

**Acceptance criteria:**
- Deleting an exploration cascades `exploration_media`.
- Service/exploration slug is unique.
- Ordered collections can sort deterministically.

**Verify:**
```bash
supabase db reset
```

**Commit:** `feat(backend): add portfolio collection schemas`

---

## BE-008 — Create inquiry schema

**Depends on:** BE-002

**Files:** SQL migration

**Work:**
- Create `inquiries`.
- Add indexes on:
  - `status`
  - `submitted_at desc`
  - `email`
- Add updated_at trigger.
- No public RLS policy is added yet.

**Acceptance criteria:**
- Default status is `new`.
- Required qualification fields are not nullable.

**Verify:**
```bash
supabase db reset
```

**Commit:** `feat(backend): add project inquiry schema`

---

## BE-009 — Lock down grants and implement RLS policies

**Depends on:** BE-003..BE-008

**Files:** SQL migration

**Work:**
- Enable RLS on every public table.
- Revoke unnecessary grants from `anon` and `authenticated`.
- Re-grant only operations required by the RLS matrix.
- Create separate public-select and admin-all policies.
- `inquiries`: no anon/authenticated direct insert/select/update/delete.
- `profiles`: user can select own profile; no client-side role modification.
- Page section public policy checks parent page is published.
- Project section public policy checks parent project is published.
- Exploration media public policy checks parent exploration is published.
- Admin policies use `is_admin()`.

**Acceptance criteria:**
- Anonymous direct insert to `inquiries` fails.
- Anonymous draft project read fails.
- Admin authenticated CRUD succeeds.
- Non-admin authenticated CRUD fails.

**Verify:**
```bash
supabase db reset
supabase test db
```

**Commit:** `feat(backend): enforce rls and least privilege grants`

---

## BE-010 — Create Supabase Storage bucket and policies

**Depends on:** BE-003

**Files:** SQL migration where possible, storage configuration

**Work:**
- Create bucket `portfolio-public` as public.
- Only admins can insert/update/delete objects.
- Object path convention:
  `portfolio/<yyyy>/<uuid>-<sanitized-file-name>`
- Accepted image MIME types:
  - image/jpeg
  - image/png
  - image/webp
  - image/avif
- Accepted video MIME types:
  - video/mp4
  - video/webm
- Configure the bucket's allowed MIME types to the list above.
- Configure bucket file-size limit to 80 MB.
- App UI additionally rejects image uploads above 15 MB.
- Public delivery is allowed because bucket is public.
- Explicitly document that confidential media must not be uploaded.

**Acceptance criteria:**
- Anonymous can fetch known public object URL.
- Anonymous cannot upload/delete.
- Non-admin authenticated user cannot upload/delete.
- Admin can upload/delete.

**Verify:**
```bash
supabase test db
```

**Commit:** `feat(backend): secure public portfolio storage bucket`

---

## BE-011 — Add reorder RPC functions and helper indexes

**Depends on:** BE-009

**Files:** SQL migration

**Work:**
Create security-invoker reorder RPCs that require admin RLS permissions:
- `reorder_navigation_items(uuid[])`
- `reorder_page_sections(uuid, uuid[])`
- `reorder_projects(uuid[])`
- `reorder_project_sections(uuid, uuid[])`
- `reorder_services(uuid[])`
- `reorder_process_steps(uuid[])`
- `reorder_explorations(uuid[])`
- `reorder_testimonials(uuid[])`

Each function:
- validates that IDs belong to the expected parent where applicable;
- updates `sort_order` to array position;
- rejects duplicate IDs;
- does not accept dynamic table names.

**Acceptance criteria:**
- Reorder is atomic per RPC call.
- Non-admin cannot execute successfully.

**Verify:**
```bash
supabase db reset
supabase test db
```

**Commit:** `feat(backend): add atomic content reorder functions`

---

## BE-012 — Add deterministic seed content

**Depends on:** BE-004..BE-011

**Files:** `supabase/seed.sql`

**Work:**
Seed:
- singleton site settings;
- canonical seven page rows;
- header/footer navigation;
- Home section rows with valid JSON shapes;
- one draft sample project and valid project sections;
- one draft service;
- two draft process steps;
- no fake testimonial;
- no fake client metrics.

Seed copy is staging/development copy only and must not make unverifiable claims.

**Acceptance criteria:**
- `supabase db reset` produces a renderable development dataset.
- Seed can be run repeatedly after reset.
- No admin password is embedded in seed.

**Verify:**
```bash
supabase db reset
```

**Commit:** `chore(backend): add deterministic development seed`

---

## BE-013 — Generate and commit Supabase database types

**Depends on:** BE-012

**Files:** `types/database.generated.ts`

**Work:**
- Generate types from local schema.
- Do not hand-edit generated file.
- Add a package script, for example `db:types`, that regenerates it.
- Create human-owned content view types separately in `types/content.ts`.

**Acceptance criteria:**
- Application code can use generated table/enum types.
- Regeneration produces no unexpected schema drift.

**Verify:**
```bash
npm run typecheck
```

**Commit:** `chore(backend): add generated supabase database types`

---

## BE-014 — Add database and RLS regression tests

**Depends on:** BE-009..BE-013

**Files:** `supabase/tests/*.sql`

**Work:**
Test:
- anon cannot read draft pages/projects/services.
- anon can read published content.
- anon cannot insert inquiry.
- authenticated non-admin cannot mutate content.
- admin can mutate content.
- admin cannot reorder records from wrong parent.
- `site_settings` singleton is enforced.
- duplicate slugs fail.
- project section parent deletion cascades.
- exploration media parent deletion cascades.

**Acceptance criteria:**
- Tests fail if RLS is accidentally loosened.
- Tests pass from clean reset.

**Verify:**
```bash
supabase db reset
supabase test db
```

**Commit:** `test(backend): add rls and schema regression coverage`

---

# CATEGORY C — FRONTEND/BACKEND INTEGRATION TASKS

## INT-001 — Configure environment contract and Supabase clients

**Depends on:** FE-001, BE-013

**Files:** `.env.example`, `lib/supabase/client.ts`, `server.ts`, `public.ts`, `secret.ts`

**Environment contract:**
```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Work:**
- Browser authenticated client: `@supabase/ssr` `createBrowserClient`.
- Server authenticated client: `@supabase/ssr` `createServerClient` with cookies.
- Public server client: `@supabase/supabase-js` with publishable key and no user session dependency.
- Secret server client: `@supabase/supabase-js`; first line imports `server-only`.
- Secret client is only exported to server-only action modules.
- Configure `next.config.ts` `images.remotePatterns` from `NEXT_PUBLIC_SUPABASE_URL` so `next/image` can render Supabase Storage assets without a wildcard host.
- Do not log keys.

**Acceptance criteria:**
- Browser bundle contains no secret key.
- Public and authenticated clients have distinct responsibilities.
- Missing required env gives a clear boot-time/server error.

**Verify:**
```bash
npm run typecheck
npm run build
```

**Commit:** `feat(integration): configure supabase client boundaries`

---

## INT-002 — Implement Supabase SSR session refresh with Next.js Proxy

**Depends on:** INT-001

**Files:** `lib/supabase/proxy.ts`, root `proxy.ts`

**Work:**
- Follow current Supabase Next.js SSR pattern.
- Refresh/verify auth using `supabase.auth.getClaims()`.
- Forward updated cookies on request/response.
- Matcher excludes static/image assets.
- Do not globally redirect all public routes.
- Proxy only handles session continuity and lightweight unauthenticated `/admin` redirect; final authorization remains server-side.

**Acceptance criteria:**
- Login persists across navigation/refresh.
- Public routes remain accessible signed out.
- Expired session returns admin user to login cleanly.
- No cached authenticated response leaks session.

**Verify:**
```bash
npm run test:e2e
npm run build
```

**Commit:** `feat(integration): add supabase ssr session proxy`

---

## INT-003 — Implement server-side admin authorization and auth actions

**Depends on:** INT-002, BE-003, FE-013

**Files:** `lib/auth/require-admin.ts`, login action, `app/auth/signout/route.ts`, `app/admin/layout.tsx`

**Work:**
- Login uses `signInWithPassword`.
- `requireAdmin()`:
  1. creates server Supabase client;
  2. calls `getClaims()`;
  3. gets user ID from verified claims;
  4. queries `profiles` for own role;
  5. redirects to `/auth/login` when not authenticated;
  6. returns 403/not-found style admin error for authenticated non-admin.
- Admin layout calls `requireAdmin()` on server.
- Mark the authenticated admin route tree dynamic (`export const dynamic = 'force-dynamic'` at the appropriate admin layout boundary).
- Signout route signs out and redirects to login.
- Disable public sign-up UI.

**Acceptance criteria:**
- Direct request to `/admin` signed out redirects.
- A valid non-admin user cannot access admin.
- UI hiding is not the only protection.

**Verify:**
```bash
npm run test
npm run test:e2e
npm run build
```

**Commit:** `feat(integration): secure admin authentication and authorization`

---

## INT-004 — Build typed validation registries and data repository layer

**Depends on:** BE-013, INT-001

**Files:** `lib/validation/*`, `lib/content/*`, `lib/data/*`, `types/content.ts`

**Work:**
- Implement Zod schemas for every database form.
- Implement discriminated validation for page section and project section JSON types.
- Implement `section-registry.ts` with:
  - section type;
  - Zod schema;
  - admin editor key;
  - public renderer key.
- Implement `project-section-registry.ts`.
- Build data repository functions for public and admin reads.
- Repository functions throw typed application errors; UI components do not call Supabase directly.

Required public functions include:
```ts
getPublicSiteSettings()
getPublicNavigation()
getPublishedPage(slug)
getPublishedPageSections(slug)
getFeaturedProjects(limit)
getPublishedProjects(filters?)
getPublishedProjectBySlug(slug)
getNextPublishedProject(projectId)
getPublishedServices()
getPublishedProcessSteps()
getPublishedExplorations()
getPublishedTestimonials()
```

**Acceptance criteria:**
- Raw JSONB is parsed by Zod before components consume it.
- Invalid stored JSON fails with identifiable content record ID.
- UI components are database-client agnostic.

**Verify:**
```bash
npm run test
npm run typecheck
npm run build
```

**Commit:** `feat(integration): add typed content validation and repositories`

---

## INT-005 — Connect global public shell to Supabase content

**Depends on:** INT-004, FE-003

**Files:** `app/(public)/layout.tsx`, Header/Footer data adapters

**Work:**
- Fetch site settings and navigation server-side.
- Render header/footer from database.
- Social/external links honor `target_blank`.
- Missing optional phone/WhatsApp/social fields do not break layout.
- Add safe fallback only for catastrophic missing singleton row; surface server log.

**Acceptance criteria:**
- Changing navigation/site settings in DB changes rendered site.
- No business contact copy remains duplicated in components.

**Verify:**
```bash
npm run test
npm run typecheck
npm run build
```

**Commit:** `feat(integration): connect global portfolio content`

---

## INT-006 — Connect Home page sections to Supabase

**Depends on:** INT-004, FE-005

**Files:** `app/(public)/page.tsx`, Home section adapter/renderer

**Work:**
- Load published/enabled Home page sections ordered by `sort_order`.
- Validate each content JSON.
- Resolve referenced project/media/testimonial records.
- Render via section type registry.
- `featured_projects` uses published projects with `featured=true`, ordered by `featured_order`, capped by `maxItems`.
- `services_preview` and `process_preview` query published collections.
- Disabled/draft sections never appear publicly.

**Acceptance criteria:**
- Admin data can fully control Home section copy, order, and visibility.
- Missing optional referenced testimonial/media yields a controlled section-level error/fallback, not full page crash.

**Verify:**
```bash
npm run test
npm run test:e2e
npm run build
```

**Commit:** `feat(integration): drive home page from supabase content`

---

## INT-007 — Connect Projects index and case studies to Supabase

**Depends on:** INT-004, FE-006, FE-007

**Files:** projects public routes

**Work:**
- Project index queries only published projects.
- Project type filter uses URL search params.
- Project detail queries by published slug.
- Unpublished/nonexistent slug returns 404.
- Project sections validate and render in `sort_order`.
- Resolve all referenced media IDs.
- Next project is deterministic by public sort order.
- Metadata clearly shows concept/ongoing/completed.

**Acceptance criteria:**
- Direct reload `/projects/[slug]` works.
- Draft project is inaccessible on public route.
- All optional section types disappear cleanly when absent.

**Verify:**
```bash
npm run test
npm run test:e2e
npm run build
```

**Commit:** `feat(integration): connect project portfolio to supabase`

---

## INT-008 — Connect Services, Process, About, Explorations, Contact content

**Depends on:** INT-004, FE-008

**Files:** supporting public routes

**Work:**
- Every supporting route first loads its own published/enabled `page_sections` for editable intro, narrative, gallery, and CTA blocks.
- Services additionally queries published services by sort order.
- Process additionally queries published steps by sort order.
- About renders its published generic page sections.
- Explorations additionally queries published explorations and media.
- Contact renders its page sections plus `site_settings.inquiry_config`.
- Service field in inquiry form can use published service names.

**Acceptance criteria:**
- Each page is admin/data driven.
- Draft collection items are not exposed.
- Empty collection has intentional UI state.

**Verify:**
```bash
npm run test
npm run build
```

**Commit:** `feat(integration): connect supporting pages to supabase`

---

## INT-009 — Implement Admin media upload, selection, and archive integration

**Depends on:** INT-003, BE-010, FE-017

**Files:** `lib/actions/media.ts`, `lib/data/media.ts`, admin media components

**Work:**
- Validate MIME and size in the admin client before upload; Storage bucket MIME/file-size rules are the server-side enforcement boundary.
- Sanitize filename and generate UUID path before upload.
- Upload directly from the authenticated admin browser client to Supabase Storage so large media does not pass through a Vercel Server Action.
- After successful Storage upload, call an authenticated Server Action to insert `media_assets` metadata.
- If DB metadata insertion fails, attempt authenticated Storage cleanup and show an actionable error.
- MediaPicker loads non-archived assets.
- Archive action marks metadata archived; archived media is hidden from normal picker results but remains resolvable for existing published references.
- Physical deletion is not the default action.
- Add explicit hard-delete function only when usage check returns zero.
- Usage check scans direct FK references and JSON section payloads for asset UUID before allowing hard delete.

**Acceptance criteria:**
- Admin can upload image/video and immediately select it.
- Anonymous upload fails.
- Referenced asset cannot be hard-deleted.
- Archive does not break existing references.

**Verify:**
```bash
npm run test
npm run test:e2e
npm run build
```

**Commit:** `feat(integration): connect admin media library to storage`

---

## INT-010 — Implement Admin global/page section CRUD

**Depends on:** INT-003, INT-004, FE-015, BE-011

**Files:** `lib/actions/site.ts`, `navigation.ts`, `pages.ts`

**Work:**
Implement validated Server Actions:
- updateSiteSettings
- createNavigationItem
- updateNavigationItem
- deleteNavigationItem
- reorderNavigationItems
- updatePageMetadata
- createPageSection
- updatePageSection
- togglePageSection
- publishPageSection
- archivePageSection
- deletePageSection
- reorderPageSections

Every action:
- calls `requireAdmin()`;
- validates input with Zod;
- uses authenticated server client;
- returns canonical `ActionResult`;
- revalidates affected public/admin paths.

**Acceptance criteria:**
- Admin can change/add/remove/reorder Home content without code.
- Invalid section JSON never reaches DB.
- Non-admin server-action request fails.

**Verify:**
```bash
npm run test
npm run test:e2e
npm run build
```

**Commit:** `feat(integration): enable admin page content management`

---

## INT-011 — Implement Admin project CRUD, section CRUD, publish workflow, and preview

**Depends on:** INT-003, INT-004, FE-016, BE-011, INT-009

**Files:** `lib/actions/projects.ts`, project admin routes, preview route

**Work:**
Actions:
- createProject
- updateProject
- deleteProject
- setProjectStatus
- reorderProjects
- createProjectSection
- updateProjectSection
- toggleProjectSection
- deleteProjectSection
- reorderProjectSections

Rules:
- Slug generated with shared slugify helper but remains editable.
- Unique conflict returns field error.
- Publishing requires:
  - title;
  - slug;
  - year;
  - location;
  - project_type;
  - project_status;
  - summary;
  - hero media.
- Preview route `/admin/preview/projects/[id]`:
  - requires admin;
  - loads draft or published content;
  - renders same public Project renderer;
  - adds clear `"Preview"` admin banner;
  - is `noindex`.

**Acceptance criteria:**
- Full project can be created from admin only.
- Draft never appears publicly.
- Preview visually matches public renderer.

**Verify:**
```bash
npm run test
npm run test:e2e
npm run build
```

**Commit:** `feat(integration): enable project cms and draft preview`

---

## INT-012 — Implement Admin CRUD for Services, Process, Explorations, Testimonials

**Depends on:** INT-003, INT-004, FE-017, BE-011, INT-009

**Files:** corresponding `lib/actions/*.ts` and admin routes

**Work:**
- Services create/update/delete/status/reorder.
- Process steps create/update/delete/status/reorder.
- Explorations create/update/delete/status/reorder + exploration media attach/detach/reorder.
- Testimonials create/update/delete/status/reorder/featured.
- Validate all with Zod.
- All actions use admin session/RLS.
- Revalidate related public pages.

**Acceptance criteria:**
- No collection requires Supabase Studio for normal editing.
- Draft items remain private.
- Reorder persists after refresh.

**Verify:**
```bash
npm run test
npm run test:e2e
npm run build
```

**Commit:** `feat(integration): enable admin collection management`

---

## INT-013 — Implement public Project Inquiry submission and Admin inquiry workflow

**Depends on:** INT-001, BE-008, FE-008, FE-017

**Files:** `lib/validation/inquiries.ts`, `lib/actions/inquiries.ts`, contact form, admin inquiry routes

**Work:**
Public submit action:
- is server-only;
- validates all fields using current inquiry config;
- rejects if hidden honeypot has content;
- normalizes whitespace/email;
- enforces practical max lengths;
- uses `SUPABASE_SECRET_KEY` client only for inserting validated inquiry;
- returns generic success/failure message;
- does not expose database error details.

Admin:
- list newest first;
- filter by status;
- detail view;
- update status;
- update admin notes.

Do not add public file upload in this MVP.

**Acceptance criteria:**
- Browser never receives secret key.
- Direct anon Data API insert is still denied by RLS.
- Valid form creates one inquiry.
- Invalid/honeypot form creates none.
- Admin can process inquiry.

**Verify:**
```bash
npm run test
npm run test:e2e
npm run build
```

**Commit:** `feat(integration): connect project inquiry workflow`

---

## INT-014 — Implement cache invalidation and content freshness

**Depends on:** INT-005..INT-013

**Files:** action helpers and public routes

**Work:**
- Use `revalidatePath` after admin mutations.
- Revalidate only affected paths where possible.
- Typical mapping:
  - site/nav -> `/` layout and all public layout consumers;
  - Home section -> `/`;
  - project -> `/projects`, `/projects/[slug]`, `/`;
  - service -> `/services`, `/`;
  - process -> `/process`, `/`;
  - exploration -> `/explorations`;
  - testimonial -> `/`;
- Authenticated admin routes remain dynamic.
- Do not use ISR caching on routes that refresh auth/session cookies.
- Verify update becomes visible without redeploy.

**Acceptance criteria:**
- Published edit shows on public page after save/revalidation.
- Admin session is never cached into another user's response.

**Verify:**
```bash
npm run test:e2e
npm run build
```

**Commit:** `feat(integration): add safe content revalidation`

---

## INT-015 — Implement database-driven SEO, metadata, sitemap, and robots

**Depends on:** INT-005..INT-008

**Files:** route metadata functions, `app/sitemap.ts`, `app/robots.ts`

**Work:**
- Use site default SEO from `site_settings`.
- Page metadata from `pages`.
- Project metadata from project fields.
- OG image resolves from `og_media_id`, falling back to hero/default.
- Generate sitemap from published public pages/projects/explorations only.
- Admin/auth/preview paths excluded from sitemap.
- Robots disallow `/admin`, `/auth`, `/admin/preview`.
- Preview page sets `noindex,nofollow`.
- Add factual structured data:
  - Person or Organization
  - WebSite
  - BreadcrumbList
  - CreativeWork where appropriate
- Do not invent ratings, address, or awards.

**Acceptance criteria:**
- Every published project has unique title/description.
- Draft content never appears in sitemap.
- OG asset URL is absolute.

**Verify:**
```bash
npm run test
npm run build
```

**Commit:** `feat(integration): add dynamic seo and discovery metadata`

---

## INT-016 — Build complete automated test coverage for critical flows

**Depends on:** INT-003..INT-015

**Files:** `tests/unit/*`, `tests/e2e/*`

**Unit test targets:**
- section Zod schemas;
- project section Zod schemas;
- slugify;
- inquiry validation;
- media URL helper;
- repository mapping for empty/optional data.

**Playwright E2E targets:**
1. Home loads published sections.
2. Projects filter works.
3. Published project opens.
4. Unknown/draft project 404 behavior.
5. Reduced-motion rendering.
6. Admin unauthenticated redirect.
7. Admin login success.
8. Admin page section edit persists.
9. Admin draft project create + preview.
10. Publish project makes it public.
11. Media upload happy path in test environment.
12. Contact inquiry submit.
13. Admin sees inquiry and changes status.
14. Mobile menu.
15. Keyboard before/after control.

**Acceptance criteria:**
- Critical product flow has automated regression coverage.
- Tests are deterministic and do not depend on production data.

**Verify:**
```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
supabase test db
```

**Commit:** `test: cover public portfolio and admin cms critical flows`

---

## INT-017 — Add analytics and performance instrumentation

**Depends on:** INT-006..INT-008

**Files:** root public layout, analytics adapter, event hooks

**Work:**
- Add Vercel Web Analytics and Speed Insights.
- Create a single `trackPortfolioEvent()` adapter so UI components do not import provider-specific APIs directly.
- Instrument PRD event names:
  - `hero_view_projects_click`
  - `hero_start_project_click`
  - `featured_project_click`
  - `project_filter_used`
  - `project_next_click`
  - `service_view`
  - `contact_start`
  - `contact_submit`
  - `whatsapp_click`
  - `email_click`
  - `instagram_click`
- Do not include sensitive inquiry text, email, phone, budget, or personal data in analytics properties.

**Acceptance criteria:**
- Analytics failure does not break navigation/form submission.
- No PII is sent as event property.

**Verify:**
```bash
npm run typecheck
npm run build
```

**Commit:** `feat(integration): add privacy-safe portfolio analytics`

---

# CATEGORY D — DEPLOYMENT TASKS

## DEP-001 — Create Git repository workflow and CI gate

**Depends on:** FE-001, BE-014

**Files:** `.github/workflows/ci.yml`, README developer setup

**Work:**
- Repository default branch `main`.
- Feature branches use `feature/<task-id>-<short-name>`.
- Add CI running:
  - npm clean install;
  - lint;
  - typecheck;
  - unit tests;
  - build.
- Run Playwright in CI if environment fixtures are available; otherwise dedicated integration workflow.
- Document local Supabase reset and type generation.
- Do not put secrets in workflow YAML.

**Acceptance criteria:**
- Broken typecheck/test blocks merge.
- README can bootstrap a new developer/agent from zero.

**Verify:**
- Open test PR and confirm CI runs.

**Commit:** `ci: add quality gate for portfolio application`

---

## DEP-002 — Create hosted Supabase staging and production environments

**Depends on:** BE-014

**Work:**
Recommended environments:
- Local Supabase -> local development.
- Hosted `portfolio-staging` -> Vercel Preview.
- Hosted `portfolio-production` -> Vercel Production.

For each hosted project:
- choose the appropriate region;
- create current publishable and secret API keys;
- apply committed migrations in order;
- run seed only on staging;
- do not seed fake content into production;
- run RLS/database tests against staging;
- confirm storage bucket/policies.

**Acceptance criteria:**
- Staging and production schemas match migration history.
- Production has no sample project/test inquiry.
- Secrets are stored outside repository.

**Verify:**
```text
Compare migration versions.
Run smoke SELECT as anon for published data.
Confirm anon draft/inquiry access is denied.
```

**Commit:** no code commit unless environment docs change.

---

## DEP-003 — Create production/staging Admin Auth users securely

**Depends on:** DEP-002, BE-003

**Work:**
- Disable/avoid public signup.
- Create admin Auth user manually in Supabase Auth.
- Insert matching `profiles` row with `role='admin'`.
- Use a unique strong password stored in password manager.
- Create a separate staging admin; do not reuse production password.
- Test `is_admin()` through application login.

**Acceptance criteria:**
- Admin can login.
- Random authenticated user without admin profile cannot access `/admin`.
- No password is stored in repo or seed SQL.

---

## DEP-004 — Create Vercel project and environment-variable separation

**Depends on:** DEP-002

**Work:**
- Import Git repository into Vercel.
- Set framework to Next.js/default auto detection.
- Configure Preview vars to staging Supabase:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SECRET_KEY`
  - `NEXT_PUBLIC_SITE_URL`
- Configure Production vars to production Supabase with production values.
- Do not expose `SUPABASE_SECRET_KEY` as `NEXT_PUBLIC_*`.
- Trigger a rebuild after changing env vars.

**Acceptance criteria:**
- Preview deployment queries staging only.
- Production deployment queries production only.
- Secret is absent from client bundle/source map.

---

## DEP-005 — Complete Vercel Preview deployment and staging QA

**Depends on:** DEP-004, INT-016

**Work:**
- Push a feature/release branch and allow Vercel Preview deployment.
- Run full QA on preview:
  - public routes;
  - project detail;
  - admin login;
  - page edit;
  - project draft preview;
  - publish/unpublish;
  - media upload;
  - inquiry submission;
  - inquiry admin workflow;
  - mobile Safari/Chrome;
  - reduced motion.
- Run Lighthouse against real preview media.
- Fix critical defects before production.

**Launch thresholds:**
- Performance target 90+ where representative content allows.
- Accessibility 95+.
- Best Practices 95+.
- SEO 95+.
- CLS < 0.1.
- LCP target < 2.5 s.

**Acceptance criteria:**
- No critical console error.
- No broken image.
- No auth redirect loop.
- No RLS error in normal workflows.

---

## DEP-006 — Configure custom domain, canonical URL, and Auth URL settings

**Depends on:** DEP-005

**Work:**
- Add custom domain in Vercel.
- Configure DNS exactly as Vercel requests.
- Set production `NEXT_PUBLIC_SITE_URL` to canonical HTTPS domain.
- Configure Supabase Auth Site URL to the production canonical domain.
- If password recovery is later enabled, add only required redirect URLs.
- Verify www/non-www canonical redirect choice.
- Regenerate sitemap/metadata with canonical domain.

**Acceptance criteria:**
- HTTPS valid.
- One canonical host.
- OG/sitemap URLs use custom domain.
- Admin login still works.

---

## DEP-007 — Production migration and production deployment

**Depends on:** DEP-006

**Work:**
1. Confirm production database backup/restore point availability.
2. Apply all committed Supabase migrations to production.
3. Verify storage bucket and RLS.
4. Confirm production admin profile.
5. Merge release to `main`.
6. Allow Vercel production deployment.
7. Do not run staging seed on production.
8. Enter real site content through admin.

**Acceptance criteria:**
- Production build succeeds.
- Public site contains no staging/sample claims.
- Admin can manage content.
- Draft content remains private.

---

## DEP-008 — Production smoke test and security verification

**Depends on:** DEP-007

**Work:**
Run:
- Home.
- Projects.
- Published project.
- Draft project URL must 404.
- Services.
- Process.
- About.
- Explorations.
- Contact inquiry.
- Admin login/logout.
- Admin CRUD sample non-destructive edit.
- Admin media upload/archive.
- Inquiry status update.
- View source/client network to confirm no secret key.
- Anonymous Supabase API attempt:
  - draft read denied;
  - inquiry read denied;
  - inquiry direct insert denied;
  - storage upload denied.
- Check robots and sitemap.
- Check 404.

**Acceptance criteria:**
- All critical paths pass.
- No security boundary is relying on UI alone.

---

## DEP-009 — Post-launch monitoring, backup, rollback, and maintenance checklist

**Depends on:** DEP-008

**Work:**
- Enable Vercel Analytics/Speed Insights verification.
- Monitor Vercel function/build errors.
- Monitor Supabase database/storage usage.
- Document rollback:
  - Vercel: promote previous known-good deployment.
  - Database: never rollback destructive migration by deleting production data; create forward-fix migration unless verified restore is required.
- Schedule content/media audit.
- Keep Next.js on supported patched LTS.
- Keep Supabase client packages updated together and test auth after upgrades.
- Review RLS tests after every schema change.
- Keep production admin accounts minimal.

**Acceptance criteria:**
- A written operational runbook exists.
- Team knows how to rollback application without improvisation.
- Database migrations remain source controlled.

**Commit:** `docs(deploy): add production operations runbook`

---

# 11. DEFINITION OF DONE

The project is complete only when all conditions below are true.

## Public portfolio

- Home identifies the interior designer and signature work.
- All public copy and media are Supabase-driven.
- Projects index is functional.
- Published case studies render all supported section types.
- Draft projects are inaccessible publicly.
- Services, Process, About, Explorations, Contact are functional.
- Motion is restrained and disabled/reduced when requested.
- Mobile is not merely a scaled desktop layout.
- SEO metadata and sitemap are database-driven.
- Core media is optimized.

## Admin CMS

- Admin login/logout works.
- Public registration is absent.
- Admin authorization is server-side and RLS-backed.
- Admin can edit site settings.
- Admin can add/edit/delete/reorder navigation.
- Admin can add/edit/delete/reorder/toggle/publish every page section.
- Admin can create/edit/delete/reorder/publish projects.
- Admin can add/edit/delete/reorder project sections.
- Admin can upload/select/archive media.
- Admin can manage services.
- Admin can manage process steps.
- Admin can manage explorations.
- Admin can manage testimonials.
- Admin can read/update inquiry status and notes.
- Draft project preview works.

## Security/data

- RLS enabled on all public tables.
- Anonymous draft content cannot be read.
- Anonymous inquiries cannot be read.
- Anonymous direct inquiry insert cannot be performed.
- Anonymous storage upload/delete fails.
- Secret Supabase key never reaches browser.
- No secret committed to Git.

## Quality

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run test` passes.
- `npm run test:e2e` passes.
- `npm run build` passes.
- `supabase test db` passes.
- Production smoke test passes.
- No critical console error.

---

# 12. PROMPT TEMPLATE TO GIVE GPT LUNA FOR EACH TASK

Use this prompt verbatim, replacing only `TASK_ID`.

```text
You are implementing one task in an existing Next.js + Supabase project.

TASK TO EXECUTE:
TASK_ID

MANDATORY INPUTS:
1. Read PRD_Portfolio_Interior_Designer_Interactive.md.
2. Read MASTER_IMPLEMENTATION_PLAN_INTERIOR_PORTFOLIO_SUPABASE.md.
3. Read the current repository state before editing.

RULES:
- Execute only TASK_ID. Do not start the next task.
- Respect all source-of-truth routes, database names, environment variable names, enums, JSON schemas, and interfaces in the master plan.
- Do not rename existing interfaces unless TASK_ID explicitly requires it.
- Do not bypass errors with `any`, `@ts-ignore`, disabled ESLint rules, disabled tests, or weakened RLS.
- Do not use the Supabase secret key in browser/client code.
- Do not use `@supabase/auth-helpers-nextjs`.
- Use Server Components by default and Client Components only when required.
- Do not hardcode business content that is defined as CMS-managed.
- Inspect existing utilities/components before creating duplicates.
- If a dependency task is incomplete, stop and report the exact missing dependency instead of improvising.

WORKFLOW:
1. State which files you expect to touch.
2. Implement the smallest complete change for TASK_ID.
3. Add/update tests required by TASK_ID.
4. Run every verification command listed in TASK_ID.
5. Fix all failures caused by your change.
6. Review git diff for accidental unrelated changes.
7. Return:
   - Task ID
   - Summary
   - Files created
   - Files modified
   - Commands run
   - Exact test/build results
   - Remaining blockers
   - Recommended commit message

Do not claim success unless the verification commands have actually passed.
```

---

# 13. RECOMMENDED FIRST EXECUTION ORDER

Start with:

```text
1. FE-001
2. BE-001
3. FE-002
4. BE-002
5. BE-003
6. BE-004
7. BE-005
8. BE-006
9. BE-007
10. BE-008
11. BE-009
12. BE-010
13. BE-011
14. BE-012
15. BE-013
16. BE-014
17. INT-001
18. INT-002
19. INT-003
20. FE-003
21. FE-004
22. FE-005
23. FE-006
24. FE-007
25. FE-008
26. FE-012
27. FE-013
28. FE-014
29. INT-004
30. INT-005
31. INT-006
32. INT-007
33. INT-008
34. FE-009
35. FE-010
36. FE-011
37. FE-015
38. FE-016
39. FE-017
40. INT-009
41. INT-010
42. INT-011
43. INT-012
44. INT-013
45. INT-014
46. INT-015
47. INT-016
48. INT-017
49. FE-018
50. DEP-001
51. DEP-002
52. DEP-003
53. DEP-004
54. DEP-005
55. DEP-006
56. DEP-007
57. DEP-008
58. DEP-009
```

Do not skip BE-009/BE-014. RLS is part of the application architecture, not a deployment afterthought.
