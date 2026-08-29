-- BE-006: portfolio projects and ordered case-study sections.

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  year integer not null,
  location text not null,
  project_type text not null,
  area_sqm numeric,
  project_status public.project_status not null,
  client_type text,
  design_role text[] not null default '{}',
  services text[] not null default '{}',
  summary text not null,
  hero_media_id uuid references public.media_assets(id),
  featured boolean not null default false,
  featured_order integer not null default 0,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  og_media_id uuid references public.media_assets(id),
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_sections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  section_key text not null,
  section_type text not null,
  title text,
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, section_key)
);

create index projects_status_sort_order_idx
  on public.projects (status, sort_order);

create index projects_featured_featured_order_idx
  on public.projects (featured, featured_order);

create index projects_project_type_idx
  on public.projects (project_type);

create index projects_year_idx
  on public.projects (year);

create index project_sections_project_id_sort_order_idx
  on public.project_sections (project_id, sort_order);

create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

create trigger project_sections_set_updated_at
before update on public.project_sections
for each row
execute function public.set_updated_at();
