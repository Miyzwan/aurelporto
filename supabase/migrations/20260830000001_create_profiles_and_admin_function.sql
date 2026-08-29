-- BE-003: admin profile records and server-side authorization helper.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null constraint profiles_role_admin_check check (role in ('admin')),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  );
$function$;
