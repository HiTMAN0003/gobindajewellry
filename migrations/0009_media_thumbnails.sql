alter table house_media
  add column if not exists thumb_mime text,
  add column if not exists thumb_body text;
