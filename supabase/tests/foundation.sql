-- Run against a disposable Supabase database after applying the migration.
-- All fixtures roll back. Never target an unrelated production database.
begin;
insert into auth.users(id, email) values
 ('11111111-1111-4111-8111-111111111111','organizer@example.invalid'),
 ('22222222-2222-4222-8222-222222222222','judge@example.invalid'),
 ('33333333-3333-4333-8333-333333333333','other-admin@example.invalid');
insert into public.platform_organizers(user_id) values('11111111-1111-4111-8111-111111111111');
insert into public.competitions(id,slug,title,edition,is_public) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','test-public','Public test','Test A',true),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','test-private','Private test','Test B',false);
insert into public.competition_memberships(competition_id,user_id,role) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','admin'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222','judge'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','33333333-3333-4333-8333-333333333333','admin');
insert into public.teams(competition_id,name,code,school_name,is_public) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Visible team','VISIBLE','Test school',true),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Private team','PRIVATE','Test school',false),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Other edition','OTHER','Test school',true);
insert into public.awards(competition_id,title,is_public) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Public award',true),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Private award',false);
insert into public.announcements(competition_id,title,body,published_at) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Published update','Test body',now()),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Future update','Test body',now()+interval '1 day'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Draft update','Test body',null);

set local role anon;
do $$ begin
  assert (select count(*) from public.competitions) = 1, 'anon sees public edition only';
  assert (select count(*) from public.teams) = 1, 'anon sees public team in public edition only';
  assert (select count(*) from public.awards) = 1, 'anon cannot see private awards';
  assert (select count(*) from public.announcements) = 1, 'anon cannot see drafts or scheduled updates';
  begin
    insert into public.teams(competition_id,name,code,school_name) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Unauthorized','NO','School');
    raise exception 'anon write unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
set local role authenticated;
do $$ begin
  assert (select count(*) from public.competition_memberships) = 1, 'judge sees own membership only';
  assert (select count(*) from public.teams) = 1, 'judge cannot list private team data without assignment';
  assert (select count(*) from public.audit_logs) = 0, 'judge cannot read audit history';
  assert (select count(*) from public.platform_organizers) = 0, 'judge cannot enumerate organizers';
  update public.competitions set title = 'Unauthorized' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  assert not found, 'judge cannot modify competition';
  begin
    perform public.create_competition('No access','not-allowed','Test','','');
    raise exception 'judge competition creation unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.competition_memberships(competition_id,user_id,role) values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','admin');
    raise exception 'self-promotion unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
set local role authenticated;
do $$ declare created uuid; begin
  assert (select count(*) from public.teams) = 2, 'admin sees private data in their own edition';
  assert not public.is_competition_admin('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'), 'admin scope is not global';
  update public.competitions set title='Cross edition' where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  assert not found, 'cross-edition update denied';
  update public.teams set bio='Approved public profile' where code='PRIVATE';
  assert found, 'own-edition update succeeds';
  assert exists(select 1 from public.audit_logs where actor_id='11111111-1111-4111-8111-111111111111' and operation='UPDATE' and entity_table='teams'), 'changes record authenticated actor';
  begin
    update public.teams set competition_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' where code='PRIVATE';
    raise exception 'moving ownership unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  begin
    update public.audit_logs set entity_table='tampered';
    raise exception 'audit tampering unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  created := public.create_competition('New private edition','created-via-rpc','Test C','','');
  assert public.is_competition_admin(created), 'creator receives admin membership atomically';
  assert exists(select 1 from public.competitions where id=created and not is_public), 'new edition is private';
  update public.competitions set is_public=false where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
end $$;
reset role;
set local request.jwt.claim.sub = '';
set local role anon;
do $$ begin
  assert (select count(*) from public.competitions) = 0, 'unpublishing removes anonymous edition reads';
  assert (select count(*) from public.teams) = 0, 'unpublishing edition also hides children';
  assert (select count(*) from public.announcements) = 0, 'unpublishing also hides announcements';
end $$;
reset role;
rollback;
