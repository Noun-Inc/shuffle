-- Shuffle Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL → New Query)

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Decks: groups of signals (e.g., "2026 Signals")
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

-- Signals: the core content cards
create table if not exists signals (
  id uuid primary key default uuid_generate_v4(),
  deck_id uuid not null references decks(id) on delete cascade,
  number int not null,
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
  updated_at timestamptz default now(),
  unique(deck_id, number)
);

-- Signal images: one-to-many, ordered
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

-- Device-level stars (pre-auth)
create table if not exists device_stars (
  device_id text not null,
  signal_id uuid not null references signals(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (device_id, signal_id)
);

-- Device-level comments (pre-auth)
create table if not exists device_comments (
  device_id text not null,
  signal_id uuid not null references signals(id) on delete cascade,
  comment text not null,
  updated_at timestamptz default now(),
  primary key (device_id, signal_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_signals_deck_status on signals(deck_id, status);
create index if not exists idx_signals_deck_number on signals(deck_id, number);
create index if not exists idx_signal_images_signal on signal_images(signal_id, sort_order);
create index if not exists idx_device_stars_device on device_stars(device_id);
create index if not exists idx_device_comments_device on device_comments(device_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger signals_updated_at before update on signals
  for each row execute function update_updated_at();
create trigger decks_updated_at before update on decks
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table decks enable row level security;
alter table signals enable row level security;
alter table signal_images enable row level security;
alter table device_stars enable row level security;
alter table device_comments enable row level security;

-- Public read for published content
create policy "Public can read active decks" on decks for select using (is_active = true);
create policy "Public can read published signals" on signals for select using (status = 'published');
create policy "Public can read signal images" on signal_images for select using (
  exists (select 1 from signals where signals.id = signal_images.signal_id)
);

-- Device data: anyone can manage their own
create policy "Anyone can manage stars" on device_stars for all using (true);
create policy "Anyone can manage comments" on device_comments for all using (true);

-- Admin writes (permissive for Phase 1 — tighten with auth in Phase 2)
create policy "Anon can read all signals" on signals for select using (true);
create policy "Anon can insert signals" on signals for insert with check (true);
create policy "Anon can update signals" on signals for update using (true);
create policy "Anon can delete signals" on signals for delete using (true);
create policy "Anon can insert images" on signal_images for insert with check (true);
create policy "Anon can update images" on signal_images for update using (true);
create policy "Anon can delete images" on signal_images for delete using (true);
create policy "Anon can manage decks" on decks for all using (true);
