import { getSql } from "@/lib/db";

const DDL = [
  `create table if not exists house_pieces (
    id text primary key,
    name text not null,
    metal text not null,
    cat text not null,
    audience text not null default 'women',
    description text not null default '',
    images jsonb not null default '[]'::jsonb,
    featured boolean not null default false,
    sort_order integer not null default 0
  )`,
  `create table if not exists house_profile (
    id integer primary key default 1,
    founder_name text not null default 'Gobinda',
    founder_image text not null default '/images/founder.jpg',
    hero_images jsonb not null default '[]'::jsonb
  )`,
  `create table if not exists house_rates (
    id integer primary key default 1,
    gold_per_tola double precision not null default 0,
    silver_per_kg double precision not null default 0,
    as_of timestamptz
  )`,
  `create table if not exists studio_members (
    user_id text primary key,
    email text not null unique,
    role text not null default 'owner',
    created_at timestamptz default current_timestamp not null
  )`,
  `create table if not exists studio_invites (
    email text primary key,
    invited_by text,
    created_at timestamptz default current_timestamp not null
  )`,
  `create table if not exists house_media (
    id text primary key,
    mime text not null default 'image/jpeg',
    body text not null,
    created_at timestamptz default current_timestamp not null
  )`,
  `create table if not exists house_categories (
    name text primary key,
    sort_order integer not null default 0,
    icon text not null default ''
  )`,
  `alter table house_categories add column if not exists icon text not null default ''`,
  `alter table house_categories add column if not exists shown boolean not null default true`,
  `create unique index if not exists house_categories_name_lower on house_categories (lower(name))`,
  `alter table house_pieces add column if not exists audience text not null default 'women'`,
  `alter table house_pieces add column if not exists audiences jsonb not null default '[]'::jsonb`,
  `alter table house_pieces add column if not exists cats jsonb not null default '[]'::jsonb`,
];

let boot: Promise<void> | null = null;

export function ensureHouse(): Promise<void> {
  if (!boot) {
    boot = (async () => {
      const sql = await getSql();
      for (const stmt of DDL) await sql.query(stmt);
    })().catch((err) => {
      boot = null;
      throw err;
    });
  }
  return boot;
}
