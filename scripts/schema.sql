-- Shuffle Database Migration v2 — Sessions
-- Safe to run on an existing database. Fully idempotent.
-- Run this in Supabase SQL Editor (Dashboard → SQL → New Query)

create extension if not exists "uuid-ossp";

-- ============================================================
-- STEP 1: CREATE NEW TABLES (skipped if already exist)
-- ============================================================

-- Decks: already exists, no change needed
create table if not exists decks (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  year int not null,
  description text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sessions: new table
create table if not exists sessions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  deck_id uuid not null references decks(id),
  expires_at timestamptz not null,
  allow_add_signals boolean default false,
  join_password text,       -- only set when allow_add_signals = true
  created_at timestamptz default now()
);

-- Signals: already exists — columns migrated in Step 2 below
create table if not exists signals (
  id uuid primary key default uuid_generate_v4(),
  deck_id uuid references decks(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  number int,  -- null for participant-added signals; assigned at display time
  title text not null,
  body text not null default '',
  category text,
  tags text[] default '{}',
  year int not null,
  reference text,
  focal_hint text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Signal images: already exists, no change needed
create table if not exists signal_images (
  id uuid primary key default uuid_generate_v4(),
  signal_id uuid not null references signals(id) on delete cascade,
  url text not null,
  thumb_url text,
  alt text,
  source text,
  source_label text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Participants: new table
create table if not exists participants (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  display_name text,        -- null = anonymous
  device_id text not null,
  joined_at timestamptz default now()
);

-- Session stars: new table (replaces device_stars)
-- signal_id is nullable so that deleting a deck signal sets it null rather than losing the record
create table if not exists session_stars (
  id uuid primary key default uuid_generate_v4(),
  participant_id uuid not null references participants(id) on delete cascade,
  signal_id uuid references signals(id) on delete set null,
  session_id uuid not null references sessions(id) on delete cascade,
  created_at timestamptz default now(),
  unique(participant_id, signal_id)
);

-- Session comments: new table (replaces device_comments)
-- signal_id is nullable so that deleting a deck signal sets it null rather than losing the comment text
create table if not exists session_comments (
  id uuid primary key default uuid_generate_v4(),
  participant_id uuid not null references participants(id) on delete cascade,
  signal_id uuid references signals(id) on delete set null,
  session_id uuid not null references sessions(id) on delete cascade,
  comment text not null,
  updated_at timestamptz default now(),
  unique(participant_id, signal_id)
);

-- ============================================================
-- STEP 2: MIGRATE EXISTING signals TABLE
-- Each statement is safe to re-run if already applied.
-- ============================================================

-- Add session_id column if it doesn't exist
alter table signals
  add column if not exists session_id uuid references sessions(id) on delete cascade;

-- Make deck_id nullable (signals can now belong to a session instead)
alter table signals
  alter column deck_id drop not null;

-- Make number nullable (participant-added signals have no canonical number)
alter table signals
  alter column number drop not null;

-- Add the scope constraint if it doesn't already exist
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'signals_scope_check' and conrelid = 'signals'::regclass
  ) then
    alter table signals add constraint signals_scope_check check (
      (deck_id is not null and session_id is null) or
      (session_id is not null and deck_id is null)
    );
  end if;
end $$;

-- Deck signals must always have a number
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'signals_number_check' and conrelid = 'signals'::regclass
  ) then
    alter table signals add constraint signals_number_check check (
      (deck_id is not null and number is not null) or
      (session_id is not null)
    );
  end if;
end $$;

-- ============================================================
-- STEP 3: DROP OBSOLETE TABLES
-- ============================================================

drop table if exists device_stars;
drop table if exists device_comments;

-- ============================================================
-- STEP 4: INDEXES
-- ============================================================

create index if not exists idx_signals_deck_status on signals(deck_id, status);
create index if not exists idx_signals_deck_number on signals(deck_id, number);
create index if not exists idx_signals_session on signals(session_id);
create index if not exists idx_signal_images_signal on signal_images(signal_id, sort_order);
create index if not exists idx_participants_session on participants(session_id);
create index if not exists idx_participants_device on participants(device_id);
create index if not exists idx_session_stars_session on session_stars(session_id);
create index if not exists idx_session_stars_signal on session_stars(signal_id);
create index if not exists idx_session_comments_session on session_comments(session_id);
create index if not exists idx_session_comments_signal on session_comments(signal_id);

-- ============================================================
-- STEP 5: UPDATED_AT TRIGGER
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists signals_updated_at on signals;
create trigger signals_updated_at before update on signals
  for each row execute function update_updated_at();

drop trigger if exists decks_updated_at on decks;
create trigger decks_updated_at before update on decks
  for each row execute function update_updated_at();

-- ============================================================
-- STEP 6: ROW LEVEL SECURITY
-- ============================================================

alter table decks enable row level security;
alter table sessions enable row level security;
alter table signals enable row level security;
alter table signal_images enable row level security;
alter table participants enable row level security;
alter table session_stars enable row level security;
alter table session_comments enable row level security;

-- Drop all policies before recreating (idempotent)
drop policy if exists "Public can read active decks" on decks;
drop policy if exists "Public can read published deck signals" on signals;
drop policy if exists "Public can read signal images for published deck signals" on signal_images;
drop policy if exists "Anon can read all signals" on signals;
drop policy if exists "Anon can insert signals" on signals;
drop policy if exists "Anon can update signals" on signals;
drop policy if exists "Anon can delete signals" on signals;
drop policy if exists "Anon can insert images" on signal_images;
drop policy if exists "Anon can update images" on signal_images;
drop policy if exists "Anon can delete images" on signal_images;
drop policy if exists "Anon can manage decks" on decks;

-- All session data (participants, stars, comments, session signals) is accessed
-- exclusively via Next.js API routes using the service role key, which bypasses RLS.
-- The anon key has read-only access to master deck content only.

create policy "Public can read active decks" on decks
  for select using (is_active = true);

create policy "Public can read published deck signals" on signals
  for select using (status = 'published' and session_id is null);

create policy "Public can read signal images for published deck signals" on signal_images
  for select using (
    exists (
      select 1 from signals
      where signals.id = signal_images.signal_id
        and signals.status = 'published'
        and signals.session_id is null
    )
  );

-- sessions, participants, session_stars, session_comments: no anon access
-- (service role in API routes has full access — RLS is bypassed by service role key)
