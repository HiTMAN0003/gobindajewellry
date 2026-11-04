create table if not exists house_media (
  id text primary key,
  mime text not null default 'image/jpeg',
  body text not null,
  created_at timestamptz default current_timestamp not null
);
