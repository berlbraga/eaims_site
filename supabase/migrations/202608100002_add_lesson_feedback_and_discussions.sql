create table if not exists public.lesson_ratings (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, user_id)
);

create table if not exists public.lesson_discussions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.lesson_discussions(id) on delete cascade,
  body text not null check (length(trim(body)) >= 3 and length(body) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lesson_ratings_lesson_idx on public.lesson_ratings(lesson_id, rating);
create index if not exists lesson_discussions_lesson_created_idx on public.lesson_discussions(lesson_id, created_at);
create index if not exists lesson_discussions_parent_idx on public.lesson_discussions(parent_id);

drop trigger if exists set_lesson_ratings_updated_at on public.lesson_ratings;
create trigger set_lesson_ratings_updated_at before update on public.lesson_ratings for each row execute function public.set_updated_at();

drop trigger if exists set_lesson_discussions_updated_at on public.lesson_discussions;
create trigger set_lesson_discussions_updated_at before update on public.lesson_discussions for each row execute function public.set_updated_at();

alter table public.lesson_ratings enable row level security;
alter table public.lesson_discussions enable row level security;

drop policy if exists "Users manage own lesson ratings" on public.lesson_ratings;
create policy "Users manage own lesson ratings" on public.lesson_ratings for all
using (user_id = auth.uid() and public.is_active_user())
with check (user_id = auth.uid() and public.is_active_user());

drop policy if exists "Admins read lesson ratings" on public.lesson_ratings;
create policy "Admins read lesson ratings" on public.lesson_ratings for select using (public.is_admin());

drop policy if exists "Active users read lesson discussions" on public.lesson_discussions;
create policy "Active users read lesson discussions" on public.lesson_discussions for select using (public.is_active_user());

drop policy if exists "Active users insert lesson discussions" on public.lesson_discussions;
create policy "Active users insert lesson discussions" on public.lesson_discussions for insert
with check (user_id = auth.uid() and public.is_active_user());

drop policy if exists "Users update own lesson discussions" on public.lesson_discussions;
create policy "Users update own lesson discussions" on public.lesson_discussions for update
using (user_id = auth.uid() and public.is_active_user())
with check (user_id = auth.uid() and public.is_active_user());

drop policy if exists "Admins manage lesson discussions" on public.lesson_discussions;
create policy "Admins manage lesson discussions" on public.lesson_discussions for all
using (public.is_admin())
with check (public.is_admin());
