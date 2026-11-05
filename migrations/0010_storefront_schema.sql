ALTER TABLE house_categories
  ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT '';

ALTER TABLE house_categories
  ADD COLUMN IF NOT EXISTS shown boolean NOT NULL DEFAULT true;

ALTER TABLE house_pieces
  ADD COLUMN IF NOT EXISTS audiences jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE house_pieces
  ADD COLUMN IF NOT EXISTS cats jsonb NOT NULL DEFAULT '[]'::jsonb;

DO $$
DECLARE
  total_count integer;
  men_count integer;
  kids_count integer;
BEGIN
  SELECT
    count(*)::integer,
    count(*) FILTER (WHERE audience = 'men')::integer,
    count(*) FILTER (WHERE audience = 'kids')::integer
  INTO total_count, men_count, kids_count
  FROM house_pieces;

  IF total_count > 0 AND men_count = 0 AND kids_count = 0 THEN
    UPDATE house_pieces
    SET audience = 'men'
    WHERE id IN ('j8', 'j10', 'j13');

    UPDATE house_pieces
    SET audience = 'kids'
    WHERE id = 'j14';
  END IF;
END $$;
