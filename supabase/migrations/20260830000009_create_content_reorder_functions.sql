-- BE-011: atomic, admin-only reorder RPCs for ordered portfolio content.
--
-- These functions intentionally remain SECURITY INVOKER. The explicit admin
-- guard gives callers a deterministic authorization error, while table
-- updates still execute in the caller's RLS context.

create function public.reorder_navigation_items(item_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  matched_count integer;
begin
  if not (select public.is_admin()) then
    raise exception using errcode = '42501', message = 'Admin access is required';
  end if;

  if item_ids is null then
    raise exception using errcode = '22004', message = 'Item IDs cannot be null';
  end if;

  if exists (
    select 1
    from unnest(item_ids) as input(item_id)
    where input.item_id is null
  ) then
    raise exception using errcode = '22004', message = 'Item IDs cannot contain null values';
  end if;

  if exists (
    select input.item_id
    from unnest(item_ids) as input(item_id)
    group by input.item_id
    having count(*) > 1
  ) then
    raise exception using errcode = '22000', message = 'Item IDs cannot contain duplicates';
  end if;

  select count(*)
  into matched_count
  from public.navigation_items
  where id = any(item_ids);

  if matched_count <> cardinality(item_ids) then
    raise exception using errcode = '22023', message = 'One or more navigation item IDs do not exist';
  end if;

  update public.navigation_items as target
  set sort_order = (input.position - 1)::integer
  from unnest(item_ids) with ordinality as input(item_id, position)
  where target.id = input.item_id;
end;
$function$;

create function public.reorder_page_sections(p_page_id uuid, p_section_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  matched_count integer;
begin
  if not (select public.is_admin()) then
    raise exception using errcode = '42501', message = 'Admin access is required';
  end if;

  if p_page_id is null then
    raise exception using errcode = '22004', message = 'Page ID cannot be null';
  end if;

  if p_section_ids is null then
    raise exception using errcode = '22004', message = 'Section IDs cannot be null';
  end if;

  if not exists (select 1 from public.pages where id = p_page_id) then
    raise exception using errcode = '22023', message = 'Page does not exist';
  end if;

  if exists (
    select 1
    from unnest(p_section_ids) as input(section_id)
    where input.section_id is null
  ) then
    raise exception using errcode = '22004', message = 'Section IDs cannot contain null values';
  end if;

  if exists (
    select input.section_id
    from unnest(p_section_ids) as input(section_id)
    group by input.section_id
    having count(*) > 1
  ) then
    raise exception using errcode = '22000', message = 'Section IDs cannot contain duplicates';
  end if;

  select count(*)
  into matched_count
  from public.page_sections
  where page_sections.page_id = p_page_id
    and page_sections.id = any(p_section_ids);

  if matched_count <> cardinality(p_section_ids) then
    raise exception using errcode = '22023', message = 'Section IDs must belong to the selected page';
  end if;

  update public.page_sections as target
  set sort_order = (input.position - 1)::integer
  from unnest(p_section_ids) with ordinality as input(section_id, position)
  where target.id = input.section_id;
end;
$function$;

create function public.reorder_projects(project_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  matched_count integer;
begin
  if not (select public.is_admin()) then
    raise exception using errcode = '42501', message = 'Admin access is required';
  end if;

  if project_ids is null then
    raise exception using errcode = '22004', message = 'Project IDs cannot be null';
  end if;

  if exists (
    select 1
    from unnest(project_ids) as input(project_id)
    where input.project_id is null
  ) then
    raise exception using errcode = '22004', message = 'Project IDs cannot contain null values';
  end if;

  if exists (
    select input.project_id
    from unnest(project_ids) as input(project_id)
    group by input.project_id
    having count(*) > 1
  ) then
    raise exception using errcode = '22000', message = 'Project IDs cannot contain duplicates';
  end if;

  select count(*)
  into matched_count
  from public.projects
  where id = any(project_ids);

  if matched_count <> cardinality(project_ids) then
    raise exception using errcode = '22023', message = 'One or more project IDs do not exist';
  end if;

  update public.projects as target
  set sort_order = (input.position - 1)::integer
  from unnest(project_ids) with ordinality as input(project_id, position)
  where target.id = input.project_id;
end;
$function$;

create function public.reorder_project_sections(p_project_id uuid, p_section_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  matched_count integer;
begin
  if not (select public.is_admin()) then
    raise exception using errcode = '42501', message = 'Admin access is required';
  end if;

  if p_project_id is null then
    raise exception using errcode = '22004', message = 'Project ID cannot be null';
  end if;

  if p_section_ids is null then
    raise exception using errcode = '22004', message = 'Section IDs cannot be null';
  end if;

  if not exists (select 1 from public.projects where id = p_project_id) then
    raise exception using errcode = '22023', message = 'Project does not exist';
  end if;

  if exists (
    select 1
    from unnest(p_section_ids) as input(section_id)
    where input.section_id is null
  ) then
    raise exception using errcode = '22004', message = 'Section IDs cannot contain null values';
  end if;

  if exists (
    select input.section_id
    from unnest(p_section_ids) as input(section_id)
    group by input.section_id
    having count(*) > 1
  ) then
    raise exception using errcode = '22000', message = 'Section IDs cannot contain duplicates';
  end if;

  select count(*)
  into matched_count
  from public.project_sections
  where project_sections.project_id = p_project_id
    and project_sections.id = any(p_section_ids);

  if matched_count <> cardinality(p_section_ids) then
    raise exception using errcode = '22023', message = 'Section IDs must belong to the selected project';
  end if;

  update public.project_sections as target
  set sort_order = (input.position - 1)::integer
  from unnest(p_section_ids) with ordinality as input(section_id, position)
  where target.id = input.section_id;
end;
$function$;

create function public.reorder_services(service_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  matched_count integer;
begin
  if not (select public.is_admin()) then
    raise exception using errcode = '42501', message = 'Admin access is required';
  end if;

  if service_ids is null then
    raise exception using errcode = '22004', message = 'Service IDs cannot be null';
  end if;

  if exists (
    select 1
    from unnest(service_ids) as input(service_id)
    where input.service_id is null
  ) then
    raise exception using errcode = '22004', message = 'Service IDs cannot contain null values';
  end if;

  if exists (
    select input.service_id
    from unnest(service_ids) as input(service_id)
    group by input.service_id
    having count(*) > 1
  ) then
    raise exception using errcode = '22000', message = 'Service IDs cannot contain duplicates';
  end if;

  select count(*)
  into matched_count
  from public.services
  where id = any(service_ids);

  if matched_count <> cardinality(service_ids) then
    raise exception using errcode = '22023', message = 'One or more service IDs do not exist';
  end if;

  update public.services as target
  set sort_order = (input.position - 1)::integer
  from unnest(service_ids) with ordinality as input(service_id, position)
  where target.id = input.service_id;
end;
$function$;

create function public.reorder_process_steps(process_step_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  matched_count integer;
begin
  if not (select public.is_admin()) then
    raise exception using errcode = '42501', message = 'Admin access is required';
  end if;

  if process_step_ids is null then
    raise exception using errcode = '22004', message = 'Process step IDs cannot be null';
  end if;

  if exists (
    select 1
    from unnest(process_step_ids) as input(process_step_id)
    where input.process_step_id is null
  ) then
    raise exception using errcode = '22004', message = 'Process step IDs cannot contain null values';
  end if;

  if exists (
    select input.process_step_id
    from unnest(process_step_ids) as input(process_step_id)
    group by input.process_step_id
    having count(*) > 1
  ) then
    raise exception using errcode = '22000', message = 'Process step IDs cannot contain duplicates';
  end if;

  select count(*)
  into matched_count
  from public.process_steps
  where id = any(process_step_ids);

  if matched_count <> cardinality(process_step_ids) then
    raise exception using errcode = '22023', message = 'One or more process step IDs do not exist';
  end if;

  update public.process_steps as target
  set sort_order = (input.position - 1)::integer
  from unnest(process_step_ids) with ordinality as input(process_step_id, position)
  where target.id = input.process_step_id;
end;
$function$;

create function public.reorder_explorations(exploration_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  matched_count integer;
begin
  if not (select public.is_admin()) then
    raise exception using errcode = '42501', message = 'Admin access is required';
  end if;

  if exploration_ids is null then
    raise exception using errcode = '22004', message = 'Exploration IDs cannot be null';
  end if;

  if exists (
    select 1
    from unnest(exploration_ids) as input(exploration_id)
    where input.exploration_id is null
  ) then
    raise exception using errcode = '22004', message = 'Exploration IDs cannot contain null values';
  end if;

  if exists (
    select input.exploration_id
    from unnest(exploration_ids) as input(exploration_id)
    group by input.exploration_id
    having count(*) > 1
  ) then
    raise exception using errcode = '22000', message = 'Exploration IDs cannot contain duplicates';
  end if;

  select count(*)
  into matched_count
  from public.explorations
  where id = any(exploration_ids);

  if matched_count <> cardinality(exploration_ids) then
    raise exception using errcode = '22023', message = 'One or more exploration IDs do not exist';
  end if;

  update public.explorations as target
  set sort_order = (input.position - 1)::integer
  from unnest(exploration_ids) with ordinality as input(exploration_id, position)
  where target.id = input.exploration_id;
end;
$function$;

create function public.reorder_testimonials(testimonial_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  matched_count integer;
begin
  if not (select public.is_admin()) then
    raise exception using errcode = '42501', message = 'Admin access is required';
  end if;

  if testimonial_ids is null then
    raise exception using errcode = '22004', message = 'Testimonial IDs cannot be null';
  end if;

  if exists (
    select 1
    from unnest(testimonial_ids) as input(testimonial_id)
    where input.testimonial_id is null
  ) then
    raise exception using errcode = '22004', message = 'Testimonial IDs cannot contain null values';
  end if;

  if exists (
    select input.testimonial_id
    from unnest(testimonial_ids) as input(testimonial_id)
    group by input.testimonial_id
    having count(*) > 1
  ) then
    raise exception using errcode = '22000', message = 'Testimonial IDs cannot contain duplicates';
  end if;

  select count(*)
  into matched_count
  from public.testimonials
  where id = any(testimonial_ids);

  if matched_count <> cardinality(testimonial_ids) then
    raise exception using errcode = '22023', message = 'One or more testimonial IDs do not exist';
  end if;

  update public.testimonials as target
  set sort_order = (input.position - 1)::integer
  from unnest(testimonial_ids) with ordinality as input(testimonial_id, position)
  where target.id = input.testimonial_id;
end;
$function$;

revoke execute on function public.reorder_navigation_items(uuid[]) from public, anon;
revoke execute on function public.reorder_page_sections(uuid, uuid[]) from public, anon;
revoke execute on function public.reorder_projects(uuid[]) from public, anon;
revoke execute on function public.reorder_project_sections(uuid, uuid[]) from public, anon;
revoke execute on function public.reorder_services(uuid[]) from public, anon;
revoke execute on function public.reorder_process_steps(uuid[]) from public, anon;
revoke execute on function public.reorder_explorations(uuid[]) from public, anon;
revoke execute on function public.reorder_testimonials(uuid[]) from public, anon;

grant execute on function public.reorder_navigation_items(uuid[]) to authenticated;
grant execute on function public.reorder_page_sections(uuid, uuid[]) to authenticated;
grant execute on function public.reorder_projects(uuid[]) to authenticated;
grant execute on function public.reorder_project_sections(uuid, uuid[]) to authenticated;
grant execute on function public.reorder_services(uuid[]) to authenticated;
grant execute on function public.reorder_process_steps(uuid[]) to authenticated;
grant execute on function public.reorder_explorations(uuid[]) to authenticated;
grant execute on function public.reorder_testimonials(uuid[]) to authenticated;
