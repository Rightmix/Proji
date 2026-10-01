-- PROJI Stage 5: customer-owned account data (addresses, preferences, saved bowls).
-- Target: the PROJI Supabase project ONLY. Never apply to any RightMix project.
-- Security model: every row is owned by auth.uid(); RLS + column grants enforce it.
-- No staff (admin/rd/kitchen) access is granted to these tables in Stage 5.

-- ---------------------------------------------------------------- profiles
-- Missing-profile recovery: a user may insert ONLY their own profile row.
grant insert (id, full_name, phone) on public.profiles to authenticated;
create policy "profiles: insert own" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));

-- Phone format for new/updated rows (existing rows are not re-validated).
alter table public.profiles
  add constraint profiles_phone_format
  check (phone is null or phone ~ '^\+?[0-9][0-9 ()-]{5,19}$') not valid;

-- ---------------------------------------------------------------- addresses
create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  label text not null default 'home' check (label in ('home', 'work', 'other')),
  custom_label text check (char_length(custom_label) between 1 and 40),
  recipient_name text not null check (char_length(btrim(recipient_name)) between 1 and 120),
  phone text not null check (phone ~ '^\+?[0-9][0-9 ()-]{5,19}$'),
  line1 text not null check (char_length(btrim(line1)) between 1 and 200),
  line2 text check (char_length(line2) <= 200),
  area text check (char_length(area) <= 120),
  city text not null check (char_length(btrim(city)) between 1 and 120),
  region text check (char_length(region) <= 120),
  postal_code text check (postal_code ~ '^[A-Za-z0-9 -]{2,12}$'),
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  landmark text check (char_length(landmark) <= 120),
  delivery_instructions text check (char_length(delivery_instructions) <= 300),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customer_addresses_user_idx on public.customer_addresses (user_id, created_at);
create unique index customer_addresses_one_default on public.customer_addresses (user_id) where is_default;

-- Default-address maintenance. SECURITY INVOKER: runs under the caller's RLS.
create or replace function public.customer_addresses_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if (select count(*) from public.customer_addresses where user_id = new.user_id) >= 20 then
      raise exception 'address limit reached' using errcode = 'check_violation';
    end if;
    if not exists (select 1 from public.customer_addresses where user_id = new.user_id) then
      new.is_default := true; -- first address is the default
    end if;
  end if;
  if new.is_default and (tg_op = 'INSERT' or not old.is_default) then
    update public.customer_addresses set is_default = false
      where user_id = new.user_id and id <> new.id and is_default;
  end if;
  return new;
end;
$$;
create trigger customer_addresses_before_write
  before insert or update of is_default on public.customer_addresses
  for each row execute function public.customer_addresses_before_write();

create or replace function public.customer_addresses_after_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.is_default then
    update public.customer_addresses set is_default = true
      where id = (select id from public.customer_addresses
                  where user_id = old.user_id order by updated_at desc, created_at desc limit 1);
  end if;
  return null;
end;
$$;
create trigger customer_addresses_after_delete
  after delete on public.customer_addresses
  for each row execute function public.customer_addresses_after_delete();

create trigger customer_addresses_touch_updated_at
  before update on public.customer_addresses
  for each row execute function public.touch_updated_at();

-- Atomic default switch for the caller's own address (SECURITY INVOKER).
create or replace function public.set_default_address(address_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from public.customer_addresses where id = address_id) then
    raise exception 'address not found' using errcode = 'no_data_found';
  end if;
  update public.customer_addresses set is_default = true where id = address_id;
end;
$$;
revoke all on function public.set_default_address(uuid) from public, anon;
grant execute on function public.set_default_address(uuid) to authenticated;

-- ---------------------------------------------------------------- preferences
-- Minimal, ordering-relevant only. No health, medical or wellness data.
create table public.customer_preferences (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  spice_level text check (spice_level in ('mild', 'medium', 'hot')),
  include_cutlery boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger customer_preferences_touch_updated_at
  before update on public.customer_preferences
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- saved bowls
-- Stores Stage 4 BowlConfiguration (ingredient IDs only). Ingredient existence and
-- availability are validated in the app at restore time; the DB enforces the shape.
create or replace function private.is_valid_bowl_configuration(c jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(c) = 'object'
    and (select count(*) from jsonb_object_keys(c)) = 5
    and c ? 'version' and c ? 'baseId' and c ? 'proteinId' and c ? 'flavourIds' and c ? 'toppingIds'
    and c -> 'version' = '1'::jsonb
    and jsonb_typeof(c -> 'baseId') = 'string' and (c ->> 'baseId') ~ '^base\.[a-z0-9]+(-[a-z0-9]+)*$'
    and jsonb_typeof(c -> 'proteinId') = 'string' and (c ->> 'proteinId') ~ '^protein\.[a-z0-9]+(-[a-z0-9]+)*$'
    and jsonb_typeof(c -> 'flavourIds') = 'array' and jsonb_array_length(c -> 'flavourIds') <= 2
    and jsonb_typeof(c -> 'toppingIds') = 'array' and jsonb_array_length(c -> 'toppingIds') <= 3
    and not exists (
      select 1 from jsonb_array_elements(c -> 'flavourIds') e
      where jsonb_typeof(e) <> 'string' or (e #>> '{}') !~ '^flavour\.[a-z0-9]+(-[a-z0-9]+)*$')
    and not exists (
      select 1 from jsonb_array_elements(c -> 'toppingIds') e
      where jsonb_typeof(e) <> 'string' or (e #>> '{}') !~ '^topping\.[a-z0-9]+(-[a-z0-9]+)*$')
    and (select count(distinct e) from jsonb_array_elements(c -> 'flavourIds') e) = jsonb_array_length(c -> 'flavourIds')
    and (select count(distinct e) from jsonb_array_elements(c -> 'toppingIds') e) = jsonb_array_length(c -> 'toppingIds');
$$;
revoke all on function private.is_valid_bowl_configuration(jsonb) from public, anon;
-- Needed so the CHECK constraint can evaluate for the inserting role.
grant execute on function private.is_valid_bowl_configuration(jsonb) to authenticated;

create table public.saved_bowls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  configuration jsonb not null check (private.is_valid_bowl_configuration(configuration)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index saved_bowls_user_idx on public.saved_bowls (user_id, updated_at desc);
create unique index saved_bowls_unique_name on public.saved_bowls (user_id, lower(btrim(name)));

create or replace function public.saved_bowls_before_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.saved_bowls where user_id = new.user_id) >= 50 then
    raise exception 'saved bowl limit reached' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;
create trigger saved_bowls_before_insert
  before insert on public.saved_bowls
  for each row execute function public.saved_bowls_before_insert();
create trigger saved_bowls_touch_updated_at
  before update on public.saved_bowls
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- RLS + grants
alter table public.customer_addresses enable row level security;
alter table public.customer_preferences enable row level security;
alter table public.saved_bowls enable row level security;

revoke all on public.customer_addresses, public.customer_preferences, public.saved_bowls from anon, authenticated;

-- user_id, id and timestamps are never client-writable.
grant select, delete on public.customer_addresses to authenticated;
grant insert (label, custom_label, recipient_name, phone, line1, line2, area, city, region, postal_code,
              country_code, landmark, delivery_instructions, is_default) on public.customer_addresses to authenticated;
grant update (label, custom_label, recipient_name, phone, line1, line2, area, city, region, postal_code,
              country_code, landmark, delivery_instructions, is_default) on public.customer_addresses to authenticated;

grant select, delete on public.customer_preferences to authenticated;
grant insert (spice_level, include_cutlery) on public.customer_preferences to authenticated;
grant update (spice_level, include_cutlery) on public.customer_preferences to authenticated;

grant select, delete on public.saved_bowls to authenticated;
grant insert (name, configuration) on public.saved_bowls to authenticated;
grant update (name, configuration) on public.saved_bowls to authenticated;

create policy "addresses: own rows" on public.customer_addresses
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "preferences: own row" on public.customer_preferences
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "saved_bowls: own rows" on public.saved_bowls
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
