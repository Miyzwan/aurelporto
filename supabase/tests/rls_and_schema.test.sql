-- BE-014: regression coverage for public visibility, admin mutations, and
-- schema constraints. Every fixture is rolled back at the end of the suite.

-- pgTAP ships with local development but must be enabled on hosted projects
-- before `supabase test db --linked` can run. Keep this outside the suite
-- transaction so the enablement persists across runs.
create extension if not exists pgtap with schema extensions;

begin;

select plan(16);

insert into auth.users (id, email)
values
  ('00000000-0000-0000-0000-000000014101', 'be014-admin@example.test'),
  ('00000000-0000-0000-0000-000000014102', 'be014-nonadmin@example.test');

insert into public.profiles (id, role, display_name)
values (
  '00000000-0000-0000-0000-000000014101',
  'admin',
  'BE-014 Admin'
);

select throws_ok(
  $$insert into public.site_settings (
      id,
      site_name,
      professional_role,
      default_seo_title,
      default_seo_description
    ) values (
      2,
      'Invalid Settings',
      'Invalid Role',
      'Invalid SEO Title',
      'Invalid SEO Description'
    )$$,
  '23514',
  null,
  'site_settings accepts only the singleton id'
);

insert into public.pages (id, slug, title, status)
values (
  '00000000-0000-0000-0000-000000014201',
  'be014-duplicate-page',
  'BE-014 Duplicate Fixture',
  'draft'
);

select throws_ok(
  $$insert into public.pages (slug, title, status)
    values ('be014-duplicate-page', 'Duplicate Slug', 'draft')$$,
  '23505',
  null,
  'page slugs are unique'
);

insert into public.projects (
  id,
  slug,
  title,
  year,
  location,
  project_type,
  project_status,
  summary,
  status
)
values (
  '00000000-0000-0000-0000-000000014301',
  'be014-cascade-project',
  'BE-014 Cascade Project',
  2026,
  'Test Location',
  'test',
  'concept',
  'A temporary project used to verify project section cascading deletes.',
  'draft'
);

insert into public.project_sections (
  id,
  project_id,
  section_key,
  section_type
)
values (
  '00000000-0000-0000-0000-000000014302',
  '00000000-0000-0000-0000-000000014301',
  'be014-cascade-section',
  'rich_text'
);

select results_eq(
  $$delete from public.projects
    where id = '00000000-0000-0000-0000-000000014301'
    returning id$$,
  $$values ('00000000-0000-0000-0000-000000014301'::uuid)$$,
  'deleting a project succeeds'
);

select is_empty(
  $$select id
    from public.project_sections
    where id = '00000000-0000-0000-0000-000000014302'$$,
  'project section deletion cascades from its parent project'
);

insert into public.media_assets (
  id,
  storage_path,
  media_type,
  alt_text,
  mime_type
)
values (
  '00000000-0000-0000-0000-000000014401',
  'portfolio/2026/00000000-0000-0000-0000-000000014401-be014.jpg',
  'image',
  'BE-014 cascade fixture',
  'image/jpeg'
);

insert into public.explorations (
  id,
  slug,
  title,
  category,
  status
)
values (
  '00000000-0000-0000-0000-000000014402',
  'be014-cascade-exploration',
  'BE-014 Cascade Exploration',
  'test',
  'draft'
);

insert into public.exploration_media (
  id,
  exploration_id,
  media_id
)
values (
  '00000000-0000-0000-0000-000000014403',
  '00000000-0000-0000-0000-000000014402',
  '00000000-0000-0000-0000-000000014401'
);

delete from public.explorations
where id = '00000000-0000-0000-0000-000000014402';

select is_empty(
  $$select id
    from public.exploration_media
    where id = '00000000-0000-0000-0000-000000014403'$$,
  'exploration media deletion cascades from its parent exploration'
);

insert into public.pages (id, slug, title, status)
values
  (
    '00000000-0000-0000-0000-000000014501',
    'be014-public-page-published',
    'BE-014 Published Page',
    'published'
  ),
  (
    '00000000-0000-0000-0000-000000014502',
    'be014-public-page-draft',
    'BE-014 Draft Page',
    'draft'
  );

insert into public.projects (
  id,
  slug,
  title,
  year,
  location,
  project_type,
  project_status,
  summary,
  status
)
values
  (
    '00000000-0000-0000-0000-000000014503',
    'be014-public-project-published',
    'BE-014 Published Project',
    2026,
    'Test Location',
    'test',
    'completed',
    'A temporary published project fixture.',
    'published'
  ),
  (
    '00000000-0000-0000-0000-000000014504',
    'be014-public-project-draft',
    'BE-014 Draft Project',
    2026,
    'Test Location',
    'test',
    'concept',
    'A temporary draft project fixture.',
    'draft'
  );

insert into public.services (id, slug, name, short_description, status)
values
  (
    '00000000-0000-0000-0000-000000014505',
    'be014-public-service-published',
    'BE-014 Published Service',
    'A temporary published service fixture.',
    'published'
  ),
  (
    '00000000-0000-0000-0000-000000014506',
    'be014-public-service-draft',
    'BE-014 Draft Service',
    'A temporary draft service fixture.',
    'draft'
  );

set local role anon;

select results_eq(
  $$select slug
    from public.pages
    where slug like 'be014-public-page-%'
    order by slug$$,
  $$values ('be014-public-page-published')$$,
  'anon reads published pages but not draft pages'
);

select results_eq(
  $$select slug
    from public.projects
    where slug like 'be014-public-project-%'
    order by slug$$,
  $$values ('be014-public-project-published')$$,
  'anon reads published projects but not draft projects'
);

select results_eq(
  $$select slug
    from public.services
    where slug like 'be014-public-service-%'
    order by slug$$,
  $$values ('be014-public-service-published')$$,
  'anon reads published services but not draft services'
);

select throws_ok(
  $$insert into public.inquiries (
      name,
      email,
      project_type,
      project_location,
      required_service,
      project_status,
      desired_timeline,
      project_brief
    ) values (
      'BE-014 Anonymous',
      'be014-anon@example.test',
      'test',
      'Test Location',
      'test',
      'exploring',
      'flexible',
      'This insert must be rejected for anon.'
    )$$,
  '42501',
  null,
  'anon cannot insert inquiries'
);

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000014102';

select throws_ok(
  $$insert into public.pages (slug, title, status)
    values ('be014-nonadmin-page', 'Non-admin Page', 'draft')$$,
  '42501',
  null,
  'authenticated non-admin cannot mutate pages'
);

select throws_ok(
  $$insert into public.projects (
      slug,
      title,
      year,
      location,
      project_type,
      project_status,
      summary,
      status
    ) values (
      'be014-nonadmin-project',
      'Non-admin Project',
      2026,
      'Test Location',
      'test',
      'concept',
      'This insert must be rejected for a non-admin.',
      'draft'
    )$$,
  '42501',
  null,
  'authenticated non-admin cannot mutate projects'
);

select throws_ok(
  $$insert into public.services (slug, name, short_description, status)
    values ('be014-nonadmin-service', 'Non-admin Service', 'Rejected insert', 'draft')$$,
  '42501',
  null,
  'authenticated non-admin cannot mutate services'
);

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000014101';

select results_eq(
  $$insert into public.pages (slug, title, status)
    values ('be014-admin-page', 'Admin Page', 'draft')
    returning slug$$,
  $$values ('be014-admin-page')$$,
  'admin can mutate pages'
);

select results_eq(
  $$insert into public.projects (
      slug,
      title,
      year,
      location,
      project_type,
      project_status,
      summary,
      status
    ) values (
      'be014-admin-project',
      'Admin Project',
      2026,
      'Test Location',
      'test',
      'concept',
      'An admin-created project fixture.',
      'draft'
    )
    returning slug$$,
  $$values ('be014-admin-project')$$,
  'admin can mutate projects'
);

select results_eq(
  $$insert into public.services (slug, name, short_description, status)
    values ('be014-admin-service', 'Admin Service', 'Admin-created fixture', 'draft')
    returning slug$$,
  $$values ('be014-admin-service')$$,
  'admin can mutate services'
);

insert into public.projects (
  id,
  slug,
  title,
  year,
  location,
  project_type,
  project_status,
  summary,
  status
)
values
  (
    '00000000-0000-0000-0000-000000014601',
    'be014-reorder-parent-a',
    'BE-014 Reorder Parent A',
    2026,
    'Test Location',
    'test',
    'concept',
    'Reorder parent A.',
    'draft'
  ),
  (
    '00000000-0000-0000-0000-000000014602',
    'be014-reorder-parent-b',
    'BE-014 Reorder Parent B',
    2026,
    'Test Location',
    'test',
    'concept',
    'Reorder parent B.',
    'draft'
  );

insert into public.project_sections (id, project_id, section_key, section_type)
values
  (
    '00000000-0000-0000-0000-000000014603',
    '00000000-0000-0000-0000-000000014601',
    'be014-parent-a-section',
    'rich_text'
  ),
  (
    '00000000-0000-0000-0000-000000014604',
    '00000000-0000-0000-0000-000000014602',
    'be014-parent-b-section',
    'rich_text'
  );

select throws_ok(
  $$select public.reorder_project_sections(
      '00000000-0000-0000-0000-000000014601'::uuid,
      array['00000000-0000-0000-0000-000000014604'::uuid]
    )$$,
  '22023',
  null,
  'admin cannot reorder a section from the wrong project parent'
);

select * from finish();

rollback;
