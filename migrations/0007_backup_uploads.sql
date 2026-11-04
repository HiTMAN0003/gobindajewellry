create table if not exists backup_uploads (
  id text primary key,
  user_id text not null,
  total_size bigint not null,
  total_chunks integer not null,
  created_at timestamptz not null default current_timestamp
);

create table if not exists backup_upload_chunks (
  upload_id text not null references backup_uploads(id) on delete cascade,
  chunk_index integer not null,
  body text not null,
  primary key (upload_id, chunk_index)
);

create index if not exists backup_uploads_created_at_idx
on backup_uploads(created_at);
