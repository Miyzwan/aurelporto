-- BE-010: public portfolio delivery with admin-only object mutations.
--
-- IMPORTANT: portfolio-public is deliberately public. Never upload confidential
-- plans, budgets, client identities, or unreleased confidential media here.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'portfolio-public',
  'portfolio-public',
  true,
  80 * 1024 * 1024,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm'
  ]::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

revoke insert, update, delete on table storage.objects from anon;

create policy "Anyone can read portfolio objects"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'portfolio-public');

create policy "Admins can upload portfolio objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'portfolio-public'
  and (select public.is_admin())
  and name ~ '^portfolio/[0-9]{4}/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-[a-z0-9][a-z0-9._-]*$'
);

create policy "Admins can update portfolio objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'portfolio-public'
  and (select public.is_admin())
)
with check (
  bucket_id = 'portfolio-public'
  and (select public.is_admin())
  and name ~ '^portfolio/[0-9]{4}/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-[a-z0-9][a-z0-9._-]*$'
);

create policy "Admins can delete portfolio objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'portfolio-public'
  and (select public.is_admin())
  and name ~ '^portfolio/[0-9]{4}/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-[a-z0-9][a-z0-9._-]*$'
);
