-- BE-012: deterministic staging/development content.
--
-- This file is intentionally data-only. It contains no admin account or
-- password, and it must not be treated as production content.

insert into public.site_settings (
  id,
  site_name,
  professional_role,
  location,
  service_area,
  email,
  phone,
  whatsapp,
  social_links,
  footer_text,
  default_seo_title,
  default_seo_description,
  inquiry_config,
  created_at,
  updated_at
)
values (
  1,
  'Gabrielle Aurelia Sulistya',
  'Interior Designer & Spatial Visualizer',
  null,
  null,
  null,
  null,
  null,
  '[]'::jsonb,
  'Interior design work through concept, material, function, and visual storytelling.',
  'Gabrielle Aurelia Sulistya — Interior Designer & Spatial Visualizer',
  'Interior design work exploring concept, material, function, and visual storytelling.',
  '{
    "projectTypes": ["Hospitality", "Retail", "Office", "Furniture", "Other"],
    "projectStatuses": ["New Build", "Renovation", "Furnishing Only", "Still Exploring"],
    "timelineOptions": ["Immediately", "1–3 Months", "3–6 Months", "6+ Months", "Flexible"],
    "budgetOptions": [],
    "showBudgetField": false,
    "showPhoneField": true,
    "successTitle": "Thank you",
    "successBody": "Your project inquiry has been received."
  }'::jsonb,
  '2026-01-01 00:00:00+00'::timestamptz,
  '2026-01-01 00:00:00+00'::timestamptz
);

insert into public.pages (
  id,
  slug,
  title,
  nav_label,
  seo_title,
  seo_description,
  status,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'home',
    'Home',
    'Home',
    'Gabrielle Aurelia Sulistya — Interior Designer & Spatial Visualizer',
    'Interior design work exploring concept, material, function, and visual storytelling.',
    'published'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'projects',
    'Projects',
    'Projects',
    'Projects — Gabrielle Aurelia Sulistya',
    'Selected interior design and spatial visualization work.',
    'published'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'services',
    'Services',
    'Services',
    'Services — Gabrielle Aurelia Sulistya',
    'Design focus areas across interior concepts, visualization, and presentation.',
    'published'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'process',
    'Process',
    'Process',
    'Process — Gabrielle Aurelia Sulistya',
    'A design approach shaped by brief, concept, spatial planning, material, and visualization.',
    'published'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'about',
    'About',
    'About',
    'About — Gabrielle Aurelia Sulistya',
    'Background, capabilities, and interests in interior design and visualization.',
    'published'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    'explorations',
    'Explorations',
    'Explorations',
    'Explorations — Gabrielle Aurelia Sulistya',
    'Furniture and spatial explorations in form, material, and function.',
    'published'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000007',
    'contact',
    'Contact',
    'Contact',
    'Contact — Gabrielle Aurelia Sulistya',
    'Share a project brief or say hello.',
    'published'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  );

insert into public.navigation_items (
  id,
  label,
  href,
  placement,
  sort_order,
  is_visible,
  target_blank,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000101',
    'Projects',
    '/projects',
    'header',
    0,
    true,
    false,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'Services',
    '/services',
    'header',
    1,
    true,
    false,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    'Process',
    '/process',
    'header',
    2,
    true,
    false,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000104',
    'About',
    '/about',
    'header',
    3,
    true,
    false,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000105',
    'Explorations',
    '/explorations',
    'header',
    4,
    true,
    false,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000111',
    'Projects',
    '/projects',
    'footer',
    0,
    true,
    false,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000112',
    'About',
    '/about',
    'footer',
    1,
    true,
    false,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000113',
    'Contact',
    '/contact',
    'footer',
    2,
    true,
    false,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  );

insert into public.page_sections (
  id,
  page_id,
  section_key,
  section_type,
  content,
  settings,
  sort_order,
  is_enabled,
  status,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000001',
    'hero',
    'home_hero',
    '{
      "eyebrow": "Interior Designer & Spatial Visualizer",
      "headline": "Designing spaces through concept, material, function, and visual storytelling.",
      "subheadline": "Interior design work across hospitality, retail, workplace, and furniture — from spatial concept and planning through to interior visualization.",
      "location": "",
      "heroMediaId": null,
      "signatureProjectId": null,
      "primaryCtaLabel": "View Projects",
      "primaryCtaHref": "/projects",
      "secondaryCtaLabel": "About",
      "secondaryCtaHref": "/about"
    }'::jsonb,
    '{}'::jsonb,
    0,
    true,
    'published'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000001',
    'positioning',
    'positioning',
    '{
      "eyebrow": "",
      "lines": ["SPACES BUILT FROM", "CONCEPT, MATERIAL,", "AND SPATIAL STORY."],
      "body": "Each project starts from a clear idea about how a space should be entered, moved through, and remembered."
    }'::jsonb,
    '{}'::jsonb,
    1,
    true,
    'published'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    '00000000-0000-0000-0000-000000000001',
    'featured-projects',
    'featured_projects',
    '{
      "title": "Selected Projects",
      "intro": "",
      "maxItems": 5
    }'::jsonb,
    '{}'::jsonb,
    2,
    true,
    'published'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000204',
    '00000000-0000-0000-0000-000000000001',
    'philosophy',
    'philosophy',
    '{
      "title": "Approach",
      "intro": "",
      "items": [
        {
          "title": "Concept",
          "body": "A spatial idea gives the rest of the decisions something to answer to."
        },
        {
          "title": "Space",
          "body": "Zoning and circulation are resolved on the plan before the space is dressed."
        },
        {
          "title": "Material",
          "body": "Material and colour carry the concept into something you can touch and light."
        },
        {
          "title": "Visualization",
          "body": "3D modelling and rendering make the spatial intent legible to others."
        }
      ]
    }'::jsonb,
    '{}'::jsonb,
    3,
    true,
    'published'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000205',
    '00000000-0000-0000-0000-000000000001',
    'services-preview',
    'services_preview',
    '{
      "title": "Design Focus",
      "intro": "",
      "maxItems": 6
    }'::jsonb,
    '{}'::jsonb,
    4,
    true,
    'published'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000206',
    '00000000-0000-0000-0000-000000000001',
    'process-preview',
    'process_preview',
    '{
      "title": "How the Work Develops",
      "intro": "",
      "maxItems": 10
    }'::jsonb,
    '{}'::jsonb,
    5,
    true,
    'published'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000207',
    '00000000-0000-0000-0000-000000000001',
    'material-moment',
    'material_moment',
    '{
      "title": "Material Studies",
      "intro": "",
      "mediaIds": []
    }'::jsonb,
    '{}'::jsonb,
    6,
    true,
    'published'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000208',
    '00000000-0000-0000-0000-000000000001',
    'credibility',
    'credibility',
    '{
      "title": "Background",
      "stats": [],
      "testimonialIds": []
    }'::jsonb,
    '{}'::jsonb,
    7,
    true,
    'published'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000209',
    '00000000-0000-0000-0000-000000000001',
    'cta',
    'cta',
    '{
      "eyebrow": "",
      "title": "Get in touch.",
      "body": "",
      "ctaLabel": "Contact",
      "ctaHref": "/contact"
    }'::jsonb,
    '{}'::jsonb,
    8,
    true,
    'published'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
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
  featured,
  featured_order,
  sort_order,
  status,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000301',
  'development-sample-project',
  'Development Sample Project',
  2026,
  'Staging',
  'sample',
  'concept'::public.project_status,
  'Development-only sample content for testing the portfolio CMS and project section renderer.',
  false,
  0,
  0,
  'draft'::public.content_status,
  '2026-01-01 00:00:00+00'::timestamptz,
  '2026-01-01 00:00:00+00'::timestamptz
);

insert into public.project_sections (
  id,
  project_id,
  section_key,
  section_type,
  title,
  content,
  sort_order,
  is_enabled,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000311',
    '00000000-0000-0000-0000-000000000301',
    'overview',
    'overview',
    'Overview',
    '{
      "body": "A development-only project row used to verify ordered case-study sections.",
      "mediaIds": []
    }'::jsonb,
    0,
    true,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000312',
    '00000000-0000-0000-0000-000000000301',
    'concept',
    'concept',
    null,
    '{
      "body": "The sample section demonstrates a concept-led narrative without claiming a built outcome.",
      "mediaIds": []
    }'::jsonb,
    1,
    true,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000313',
    '00000000-0000-0000-0000-000000000301',
    'gallery',
    'gallery',
    null,
    '{
      "intro": "",
      "mediaIds": []
    }'::jsonb,
    2,
    true,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  );

insert into public.services (
  id,
  slug,
  name,
  short_description,
  full_description,
  ideal_client,
  scope,
  deliverables,
  included,
  excluded,
  typical_project_types,
  sort_order,
  featured,
  status,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000401',
  'development-service-sample',
  'Development Service Sample',
  'Development-only sample content for testing service queries and ordering.',
  null,
  null,
  '{}'::text[],
  '{}'::text[],
  '{}'::text[],
  '{}'::text[],
  '{}'::text[],
  0,
  false,
  'draft'::public.content_status,
  '2026-01-01 00:00:00+00'::timestamptz,
  '2026-01-01 00:00:00+00'::timestamptz
);

insert into public.process_steps (
  id,
  step_no,
  title,
  description,
  sort_order,
  status,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000501',
    1,
    'Brief & Context',
    'Read the brief, the user, and the context the space has to answer to.',
    0,
    'draft'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  ),
  (
    '00000000-0000-0000-0000-000000000502',
    2,
    'Concept',
    'Set a spatial idea the rest of the decisions can be measured against.',
    1,
    'draft'::public.content_status,
    '2026-01-01 00:00:00+00'::timestamptz,
    '2026-01-01 00:00:00+00'::timestamptz
  );
