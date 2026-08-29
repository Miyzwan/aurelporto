-- BE-008: project inquiry submissions and qualification metadata.

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  project_type text not null,
  project_location text not null,
  area_sqm numeric,
  required_service text not null,
  project_status text not null,
  desired_timeline text not null,
  budget_range text,
  project_brief text not null,
  referral_source text,
  status public.inquiry_status not null default 'new',
  admin_notes text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inquiries_status_idx
  on public.inquiries (status);

create index inquiries_submitted_at_idx
  on public.inquiries (submitted_at desc);

create index inquiries_email_idx
  on public.inquiries (email);

create trigger inquiries_set_updated_at
before update on public.inquiries
for each row
execute function public.set_updated_at();
