-- SnapTab v1 initial schema
-- Free-tier friendly: tables + CHECKs + indexes + RLS + realtime + transactional RPCs + pg_cron TTL.

create extension if not exists "pgcrypto";
create extension if not exists "pg_cron";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  total_tax numeric(10, 2) not null default 0,
  total_tip numeric(10, 2) not null default 0,
  total_delivery_fee numeric(10, 2) not null default 0,
  currency_code text not null default 'USD',
  status text not null default 'active',
  host_participant_id uuid,
  payment_handles jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint sessions_title_len check (char_length(title) between 1 and 60),
  constraint sessions_currency_len check (char_length(currency_code) between 2 and 8),
  constraint sessions_status_valid check (status in ('active', 'closed')),
  constraint sessions_tax_nonneg check (total_tax >= 0),
  constraint sessions_tip_nonneg check (total_tip >= 0),
  constraint sessions_delivery_nonneg check (total_delivery_fee >= 0)
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  nickname text not null,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  constraint participants_nickname_len check (char_length(nickname) between 1 and 24)
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  name text not null,
  price numeric(10, 2) not null,
  is_shared boolean not null default false,
  created_at timestamptz not null default now(),
  constraint items_name_len check (char_length(name) between 1 and 60),
  constraint items_price_nonneg check (price >= 0)
);

create table if not exists public.item_claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  -- Denormalized so realtime subscribers can filter server-side.
  session_id uuid not null references public.sessions(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint item_claims_unique unique (item_id, participant_id)
);

-- ---------------------------------------------------------------------------
-- Indexes on every FK column (keeps realtime + lookup queries fast).
-- ---------------------------------------------------------------------------

create index if not exists items_session_id_idx on public.items(session_id);
create index if not exists participants_session_id_idx on public.participants(session_id);
create index if not exists item_claims_item_id_idx on public.item_claims(item_id);
create index if not exists item_claims_participant_id_idx on public.item_claims(participant_id);
create index if not exists item_claims_session_id_idx on public.item_claims(session_id);

-- ---------------------------------------------------------------------------
-- Realtime publication
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'item_claims'
  ) then
    alter publication supabase_realtime add table public.item_claims;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'participants'
  ) then
    alter publication supabase_realtime add table public.participants;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'items'
  ) then
    alter publication supabase_realtime add table public.items;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'sessions'
  ) then
    alter publication supabase_realtime add table public.sessions;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- RLS: anon can SELECT everything but never write directly.
-- All writes flow through server actions using the service_role key.
-- ---------------------------------------------------------------------------

alter table public.sessions enable row level security;
alter table public.participants enable row level security;
alter table public.items enable row level security;
alter table public.item_claims enable row level security;

drop policy if exists "anon read sessions" on public.sessions;
drop policy if exists "anon read participants" on public.participants;
drop policy if exists "anon read items" on public.items;
drop policy if exists "anon read item_claims" on public.item_claims;

create policy "anon read sessions" on public.sessions for select to anon using (true);
create policy "anon read participants" on public.participants for select to anon using (true);
create policy "anon read items" on public.items for select to anon using (true);
create policy "anon read item_claims" on public.item_claims for select to anon using (true);

-- ---------------------------------------------------------------------------
-- Transactional RPCs
-- ---------------------------------------------------------------------------

create or replace function public.create_session_with_items(
  p_title text,
  p_tax numeric,
  p_tip numeric,
  p_delivery numeric,
  p_currency text,
  p_host_nickname text,
  p_payment_handles jsonb,
  p_items jsonb
) returns table (session_id uuid, host_participant_id uuid)
language plpgsql security definer as $$
declare
  v_session_id uuid;
  v_host_id uuid;
begin
  insert into public.sessions (title, total_tax, total_tip, total_delivery_fee, currency_code, payment_handles)
    values (p_title, p_tax, p_tip, p_delivery, p_currency, coalesce(p_payment_handles, '{}'::jsonb))
    returning id into v_session_id;

  insert into public.participants (session_id, nickname)
    values (v_session_id, p_host_nickname)
    returning id into v_host_id;

  update public.sessions set host_participant_id = v_host_id where id = v_session_id;

  insert into public.items (session_id, name, price, is_shared)
    select v_session_id, x.name, x.price, coalesce(x.is_shared, false)
    from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb))
      as x(name text, price numeric, is_shared boolean);

  session_id := v_session_id;
  host_participant_id := v_host_id;
  return next;
end $$;

create or replace function public.toggle_claim(
  p_item_id uuid,
  p_participant_id uuid,
  p_session_id uuid
) returns void
language plpgsql security definer as $$
declare
  v_deleted int;
begin
  -- Atomic toggle: delete first; if nothing was there, insert.
  -- Wrapped in the RPC's implicit transaction so double-taps can't produce a duplicate.
  delete from public.item_claims
    where item_id = p_item_id and participant_id = p_participant_id;
  get diagnostics v_deleted = row_count;

  if v_deleted = 0 then
    insert into public.item_claims (item_id, participant_id, session_id)
      values (p_item_id, p_participant_id, p_session_id);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- pg_cron TTL: nightly cleanup of sessions older than 30 days.
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('snaptab-session-ttl')
    where exists (select 1 from cron.job where jobname = 'snaptab-session-ttl');

    perform cron.schedule(
      'snaptab-session-ttl',
      '17 3 * * *',
      $ttl$ delete from public.sessions where created_at < now() - interval '30 days' $ttl$
    );
  end if;
end $$;
