-- =============================================================================
-- Team Task Manager — LOCAL SETUP (paste entire file in Supabase → SQL → Run)
-- =============================================================================
-- OPTIONAL — wipe app tables only (run separately if you need a clean DB):
--   drop table if exists public.tasks cascade;
--   drop table if exists public.projects cascade;
--   drop table if exists public.profiles cascade;
-- =============================================================================
-- BEFORE RUNNING:
--   • Authentication → Providers → Email → ON
--   • Same screen → turn OFF "Confirm email" (instant login after sign-up)
-- FRONTEND .env:
--   • VITE_SUPABASE_URL = https://xxxx.supabase.co  (Project URL, NOT postgresql://)
--   • VITE_SUPABASE_ANON_KEY = long JWT starting with eyJ... (Settings → API → anon public)
-- =============================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- TABLES (assignment shape)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  role text not null default 'member' check (role in ('admin', 'member'))
);

create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_by uuid references public.profiles (id) on delete set null
);

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text default '',
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  assigned_to uuid not null references public.profiles (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  due_date date
);

-- ---------------------------------------------------------------------------
-- PROFILE ROW (called from app after login — avoids browser INSERT + RLS issues)
-- First user in empty DB → admin; everyone else → member
-- ---------------------------------------------------------------------------
create or replace function public.ensure_my_profile(display_name text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cnt int;
  uid uuid;
begin
  -- Per-row / stable evaluation — bare auth.uid() can be NULL incorrectly in plpgsql + SECURITY DEFINER.
  uid := (select auth.uid());
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.profiles where id = uid) then
    return;
  end if;

  select count(*)::int into cnt from public.profiles;

  insert into public.profiles (id, name, role)
  values (
    uid,
    coalesce(nullif(trim(display_name), ''), 'User'),
    case when cnt = 0 then 'admin' else 'member' end
  );
exception
  when unique_violation then
    null;
end;
$$;

grant execute on function public.ensure_my_profile(text) to authenticated;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

-- --- profiles
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on public.profiles for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- --- projects
drop policy if exists "projects_select" on public.projects;
drop policy if exists "projects_insert_admin" on public.projects;

create policy "projects_select"
  on public.projects for select to authenticated using (true);

create policy "projects_insert_admin"
  on public.projects for insert to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- --- tasks
drop policy if exists "tasks_select" on public.tasks;
drop policy if exists "tasks_insert_admin" on public.tasks;
drop policy if exists "tasks_update" on public.tasks;

create policy "tasks_select"
  on public.tasks for select to authenticated using (true);

create policy "tasks_insert_admin"
  on public.tasks for insert to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "tasks_update"
  on public.tasks for update to authenticated
  using (
    assigned_to = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    assigned_to = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- GRANTS
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
