-- Manual rollback for 20260929000001 (PROJI only). DESTRUCTIVE: drops profiles and roles.
-- Requires explicit approval before running against any shared or production environment.
drop trigger if exists on_auth_user_created on auth.users;
drop table if exists public.user_roles;
drop table if exists public.profiles;
drop function if exists public.handle_new_user();
drop function if exists public.touch_updated_at();
drop function if exists public.has_role(public.app_role);
drop type if exists public.app_role;
