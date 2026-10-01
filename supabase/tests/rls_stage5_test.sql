-- PROJI Stage 5 RLS/constraint tests. Runs after rls_test.sql (Stage 1) on the same DB.
\set ON_ERROR_STOP on
create or replace function pg_temp.act_as(uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, false);
end $$;

-- Users from Stage 1 fixtures: a=admin, b=alice, c=bob, d=kitchen. Add a user with no profile row.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000e', 'eve@proji.test');
delete from public.profiles where id = '00000000-0000-0000-0000-00000000000e';

create temp table ids (k text primary key, v uuid);
grant all on ids to authenticated;

-- ============ DB-02 anon has nothing
set role anon;
do $$ begin
  begin perform * from public.customer_addresses; raise exception 'FAIL anon read addresses'; exception when insufficient_privilege then null; end;
  begin perform * from public.customer_preferences; raise exception 'FAIL anon read prefs'; exception when insufficient_privilege then null; end;
  begin perform * from public.saved_bowls; raise exception 'FAIL anon read bowls'; exception when insufficient_privilege then null; end;
  begin perform public.set_default_address(gen_random_uuid()); raise exception 'FAIL anon rpc'; exception when insufficient_privilege then null; end;
end $$;
reset role;

-- ============ Alice creates data
select pg_temp.act_as('00000000-0000-0000-0000-00000000000b');
set role authenticated;
do $$ declare a1 uuid; a2 uuid; n int; begin
  insert into public.customer_addresses (label, recipient_name, phone, line1, city, region, postal_code, country_code)
    values ('home', 'Alice', '+91 98470 12345', '12 Beach Rd', 'Kozhikode', 'Kerala', '673001', 'IN') returning id into a1;
  assert (select is_default from public.customer_addresses where id = a1), 'FAIL first address not default';
  assert (select user_id from public.customer_addresses where id = a1) = auth.uid(), 'FAIL user_id default';
  insert into public.customer_addresses (label, recipient_name, phone, line1, area, city, country_code)
    values ('work', 'Alice', '+973 3300 1234', 'Bldg 2411, Road 2832, Block 428', 'Seef', 'Manama', 'BH') returning id into a2;
  assert not (select is_default from public.customer_addresses where id = a2), 'FAIL second address default';
  -- DB-07 switching default via RPC keeps exactly one default
  perform public.set_default_address(a2);
  select count(*) into n from public.customer_addresses where is_default;
  assert n = 1, 'FAIL more than one default';
  assert (select is_default from public.customer_addresses where id = a2), 'FAIL rpc default';
  -- direct update to default also maintains uniqueness
  update public.customer_addresses set is_default = true where id = a1;
  assert (select count(*) from public.customer_addresses where is_default) = 1, 'FAIL direct default switch';
  -- inserting with is_default=true moves default
  insert into public.customer_addresses (label, custom_label, recipient_name, phone, line1, city, country_code, is_default)
    values ('other', 'Gym', 'Alice', '9847012345', 'Gym St', 'Kozhikode', 'IN', true);
  assert (select count(*) from public.customer_addresses where is_default) = 1, 'FAIL insert default';
  insert into ids values ('alice_addr', a1), ('alice_addr2', a2);

  insert into public.customer_preferences (spice_level, include_cutlery) values ('hot', false);
  insert into public.saved_bowls (name, configuration) values ('Gym bowl',
    '{"version":1,"baseId":"base.brown-rice-kanji","proteinId":"protein.kerala-grilled-fish","flavourIds":["flavour.kerala-coconut-sauce"],"toppingIds":["topping.roasted-peanuts","topping.crispy-shallots"]}');
  insert into ids select 'alice_bowl', id from public.saved_bowls;
end $$;
reset role;

-- ============ DB-03/DB-04 Bob cannot touch Alice's data
select pg_temp.act_as('00000000-0000-0000-0000-00000000000c');
set role authenticated;
do $$ declare n int; aid uuid := (select v from ids where k = 'alice_addr'); bid uuid := (select v from ids where k = 'alice_bowl'); begin
  select count(*) into n from public.customer_addresses; assert n = 0, 'FAIL bob sees addresses';
  select count(*) into n from public.customer_preferences; assert n = 0, 'FAIL bob sees prefs';
  select count(*) into n from public.saved_bowls; assert n = 0, 'FAIL bob sees bowls';
  select count(*) into n from public.customer_addresses where id = aid; assert n = 0, 'FAIL bob reads by id';
  update public.customer_addresses set city = 'X' where id = aid; get diagnostics n = row_count; assert n = 0, 'FAIL bob updates address';
  delete from public.customer_addresses where id = aid; get diagnostics n = row_count; assert n = 0, 'FAIL bob deletes address';
  update public.saved_bowls set name = 'pwned' where id = bid; get diagnostics n = row_count; assert n = 0, 'FAIL bob renames bowl';
  delete from public.saved_bowls where id = bid; get diagnostics n = row_count; assert n = 0, 'FAIL bob deletes bowl';
  update public.customer_preferences set spice_level = 'mild'; get diagnostics n = row_count; assert n = 0, 'FAIL bob updates prefs';
  delete from public.customer_preferences; get diagnostics n = row_count; assert n = 0, 'FAIL bob deletes prefs';
  update public.profiles set full_name = 'x' where id = '00000000-0000-0000-0000-00000000000b'; get diagnostics n = row_count; assert n = 0, 'FAIL bob edits alice profile';
  -- DB-08 RPC cannot reach Alice's address
  begin perform public.set_default_address(aid); raise exception 'FAIL bob rpc on alice address';
  exception when no_data_found then null; end;
  -- DB-04 cannot write user_id at all (column not granted), cannot spoof ownership
  begin insert into public.customer_addresses (user_id, recipient_name, phone, line1, city, country_code)
    values ('00000000-0000-0000-0000-00000000000b', 'x', '123456', 'x', 'x', 'IN'); raise exception 'FAIL insert user_id';
  exception when insufficient_privilege then null; end;
  begin update public.saved_bowls set user_id = auth.uid(); raise exception 'FAIL update user_id';
  exception when insufficient_privilege then null; end;
  begin insert into public.customer_preferences (user_id, spice_level) values ('00000000-0000-0000-0000-00000000000b', 'mild'); raise exception 'FAIL prefs user_id';
  exception when insufficient_privilege then null; end;
  begin update public.customer_addresses set created_at = now(); raise exception 'FAIL timestamps writable';
  exception when insufficient_privilege then null; end;
  -- DB-05 cannot create a profile for someone else
  begin insert into public.profiles (id, full_name) values ('00000000-0000-0000-0000-00000000000e', 'spoof'); raise exception 'FAIL profile for other user';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- ============ DB-04 column privileges: ownership/timestamps never client-writable
do $$ declare t text; c text; begin
  foreach t in array array['customer_addresses','customer_preferences','saved_bowls'] loop
    foreach c in array array['user_id','created_at','updated_at'] loop
      assert not has_column_privilege('authenticated', 'public.' || t, c, 'INSERT'), format('FAIL %s.%s insertable', t, c);
      assert not has_column_privilege('authenticated', 'public.' || t, c, 'UPDATE'), format('FAIL %s.%s updatable', t, c);
    end loop;
  end loop;
  assert not has_column_privilege('authenticated', 'public.customer_addresses', 'id', 'UPDATE'), 'FAIL address id updatable';
  assert not has_table_privilege('anon', 'public.saved_bowls', 'SELECT'), 'FAIL anon select grant';
end $$;

-- ============ DB-12 staff roles get no customer data access
select pg_temp.act_as('00000000-0000-0000-0000-00000000000a');
set role authenticated;
do $$ begin
  assert (select count(*) from public.customer_addresses) = 0, 'FAIL admin reads addresses';
  assert (select count(*) from public.saved_bowls) = 0, 'FAIL admin reads bowls';
  assert (select count(*) from public.customer_preferences) = 0, 'FAIL admin reads prefs';
end $$;
reset role;
select pg_temp.act_as('00000000-0000-0000-0000-00000000000d');
set role authenticated;
do $$ begin
  assert (select count(*) from public.customer_addresses) = 0, 'FAIL kitchen reads addresses';
  assert (select count(*) from public.saved_bowls) = 0, 'FAIL kitchen reads bowls';
end $$;
reset role;

-- ============ DB-05 missing-profile recovery (eve)
select pg_temp.act_as('00000000-0000-0000-0000-00000000000e');
set role authenticated;
do $$ begin
  assert (select count(*) from public.profiles) = 0, 'precondition: eve has no profile';
  insert into public.profiles (id, full_name, phone) values (auth.uid(), 'Eve', '+97333001234');
  assert (select count(*) from public.profiles) = 1, 'FAIL eve profile insert';
  begin insert into public.profiles (id) values (auth.uid()); raise exception 'FAIL duplicate profile';
  exception when unique_violation then null; end;
  begin update public.profiles set phone = 'abc' where id = auth.uid(); raise exception 'FAIL phone format';
  exception when check_violation then null; end;
end $$;
reset role;

-- ============ DB-06 / DB-09 / DB-10 constraints (as alice)
select pg_temp.act_as('00000000-0000-0000-0000-00000000000b');
set role authenticated;
create or replace function pg_temp.expect_check(sql text, label text) returns void language plpgsql as $$
begin
  begin execute sql; raise exception 'FAIL % accepted', label;
  exception when check_violation or not_null_violation or unique_violation then null; end;
end $$;
select pg_temp.expect_check($q$insert into public.customer_addresses (label, recipient_name, phone, line1, city, country_code) values ('castle','A','123456','x','x','IN')$q$, 'bad label');
select pg_temp.expect_check($q$insert into public.customer_addresses (recipient_name, phone, line1, city, country_code) values ('A','12-ab','x','x','IN')$q$, 'bad phone');
select pg_temp.expect_check($q$insert into public.customer_addresses (recipient_name, phone, line1, city, country_code) values ('A','123456','x','x','india')$q$, 'bad country');
select pg_temp.expect_check($q$insert into public.customer_addresses (recipient_name, phone, line1, city, country_code) values ('  ','123456','x','x','IN')$q$, 'blank name');
select pg_temp.expect_check($q$insert into public.customer_addresses (recipient_name, phone, city, country_code) values ('A','123456','x','IN')$q$, 'missing line1');
select pg_temp.expect_check($q$insert into public.customer_addresses (recipient_name, phone, line1, city, country_code, postal_code) values ('A','123456','x','x','IN','<script>')$q$, 'bad postal');
select pg_temp.expect_check($q$insert into public.customer_preferences (spice_level) values ('nuclear')$q$, 'spice enum');
select pg_temp.expect_check($q$insert into public.customer_preferences (spice_level) values ('mild')$q$, 'second prefs row');
select pg_temp.expect_check($q$insert into public.saved_bowls (name, configuration) values ('gym BOWL ', '{"version":1,"baseId":"base.millet-kanji","proteinId":"protein.boiled-egg","flavourIds":[],"toppingIds":[]}')$q$, 'duplicate name');
select pg_temp.expect_check($q$insert into public.saved_bowls (name, configuration) values ('', '{"version":1,"baseId":"base.millet-kanji","proteinId":"protein.boiled-egg","flavourIds":[],"toppingIds":[]}')$q$, 'empty name');
select pg_temp.expect_check($q$insert into public.saved_bowls (name, configuration) values ('x1', '[]')$q$, 'array config');
select pg_temp.expect_check($q$insert into public.saved_bowls (name, configuration) values ('x2', '{"version":2,"baseId":"base.millet-kanji","proteinId":"protein.boiled-egg","flavourIds":[],"toppingIds":[]}')$q$, 'bad version');
select pg_temp.expect_check($q$insert into public.saved_bowls (name, configuration) values ('x3', '{"version":1,"baseId":"protein.boiled-egg","proteinId":"protein.boiled-egg","flavourIds":[],"toppingIds":[]}')$q$, 'misfiled base');
select pg_temp.expect_check($q$insert into public.saved_bowls (name, configuration) values ('x4', '{"version":1,"baseId":"base.millet-kanji","proteinId":"protein.boiled-egg","flavourIds":["flavour.a","flavour.b","flavour.c"],"toppingIds":[]}')$q$, '3 flavours');
select pg_temp.expect_check($q$insert into public.saved_bowls (name, configuration) values ('x5', '{"version":1,"baseId":"base.millet-kanji","proteinId":"protein.boiled-egg","flavourIds":[],"toppingIds":["topping.a","topping.b","topping.c","topping.d"]}')$q$, '4 toppings');
select pg_temp.expect_check($q$insert into public.saved_bowls (name, configuration) values ('x6', '{"version":1,"baseId":"base.millet-kanji","proteinId":"protein.boiled-egg","flavourIds":["flavour.a","flavour.a"],"toppingIds":[]}')$q$, 'duplicate flavour');
select pg_temp.expect_check($q$insert into public.saved_bowls (name, configuration) values ('x7', '{"version":1,"baseId":"base.millet-kanji","proteinId":"protein.boiled-egg","flavourIds":[],"toppingIds":[],"price":1}')$q$, 'extra key');
select pg_temp.expect_check($q$insert into public.saved_bowls (name, configuration) values ('x8', '{"version":1,"baseId":"base.millet-kanji","proteinId":"protein.boiled-egg","flavourIds":[1],"toppingIds":[]}')$q$, 'non-string id');
do $$ begin
  -- DB-06 per-user address limit (alice has 3)
  for i in 1..17 loop
    insert into public.customer_addresses (recipient_name, phone, line1, city, country_code) values ('A', '123456', 'L' || i, 'C', 'IN');
  end loop;
  begin insert into public.customer_addresses (recipient_name, phone, line1, city, country_code) values ('A', '123456', 'L21', 'C', 'IN');
    raise exception 'FAIL 21st address';
  exception when check_violation then null; end;
  -- DB-09 per-user saved bowl limit (alice has 1)
  for i in 1..49 loop
    insert into public.saved_bowls (name, configuration) values ('Bowl ' || i,
      '{"version":1,"baseId":"base.millet-kanji","proteinId":"protein.boiled-egg","flavourIds":[],"toppingIds":[]}');
  end loop;
  begin insert into public.saved_bowls (name, configuration) values ('Bowl 51',
      '{"version":1,"baseId":"base.millet-kanji","proteinId":"protein.boiled-egg","flavourIds":[],"toppingIds":[]}');
    raise exception 'FAIL 51st bowl';
  exception when check_violation then null; end;
  -- DB-07 deleting the default promotes another; still exactly one default
  delete from public.customer_addresses where is_default;
  assert (select count(*) from public.customer_addresses where is_default) = 1, 'FAIL default not promoted';
  -- deleting everything leaves zero defaults without error
  delete from public.customer_addresses;
  assert (select count(*) from public.customer_addresses) = 0, 'FAIL delete all';
  -- rename and update own bowl works
  update public.saved_bowls set name = 'Renamed' where id = (select v from ids where k = 'alice_bowl');
  assert (select name from public.saved_bowls where id = (select v from ids where k = 'alice_bowl')) = 'Renamed', 'FAIL rename';
end $$;
reset role;

-- ============ DB-11 auth user deletion cascades
delete from auth.users where id = '00000000-0000-0000-0000-00000000000b';
do $$ begin
  assert (select count(*) from public.saved_bowls where user_id = '00000000-0000-0000-0000-00000000000b') = 0, 'FAIL cascade bowls';
  assert (select count(*) from public.customer_preferences where user_id = '00000000-0000-0000-0000-00000000000b') = 0, 'FAIL cascade prefs';
  assert (select count(*) from public.profiles where id = '00000000-0000-0000-0000-00000000000b') = 0, 'FAIL cascade profile';
end $$;

select 'ALL STAGE 5 RLS TESTS PASSED' as result;
