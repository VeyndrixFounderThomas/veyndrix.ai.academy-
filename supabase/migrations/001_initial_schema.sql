-- Veyndrix AI Academy: initial student data model
-- Apply only to a dedicated Supabase project for this academy.
-- Never apply this migration to Luna Next or another project.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  intro text not null default '',
  sort_order integer not null,
  created_at timestamptz not null default now(),
  unique (course_id, sort_order)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  body text not null default '',
  practice_task text not null default '',
  estimated_minutes integer not null default 15 check (estimated_minutes > 0),
  sort_order integer not null,
  is_preview boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, sort_order)
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'paused', 'refunded', 'revoked')),
  enrolled_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (student_id, lesson_id)
);

create index if not exists course_modules_course_order_idx
  on public.course_modules(course_id, sort_order);
create index if not exists lessons_module_order_idx
  on public.lessons(module_id, sort_order);
create index if not exists enrollments_student_course_idx
  on public.enrollments(student_id, course_id);
create index if not exists lesson_progress_student_idx
  on public.lesson_progress(student_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger courses_set_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

create trigger lessons_set_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- SECURITY DEFINER avoids recursive enrollment RLS checks from lesson policies.
create or replace function public.user_has_course_access(target_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.enrollments e
    where e.course_id = target_course_id
      and e.student_id = (select auth.uid())
      and e.status = 'active'
  );
$$;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;

create policy "Students can read their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Students can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Anyone can read published courses"
on public.courses for select
to anon, authenticated
using (is_published = true);

create policy "Anyone can read modules for published courses"
on public.course_modules for select
to anon, authenticated
using (
  exists (
    select 1 from public.courses c
    where c.id = course_id and c.is_published = true
  )
);

create policy "Read preview or enrolled published lessons"
on public.lessons for select
to anon, authenticated
using (
  is_published = true
  and (
    is_preview = true
    or exists (
      select 1
      from public.course_modules m
      where m.id = module_id
        and public.user_has_course_access(m.course_id)
    )
  )
);

create policy "Students can read their own enrollments"
on public.enrollments for select
to authenticated
using ((select auth.uid()) = student_id);

create policy "Students can read their own lesson progress"
on public.lesson_progress for select
to authenticated
using ((select auth.uid()) = student_id);

create policy "Students can add their own lesson progress"
on public.lesson_progress for insert
to authenticated
with check (
  (select auth.uid()) = student_id
  and exists (
    select 1
    from public.lessons l
    join public.course_modules m on m.id = l.module_id
    where l.id = lesson_id
      and l.is_published = true
      and (l.is_preview = true or public.user_has_course_access(m.course_id))
  )
);

create policy "Students can remove their own lesson progress"
on public.lesson_progress for delete
to authenticated
using ((select auth.uid()) = student_id);

-- Intentionally no client-side INSERT/UPDATE policy for enrollments.
-- Enrollment must be granted by a trusted server-side payment webhook or admin action.
-- Never expose the Supabase service-role key in browser code.
