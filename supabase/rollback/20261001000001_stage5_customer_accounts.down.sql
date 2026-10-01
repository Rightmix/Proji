-- Manual rollback for 20261001000001 (PROJI only). DESTRUCTIVE: deletes all addresses,
-- preferences and saved bowls. Back up first; requires explicit approval for any shared env.
drop table if exists public.saved_bowls;
drop function if exists public.saved_bowls_before_insert();
drop function if exists private.is_valid_bowl_configuration(jsonb);
drop table if exists public.customer_preferences;
drop function if exists public.set_default_address(uuid);
drop table if exists public.customer_addresses;
drop function if exists public.customer_addresses_before_write();
drop function if exists public.customer_addresses_after_delete();
alter table public.profiles drop constraint if exists profiles_phone_format;
drop policy if exists "profiles: insert own" on public.profiles;
revoke insert on public.profiles from authenticated;
