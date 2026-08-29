-- BE-007: services, process, explorations, and testimonials.

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text not null,
  full_description text,
  ideal_client text,
  scope text[] not null default '{}',
  deliverables text[] not null default '{}',
  included text[] not null default '{}',
  excluded text[] not null default '{}',
  typical_project_types text[] not null default '{}',
  media_id uuid references public.media_assets(id),
  sort_order integer not null default 0,
  featured boolean not null default false,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.process_steps (
  id uuid primary key default gen_random_uuid(),
  step_no integer not null,
  title text not null,
  description text not null,
  media_id uuid references public.media_assets(id),
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.explorations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  description text,
  year integer,
  cover_media_id uuid references public.media_assets(id),
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exploration_media (
  id uuid primary key default gen_random_uuid(),
  exploration_id uuid not null references public.explorations(id) on delete cascade,
  media_id uuid not null references public.media_assets(id),
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (exploration_id, media_id)
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_role text,
  project_name text,
  quote text not null,
  sort_order integer not null default 0,
  featured boolean not null default false,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index services_status_sort_order_idx
  on public.services (status, sort_order);

create index services_featured_sort_order_idx
  on public.services (featured, sort_order);

create index process_steps_status_sort_order_idx
  on public.process_steps (status, sort_order);

create index process_steps_step_no_sort_order_idx
  on public.process_steps (step_no, sort_order);

create index explorations_status_sort_order_idx
  on public.explorations (status, sort_order);

create index explorations_category_idx
  on public.explorations (category);

create index exploration_media_exploration_sort_order_idx
  on public.exploration_media (exploration_id, sort_order);

create index testimonials_status_sort_order_idx
  on public.testimonials (status, sort_order);

create index testimonials_featured_sort_order_idx
  on public.testimonials (featured, sort_order);

create trigger services_set_updated_at
before update on public.services
for each row
execute function public.set_updated_at();

create trigger process_steps_set_updated_at
before update on public.process_steps
for each row
execute function public.set_updated_at();

create trigger explorations_set_updated_at
before update on public.explorations
for each row
execute function public.set_updated_at();

create trigger testimonials_set_updated_at
before update on public.testimonials
for each row
execute function public.set_updated_at();
