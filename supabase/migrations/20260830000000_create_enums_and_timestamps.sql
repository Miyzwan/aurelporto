-- BE-002: shared status enums and updated_at trigger infrastructure.

create extension if not exists pgcrypto with schema extensions;

create type public.content_status as enum (
  'draft',
  'published',
  'archived'
);

create type public.project_status as enum (
  'concept',
  'ongoing',
  'completed'
);

create type public.inquiry_status as enum (
  'new',
  'contacted',
  'qualified',
  'won',
  'lost',
  'spam'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;
