-- Phase 1: identity boundaries and competition information. No scoring rules.
begin;

create table public.platform_organizers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (length(slug) <= 80 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(trim(title)) between 1 and 160),
  edition text not null check (length(trim(edition)) between 1 and 60),
  description text not null default '' check (length(description) <= 5000),
  venue text check (length(venue) <= 200),
  starts_at timestamptz,
  timezone text not null default 'America/St_Johns' check (length(timezone) between 1 and 80),
  status text not null default 'draft' check (status in ('draft','active','completed','archived')),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.competition_memberships (
  competition_id uuid not null references public.competitions(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  role text not null check (role in ('admin','judge')),
  created_at timestamptz not null default now(),
  primary key (competition_id, user_id, role)
);
create index memberships_user_idx on public.competition_memberships(user_id, competition_id);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 160),
  code text not null check (length(code) between 1 and 24 and code ~ '^[A-Za-z0-9_-]+$'),
  -- Approved school display snapshot only. Shared school/contact management is Phase 2.
  school_name text not null check (length(trim(school_name)) between 1 and 200),
  bio text not null default '' check (length(bio) <= 5000),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, id)
);
create unique index teams_competition_code_idx on public.teams(competition_id, lower(code));

create table public.awards (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete restrict,
  title text not null check (length(trim(title)) between 1 and 160),
  description text not null default '' check (length(description) <= 5000),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, id)
);
create index awards_competition_idx on public.awards(competition_id);

create table public.stages (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete restrict,
  title text not null check (length(trim(title)) between 1 and 160),
  description text not null default '' check (length(description) <= 5000),
  starts_at timestamptz,
  sort_order integer not null default 0 check (sort_order between 0 and 9999),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, id)
);
create index stages_competition_order_idx on public.stages(competition_id, sort_order);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete restrict,
  title text not null check (length(trim(title)) between 1 and 160),
  body text not null check (length(trim(body)) between 1 and 5000),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, id)
);
create index announcements_competition_published_idx on public.announcements(competition_id, published_at desc);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  competition_id uuid references public.competitions(id) on delete restrict,
  actor_id uuid,
  entity_table text not null,
  entity_id text not null,
  operation text not null check (operation in ('INSERT','UPDATE','DELETE')),
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
create index audit_competition_time_idx on public.audit_logs(competition_id, created_at desc);

-- Narrow helpers avoid recursive RLS on membership lookups.
create function public.is_competition_admin(p_competition uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.competition_memberships where competition_id = p_competition and user_id = (select auth.uid()) and role = 'admin');
$$;
create function public.is_competition_member(p_competition uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.competition_memberships where competition_id = p_competition and user_id = (select auth.uid()));
$$;
revoke all on function public.is_competition_admin(uuid), public.is_competition_member(uuid) from public;
grant execute on function public.is_competition_admin(uuid), public.is_competition_member(uuid) to anon, authenticated;

alter table public.platform_organizers enable row level security;
alter table public.competition_memberships enable row level security;
alter table public.competitions enable row level security;
alter table public.teams enable row level security;
alter table public.awards enable row level security;
alter table public.stages enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_logs enable row level security;

create policy organizers_own_read on public.platform_organizers for select to authenticated using (user_id = (select auth.uid()));
create policy membership_read on public.competition_memberships for select to authenticated using (user_id = (select auth.uid()) or public.is_competition_admin(competition_id));
create policy competitions_read on public.competitions for select to anon, authenticated using (is_public or public.is_competition_member(id));
create policy competitions_update on public.competitions for update to authenticated using (public.is_competition_admin(id)) with check (public.is_competition_admin(id));

-- A judge membership never confers general access to private teams or awards.
-- Assignment-specific read policies will be introduced alongside assignments.
create policy teams_read on public.teams for select to anon, authenticated using (public.is_competition_admin(competition_id) or (is_public and exists(select 1 from public.competitions c where c.id = competition_id and c.is_public)));
create policy teams_insert on public.teams for insert to authenticated with check (public.is_competition_admin(competition_id));
create policy teams_update on public.teams for update to authenticated using (public.is_competition_admin(competition_id)) with check (public.is_competition_admin(competition_id));
create policy awards_read on public.awards for select to anon, authenticated using (public.is_competition_admin(competition_id) or (is_public and exists(select 1 from public.competitions c where c.id = competition_id and c.is_public)));
create policy awards_insert on public.awards for insert to authenticated with check (public.is_competition_admin(competition_id));
create policy awards_update on public.awards for update to authenticated using (public.is_competition_admin(competition_id)) with check (public.is_competition_admin(competition_id));
create policy stages_read on public.stages for select to anon, authenticated using (public.is_competition_admin(competition_id) or (is_public and exists(select 1 from public.competitions c where c.id = competition_id and c.is_public)));
create policy stages_insert on public.stages for insert to authenticated with check (public.is_competition_admin(competition_id));
create policy stages_update on public.stages for update to authenticated using (public.is_competition_admin(competition_id)) with check (public.is_competition_admin(competition_id));
create policy announcements_read on public.announcements for select to anon, authenticated using (public.is_competition_admin(competition_id) or (published_at <= now() and exists(select 1 from public.competitions c where c.id = competition_id and c.is_public)));
create policy announcements_insert on public.announcements for insert to authenticated with check (public.is_competition_admin(competition_id));
create policy announcements_update on public.announcements for update to authenticated using (public.is_competition_admin(competition_id)) with check (public.is_competition_admin(competition_id));
create policy audit_admin_read on public.audit_logs for select to authenticated using (public.is_competition_admin(competition_id));

-- Explicit grants: public clients cannot create roles, mint organizers, delete
-- history, or directly insert competitions without atomically assigning ownership.
revoke all on public.platform_organizers, public.competition_memberships, public.competitions, public.teams, public.awards, public.stages, public.announcements, public.audit_logs from anon, authenticated;
grant select on public.competitions, public.teams, public.awards, public.stages, public.announcements to anon, authenticated;
grant select on public.platform_organizers, public.competition_memberships, public.audit_logs to authenticated;
grant update (slug, title, edition, description, venue, starts_at, status, is_public) on public.competitions to authenticated;
grant insert (competition_id, name, code, school_name, bio, is_public), update (name, code, school_name, bio, is_public) on public.teams to authenticated;
grant insert (competition_id, title, description, is_public), update (title, description, is_public) on public.awards to authenticated;
grant insert (competition_id, title, description, starts_at, sort_order, is_public), update (title, description, starts_at, sort_order, is_public) on public.stages to authenticated;
grant insert (competition_id, title, body, published_at), update (title, body, published_at) on public.announcements to authenticated;

create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end;
$$;
revoke all on function public.touch_updated_at() from public;

create function public.record_audit_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare old_row jsonb; new_row jsonb; record_row jsonb; scope uuid;
begin
  if tg_op <> 'INSERT' then old_row := to_jsonb(old); end if;
  if tg_op <> 'DELETE' then new_row := to_jsonb(new); end if;
  record_row := coalesce(new_row, old_row);
  scope := case when tg_table_name = 'competitions' then (record_row->>'id')::uuid else (record_row->>'competition_id')::uuid end;
  insert into public.audit_logs(competition_id, actor_id, entity_table, entity_id, operation, before_data, after_data)
  values(scope, auth.uid(), tg_table_name, coalesce(record_row->>'id', record_row->>'user_id'), tg_op, old_row, new_row);
  return coalesce(new, old);
end;
$$;
revoke all on function public.record_audit_change() from public;

do $$ declare t text; begin
  foreach t in array array['competitions','teams','awards','stages','announcements'] loop
    execute format('create trigger touch_updated before update on public.%I for each row execute function public.touch_updated_at()', t);
    execute format('create trigger audit_change after insert or update or delete on public.%I for each row execute function public.record_audit_change()', t);
  end loop;
end $$;
create trigger membership_audit after insert or update or delete on public.competition_memberships for each row execute function public.record_audit_change();

create function public.create_competition(p_title text, p_slug text, p_edition text, p_description text default '', p_venue text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  if auth.uid() is null or not exists(select 1 from public.platform_organizers where user_id = auth.uid()) then
    raise exception 'Platform organizer access required' using errcode = '42501';
  end if;
  insert into public.competitions(title, slug, edition, description, venue)
  values(trim(p_title), p_slug, trim(p_edition), trim(p_description), p_venue) returning id into new_id;
  insert into public.competition_memberships(competition_id, user_id, role) values(new_id, auth.uid(), 'admin');
  return new_id;
end;
$$;
revoke all on function public.create_competition(text,text,text,text,text) from public;
grant execute on function public.create_competition(text,text,text,text,text) to authenticated;

commit;
