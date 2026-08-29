-- BE-005: media metadata and references from global content.

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'portfolio-public',
  storage_path text not null unique,
  media_type text not null constraint media_assets_media_type_check
    check (media_type in ('image', 'video')),
  alt_text text not null,
  caption text,
  photographer text,
  width integer,
  height integer,
  poster_path text,
  mime_type text not null,
  file_size_bytes bigint,
  is_archived boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index media_assets_is_archived_idx
  on public.media_assets (is_archived);

create index media_assets_created_at_idx
  on public.media_assets (created_at desc);

create index media_assets_media_type_idx
  on public.media_assets (media_type);

create trigger media_assets_set_updated_at
before update on public.media_assets
for each row
execute function public.set_updated_at();

alter table public.site_settings
  add constraint site_settings_default_og_media_id_fkey
  foreign key (default_og_media_id)
  references public.media_assets(id)
  on delete set null;

alter table public.pages
  add constraint pages_og_media_id_fkey
  foreign key (og_media_id)
  references public.media_assets(id)
  on delete set null;
