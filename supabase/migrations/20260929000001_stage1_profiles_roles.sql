-- PROJI Stage 1: profiles and role-based access control.
-- Target: the PROJI Supabase project ONLY. Never apply to any RightMix project.

create type public.app_role as enum ('customer', 'admin', 'rd', 'kitchen');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  phone text check (char_length(phone) <= 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  granted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);
create index user_roles_role_idx on public.user_roles (role);

-- Role check used by RLS policies. SECURITY DEFINER avoids recursive RLS on user_roles.
create or replace function public.has_role(check_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid()) and ur.role = check_role
  );
$$;
revoke all on function public.has_role(public.app_role) from public;
grant execute on function public.has_role(public.app_role) to authenticated;

-- New auth users get a profile and ONLY the customer role. Privileged roles are granted by admins.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Row Level Security -------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

revoke all on public.profiles, public.user_roles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;
grant select, insert, delete on public.user_roles to authenticated;

create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles: admin reads all" on public.profiles
  for select to authenticated using ((select public.has_role('admin')));
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "user_roles: read own" on public.user_roles
  for select to authenticated using (user_id = (select auth.uid()));
create policy "user_roles: admin reads all" on public.user_roles
  for select to authenticated using ((select public.has_role('admin')));
create policy "user_roles: admin grants" on public.user_roles
  for insert to authenticated
  with check ((select public.has_role('admin')) and granted_by = (select auth.uid()));
-- Admins may revoke roles, but not their own (prevents accidental lock-out).
create policy "user_roles: admin revokes" on public.user_roles
  for delete to authenticated
  using ((select public.has_role('admin')) and user_id <> (select auth.uid()));
