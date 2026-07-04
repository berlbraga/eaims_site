create extension if not exists pgcrypto;

create type public.user_role as enum ('student', 'admin');
create type public.video_provider as enum ('cloudflare_stream', 'external');
create type public.material_type as enum ('pdf', 'slide', 'sheet', 'document', 'image', 'archive', 'code', 'link', 'other');

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.allowed_email_domains (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique check (domain = lower(domain) and domain !~ '^@' and domain ~ '^[a-z0-9-]+(\.[a-z0-9-]+)+$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_allowlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and position('@' in email) > 1),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique check (email = lower(email)),
  full_name text,
  role public.user_role not null default 'student',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_access_at timestamptz
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  cover_image_url text,
  position integer not null default 0 check (position >= 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  position integer not null default 0 check (position >= 0),
  video_provider public.video_provider not null default 'cloudflare_stream',
  video_uid text,
  external_video_url text,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  unique (module_id, slug),
  check ((video_provider = 'cloudflare_stream' and video_uid is not null) or (video_provider = 'external' and external_video_url is not null) or is_published = false)
);

create table public.lesson_materials (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  description text,
  material_type public.material_type not null default 'other',
  storage_path text,
  external_url text,
  file_name text,
  mime_type text,
  file_size bigint check (file_size is null or file_size >= 0),
  position integer not null default 0 check (position >= 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((storage_path is not null)::int + (external_url is not null)::int = 1)
);

create table public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  last_position_seconds integer not null default 0 check (last_position_seconds >= 0),
  is_completed boolean not null default false,
  completed_at timestamptz,
  last_watched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index modules_published_position_idx on public.modules(is_published, position);
create index lessons_module_position_idx on public.lessons(module_id, is_published, position);
create index lesson_materials_lesson_position_idx on public.lesson_materials(lesson_id, is_published, position);
create index lesson_progress_user_idx on public.lesson_progress(user_id, last_watched_at desc);

create trigger set_allowed_email_domains_updated_at before update on public.allowed_email_domains for each row execute function public.set_updated_at();
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_modules_updated_at before update on public.modules for each row execute function public.set_updated_at();
create trigger set_lessons_updated_at before update on public.lessons for each row execute function public.set_updated_at();
create trigger set_lesson_materials_updated_at before update on public.lesson_materials for each row execute function public.set_updated_at();
create trigger set_lesson_progress_updated_at before update on public.lesson_progress for each row execute function public.set_updated_at();

create or replace function public.email_domain(email text)
returns text language sql immutable as $$
  select lower(split_part(email, '@', 2));
$$;

create or replace function public.is_allowed_domain(email text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.allowed_email_domains
    where domain = public.email_domain(email) and is_active = true
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active = true and public.is_allowed_domain(email)
  );
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  normalized_email text := lower(new.email);
  initial_role public.user_role := 'student';
begin
  if not public.is_allowed_domain(normalized_email) then
    raise exception 'email domain is not allowed';
  end if;

  if exists (select 1 from public.admin_allowlist where email = normalized_email) then
    initial_role := 'admin';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (new.id, normalized_email, new.raw_user_meta_data->>'full_name', initial_role)
  on conflict (id) do update
    set email = excluded.email,
        role = case when exists (select 1 from public.admin_allowlist where email = excluded.email) then 'admin'::public.user_role else public.profiles.role end;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.before_user_created_hook(event jsonb)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  requested_email text := lower(event->'user'->>'email');
begin
  if requested_email is null or not public.is_allowed_domain(requested_email) then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Dominio de e-mail nao autorizado.'
      )
    );
  end if;
  return event;
end;
$$;

create or replace function public.prevent_last_active_admin_change()
returns trigger language plpgsql as $$
declare
  active_admins integer;
begin
  if old.role = 'admin' and old.is_active = true and (new.role <> 'admin' or new.is_active = false) then
    select count(*) into active_admins from public.profiles where role = 'admin' and is_active = true;
    if active_admins <= 1 then
      raise exception 'cannot remove the last active admin';
    end if;
  end if;
  return new;
end;
$$;

create trigger prevent_last_active_admin_change before update of role, is_active on public.profiles for each row execute function public.prevent_last_active_admin_change();

alter table public.allowed_email_domains enable row level security;
alter table public.admin_allowlist enable row level security;
alter table public.profiles enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_materials enable row level security;
alter table public.lesson_progress enable row level security;

create policy "Admins manage domains" on public.allowed_email_domains for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage allowlist" on public.admin_allowlist for all using (public.is_admin()) with check (public.is_admin());

create policy "Users read own profile" on public.profiles for select using (id = auth.uid());
create policy "Admins read profiles" on public.profiles for select using (public.is_admin());
create policy "Users update own name" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()) and is_active = (select is_active from public.profiles where id = auth.uid()));
create policy "Admins update profiles" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

create policy "Active users read published modules" on public.modules for select using (public.is_active_user() and is_published = true);
create policy "Admins manage modules" on public.modules for all using (public.is_admin()) with check (public.is_admin());

create policy "Active users read published lessons" on public.lessons for select using (
  public.is_active_user() and is_published = true and exists (select 1 from public.modules m where m.id = module_id and m.is_published = true)
);
create policy "Admins manage lessons" on public.lessons for all using (public.is_admin()) with check (public.is_admin());

create policy "Active users read published materials" on public.lesson_materials for select using (
  public.is_active_user() and is_published = true and exists (
    select 1 from public.lessons l join public.modules m on m.id = l.module_id
    where l.id = lesson_id and l.is_published = true and m.is_published = true
  )
);
create policy "Admins manage materials" on public.lesson_materials for all using (public.is_admin()) with check (public.is_admin());

create policy "Users read own progress" on public.lesson_progress for select using (user_id = auth.uid());
create policy "Users insert own progress" on public.lesson_progress for insert with check (user_id = auth.uid() and public.is_active_user());
create policy "Users update own progress" on public.lesson_progress for update using (user_id = auth.uid()) with check (user_id = auth.uid() and public.is_active_user());
create policy "Admins read progress" on public.lesson_progress for select using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('lesson-materials', 'lesson-materials', false)
on conflict (id) do nothing;

create policy "Admins manage private lesson materials"
on storage.objects for all
using (bucket_id = 'lesson-materials' and public.is_admin())
with check (bucket_id = 'lesson-materials' and public.is_admin());

create policy "Active users can read signed private lesson materials"
on storage.objects for select
using (bucket_id = 'lesson-materials' and public.is_active_user());
