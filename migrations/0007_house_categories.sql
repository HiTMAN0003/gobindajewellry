create table if not exists house_categories (
  name text primary key,
  sort_order integer not null default 0
);

create unique index if not exists house_categories_name_lower on house_categories (lower(name));

insert into house_categories (name, sort_order) values
  ('Necklaces', 1),
  ('Earrings', 2),
  ('Rings', 3),
  ('Bangles', 4),
  ('Bracelets', 5),
  ('Anklets', 6),
  ('Bridal Jewellery', 7),
  ('Handcrafted Designs', 8)
on conflict (name) do nothing;
