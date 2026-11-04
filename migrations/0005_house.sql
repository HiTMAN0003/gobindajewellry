create table if not exists house_pieces (
  id text primary key,
  name text not null,
  metal text not null,
  cat text not null,
  description text not null default '',
  images jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists house_profile (
  id integer primary key default 1,
  founder_name text not null default 'Gobinda',
  founder_image text not null default '/images/founder.jpg',
  hero_images jsonb not null default '[]'::jsonb
);

create table if not exists house_rates (
  id integer primary key default 1,
  gold_per_tola double precision not null default 0,
  silver_per_kg double precision not null default 0,
  as_of timestamptz
);

create table if not exists studio_members (
  user_id text primary key,
  email text not null unique,
  role text not null default 'owner',
  created_at timestamptz default current_timestamp not null
);

create table if not exists studio_invites (
  email text primary key,
  invited_by text,
  created_at timestamptz default current_timestamp not null
);
