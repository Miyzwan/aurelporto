-- BE-009: least-privilege Data API grants and row-level security policies.

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.navigation_items enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.media_assets enable row level security;
alter table public.projects enable row level security;
alter table public.project_sections enable row level security;
alter table public.services enable row level security;
alter table public.process_steps enable row level security;
alter table public.explorations enable row level security;
alter table public.exploration_media enable row level security;
alter table public.testimonials enable row level security;
alter table public.inquiries enable row level security;

revoke all on table
  public.profiles,
  public.site_settings,
  public.navigation_items,
  public.pages,
  public.page_sections,
  public.media_assets,
  public.projects,
  public.project_sections,
  public.services,
  public.process_steps,
  public.explorations,
  public.exploration_media,
  public.testimonials,
  public.inquiries
from anon, authenticated;

revoke all on table public.inquiries from service_role;

grant select on table public.profiles to authenticated;

grant select on table public.site_settings to anon, authenticated;
grant update on table public.site_settings to authenticated;

grant select on table public.navigation_items to anon, authenticated;
grant select, insert, update, delete on table public.navigation_items to authenticated;

grant select on table public.pages to anon, authenticated;
grant select, insert, update, delete on table public.pages to authenticated;

grant select on table public.page_sections to anon, authenticated;
grant select, insert, update, delete on table public.page_sections to authenticated;

grant select on table public.media_assets to anon, authenticated;
grant select, insert, update, delete on table public.media_assets to authenticated;

grant select on table public.projects to anon, authenticated;
grant select, insert, update, delete on table public.projects to authenticated;

grant select on table public.project_sections to anon, authenticated;
grant select, insert, update, delete on table public.project_sections to authenticated;

grant select on table public.services to anon, authenticated;
grant select, insert, update, delete on table public.services to authenticated;

grant select on table public.process_steps to anon, authenticated;
grant select, insert, update, delete on table public.process_steps to authenticated;

grant select on table public.explorations to anon, authenticated;
grant select, insert, update, delete on table public.explorations to authenticated;

grant select on table public.exploration_media to anon, authenticated;
grant select, insert, update, delete on table public.exploration_media to authenticated;

grant select on table public.testimonials to anon, authenticated;
grant select, insert, update, delete on table public.testimonials to authenticated;

grant insert on table public.inquiries to service_role;
grant select, insert, update, delete on table public.inquiries to authenticated;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Anyone can read the singleton site settings"
on public.site_settings
for select
to anon, authenticated
using (id = 1);

create policy "Admins can update site settings"
on public.site_settings
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Anyone can read visible navigation items"
on public.navigation_items
for select
to anon, authenticated
using (is_visible = true);

create policy "Admins can manage navigation items"
on public.navigation_items
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Anyone can read published pages"
on public.pages
for select
to anon, authenticated
using (status = 'published');

create policy "Admins can manage pages"
on public.pages
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Anyone can read enabled sections on published pages"
on public.page_sections
for select
to anon, authenticated
using (
  is_enabled = true
  and status = 'published'
  and exists (
    select 1
    from public.pages
    where pages.id = page_sections.page_id
      and pages.status = 'published'
  )
);

create policy "Admins can manage page sections"
on public.page_sections
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Anyone can read media metadata"
on public.media_assets
for select
to anon, authenticated
using (true);

create policy "Admins can manage media metadata"
on public.media_assets
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Anyone can read published projects"
on public.projects
for select
to anon, authenticated
using (status = 'published');

create policy "Admins can manage projects"
on public.projects
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Anyone can read enabled sections on published projects"
on public.project_sections
for select
to anon, authenticated
using (
  is_enabled = true
  and exists (
    select 1
    from public.projects
    where projects.id = project_sections.project_id
      and projects.status = 'published'
  )
);

create policy "Admins can manage project sections"
on public.project_sections
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Anyone can read published services"
on public.services
for select
to anon, authenticated
using (status = 'published');

create policy "Admins can manage services"
on public.services
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Anyone can read published process steps"
on public.process_steps
for select
to anon, authenticated
using (status = 'published');

create policy "Admins can manage process steps"
on public.process_steps
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Anyone can read published explorations"
on public.explorations
for select
to anon, authenticated
using (status = 'published');

create policy "Admins can manage explorations"
on public.explorations
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Anyone can read media for published explorations"
on public.exploration_media
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.explorations
    where explorations.id = exploration_media.exploration_id
      and explorations.status = 'published'
  )
);

create policy "Admins can manage exploration media"
on public.exploration_media
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Anyone can read published testimonials"
on public.testimonials
for select
to anon, authenticated
using (status = 'published');

create policy "Admins can manage testimonials"
on public.testimonials
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can manage inquiries"
on public.inquiries
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));
