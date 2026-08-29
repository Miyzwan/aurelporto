-- BE-004: global public content tables.

create table public.site_settings (
  id smallint primary key constraint site_settings_singleton_check check (id = 1),
  site_name text not null,
  professional_role text not null,
  location text,
  service_area text,
  email text,
  phone text,
  whatsapp text,
  social_links jsonb not null default '[]'::jsonb,
  footer_text text,
  default_seo_title text not null,
  default_seo_description text not null,
  default_og_media_id uuid,
  inquiry_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  placement text not null constraint navigation_items_placement_check
    check (placement in ('header', 'footer', 'social')),
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  target_blank boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  nav_label text,
  seo_title text,
  seo_description text,
  og_media_id uuid,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  section_key text not null,
  section_type text not null,
  content jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, section_key)
);

create index navigation_items_placement_sort_order_idx
  on public.navigation_items (placement, sort_order);

create index pages_status_idx
  on public.pages (status);

create index page_sections_page_id_sort_order_idx
  on public.page_sections (page_id, sort_order);

create index page_sections_status_idx
  on public.page_sections (status);

create trigger site_settings_set_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

create trigger navigation_items_set_updated_at
before update on public.navigation_items
for each row
execute function public.set_updated_at();

create trigger pages_set_updated_at
before update on public.pages
for each row
execute function public.set_updated_at();

create trigger page_sections_set_updated_at
before update on public.page_sections
for each row
execute function public.set_updated_at();
