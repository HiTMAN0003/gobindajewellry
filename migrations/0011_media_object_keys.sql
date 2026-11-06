ALTER TABLE house_media
  ADD COLUMN IF NOT EXISTS object_key text,
  ADD COLUMN IF NOT EXISTS thumb_object_key text;
