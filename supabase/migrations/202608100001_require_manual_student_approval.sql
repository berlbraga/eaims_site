alter table public.profiles alter column is_active set default false;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  normalized_email text := lower(new.email);
  initial_role public.user_role := 'student';
  initial_is_active boolean := false;
begin
  if not public.is_allowed_domain(normalized_email) then
    raise exception 'email domain is not allowed';
  end if;

  if exists (select 1 from public.admin_allowlist where email = normalized_email) then
    initial_role := 'admin';
    initial_is_active := true;
  end if;

  insert into public.profiles (id, email, full_name, role, is_active)
  values (new.id, normalized_email, new.raw_user_meta_data->>'full_name', initial_role, initial_is_active)
  on conflict (id) do update
    set email = excluded.email,
        role = case when exists (select 1 from public.admin_allowlist where email = excluded.email) then 'admin'::public.user_role else public.profiles.role end,
        is_active = case when exists (select 1 from public.admin_allowlist where email = excluded.email) then true else public.profiles.is_active end;
  return new;
end;
$$;

update public.profiles
set is_active = false
where role = 'student';
