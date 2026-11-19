// Idempotent schema. Runs automatically the first time the site talks to the
// database (see lib/db/index.ts) and again whenever SCHEMA_VERSION is bumped.
export const SCHEMA_VERSION = 2

// Row Level Security is ON for every table with no policies: Supabase exposes the
// "public" schema through its REST API, so this keeps the tables unreachable with the
// public anon key. The server connects as the database owner (bypasses RLS).
export const SCHEMA_SQL = /* sql */ `
create table if not exists settings (
  key text primary key,
  value jsonb not null
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  title_fr text not null,
  title_en text not null,
  description_fr text not null default '',
  description_en text not null default '',
  starts_at timestamptz not null,
  duration_minutes int not null default 120 check (duration_minutes > 0),
  location text not null default '',
  seats int not null check (seats >= 0),
  price_cents int check (price_cents is null or price_cents >= 0),
  published boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists sessions_starts_idx on sessions (starts_at);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete set null,
  session_title text not null,
  session_starts_at timestamptz,
  name text not null,
  phone text not null,
  email text not null,
  notes text not null default '',
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  lang text not null default 'fr',
  created_at timestamptz not null default now()
);
create index if not exists bookings_session_idx on bookings (session_id);
create index if not exists bookings_status_idx on bookings (status);
create index if not exists bookings_created_idx on bookings (created_at desc);

create table if not exists schedule_images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  path text not null,
  caption text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('testimonial','instructor')),
  name text not null,
  role_fr text not null default '',
  role_en text not null default '',
  text_fr text not null default '',
  text_en text not null default '',
  sort int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table settings enable row level security;
alter table sessions enable row level security;
alter table bookings enable row level security;
alter table schedule_images enable row level security;
alter table content_items enable row level security;
`
