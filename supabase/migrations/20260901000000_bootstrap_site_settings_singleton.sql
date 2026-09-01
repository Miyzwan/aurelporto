-- The application requires the site_settings singleton (id = 1) to exist: every
-- public page reads it, and /admin/site loads it before it can be edited.
--
-- Admins are granted only select and update on this table (plan section 7), so
-- the row cannot be created through the CMS, and seed.sql is never applied to a
-- hosted project. Without this bootstrap a freshly migrated production database
-- can never obtain site settings at all.
--
-- These are neutral defaults meant to be replaced through /admin/site. They
-- match the values the application already ships as its shell fallback, so no
-- new factual claim is introduced.

insert into public.site_settings (
  id,
  site_name,
  professional_role,
  social_links,
  default_seo_title,
  default_seo_description,
  inquiry_config
)
values (
  1,
  'Gabrielle Aurelia Sulistya',
  'Interior Designer & Spatial Visualizer',
  '[]'::jsonb,
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
  }'::jsonb
)
on conflict (id) do nothing;
