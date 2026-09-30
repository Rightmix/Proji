-- PROJI Stage 1 RLS tests. Every assertion raises on failure (psql ON_ERROR_STOP).
\set ON_ERROR_STOP on
create or replace function pg_temp.act_as(uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, false);
end $$;

-- Fixtures (as superuser, simulating Supabase Auth sign-ups)
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'admin@proji.test'),
  ('00000000-0000-0000-0000-00000000000b', 'alice@proji.test'),
  ('00000000-0000-0000-0000-00000000000c', 'bob@proji.test'),
  ('00000000-0000-0000-0000-00000000000d', 'cook@proji.test');

do $$ begin
  assert (select count(*) from public.profiles) = 4, 'trigger creates a profile per user';
  assert (select count(*) from public.user_roles where role = 'customer') = 4, 'every new user defaults to customer';
  assert (select count(*) from public.user_roles where role <> 'customer') = 0, 'no privileged role on sign-up';
end $$;
-- Bootstrap: first admin and kitchen staff are granted out-of-band by the project owner.
insert into public.user_roles (user_id, role) values
  ('00000000-0000-0000-0000-00000000000a', 'admin'),
  ('00000000-0000-0000-0000-00000000000d', 'kitchen');

-- 1. anon sees nothing
set role anon;
do $$ begin
  begin perform * from public.profiles; raise exception 'FAIL anon read profiles';
  exception when insufficient_privilege then null; end;
  begin perform * from public.user_roles; raise exception 'FAIL anon read user_roles';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- 2. customer (alice)
select pg_temp.act_as('00000000-0000-0000-0000-00000000000b');
set role authenticated;
do $$ declare n int; begin
  select count(*) into n from public.profiles;
  assert n = 1, format('FAIL customer sees %s profiles, expected 1 (own)', n);
  select count(*) into n from public.profiles where id = '00000000-0000-0000-0000-00000000000c';
  assert n = 0, 'FAIL cross-user profile read';
  select count(*) into n from public.user_roles;
  assert n = 1, 'FAIL customer sees other users roles';
  update public.profiles set full_name = 'Alice' where id = '00000000-0000-0000-0000-00000000000b';
  update public.profiles set full_name = 'Hacked' where id = '00000000-0000-0000-0000-00000000000c';
  get diagnostics n = row_count;
  assert n = 0, 'FAIL customer updated another profile';
  begin
    update public.profiles set id = '00000000-0000-0000-0000-00000000000c' where id = '00000000-0000-0000-0000-00000000000b';
    raise exception 'FAIL customer changed profile id';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.user_roles (user_id, role, granted_by)
      values ('00000000-0000-0000-0000-00000000000b', 'admin', '00000000-0000-0000-0000-00000000000b');
    raise exception 'FAIL customer self-granted admin';
  exception when insufficient_privilege then null; end;
  begin
    update public.user_roles set role = 'admin' where user_id = '00000000-0000-0000-0000-00000000000b';
    raise exception 'FAIL customer updated own role';
  exception when insufficient_privilege then null; end;
  delete from public.user_roles where user_id = '00000000-0000-0000-0000-00000000000a';
  get diagnostics n = row_count;
  assert n = 0, 'FAIL customer deleted admin role';
  assert not private.has_role('admin'), 'FAIL has_role(admin) true for customer';
end $$;
reset role;

-- 3. kitchen (cook) cannot use admin capabilities
select pg_temp.act_as('00000000-0000-0000-0000-00000000000d');
set role authenticated;
do $$ declare n int; begin
  assert private.has_role('kitchen'), 'FAIL kitchen role missing';
  select count(*) into n from public.profiles; assert n = 1, 'FAIL kitchen reads all profiles';
  begin
    insert into public.user_roles (user_id, role, granted_by)
      values ('00000000-0000-0000-0000-00000000000d', 'admin', '00000000-0000-0000-0000-00000000000d');
    raise exception 'FAIL kitchen self-granted admin';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.user_roles (user_id, role, granted_by)
      values ('00000000-0000-0000-0000-00000000000b', 'kitchen', '00000000-0000-0000-0000-00000000000d');
    raise exception 'FAIL kitchen granted roles to others';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- 4. admin can read all and grant/revoke roles, but not spoof granted_by or revoke own roles
select pg_temp.act_as('00000000-0000-0000-0000-00000000000a');
set role authenticated;
do $$ declare n int; begin
  select count(*) into n from public.profiles; assert n = 4, 'FAIL admin cannot read all profiles';
  insert into public.user_roles (user_id, role, granted_by)
    values ('00000000-0000-0000-0000-00000000000c', 'rd', '00000000-0000-0000-0000-00000000000a');
  begin
    insert into public.user_roles (user_id, role, granted_by)
      values ('00000000-0000-0000-0000-00000000000c', 'kitchen', '00000000-0000-0000-0000-00000000000b');
    raise exception 'FAIL admin spoofed granted_by';
  exception when insufficient_privilege then null; end;
  delete from public.user_roles where user_id = '00000000-0000-0000-0000-00000000000c' and role = 'rd';
  get diagnostics n = row_count; assert n = 1, 'FAIL admin could not revoke';
  delete from public.user_roles where user_id = '00000000-0000-0000-0000-00000000000a' and role = 'admin';
  get diagnostics n = row_count; assert n = 0, 'FAIL admin revoked own admin';
  update public.profiles set full_name = 'x' where id = '00000000-0000-0000-0000-00000000000b';
  get diagnostics n = row_count;
  assert n = 0, 'FAIL admin edited another profile';
end $$;
reset role;

select 'ALL RLS TESTS PASSED' as result;
