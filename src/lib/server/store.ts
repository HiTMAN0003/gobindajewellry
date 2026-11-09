import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql, type Sql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import type { Jewellery, MetalRates, StoreSettings, Storefront } from "@/lib/types";
import { CATEGORIES, audiencesOf, categoriesOf } from "@/lib/types";
import { requireStudio } from "./access";
import { putImageObject } from "./object-storage";

const HERO_DEFAULT = [
  "/images/hero-1.jpg",
  "/images/hero-2.jpg",
  "/images/hero-3.jpg",
  "/images/hero-4.jpg",
  "/images/hero-5.jpg",
];

const SEED: Jewellery[] = [
  { id: "j1", name: "Sona Temple Haar", metal: "gold", cat: "Necklaces", audience: "women", description: "Hand-finished temple necklace.", images: ["/images/gold-temple-necklace.jpg"], featured: true, sortOrder: 1 },
  { id: "j2", name: "Kundan Bridal Suite", metal: "gold", cat: "Bridal Jewellery", audience: "women", description: "Bridal set finished in the house workshop.", images: ["/images/gold-bridal-set.jpg"], featured: true, sortOrder: 2 },
  { id: "j3", name: "Chandbali Jhumkas", metal: "gold", cat: "Earrings", audience: "women", description: "Classic chandbali jhumkas.", images: ["/images/gold-jhumkas.jpg"], featured: true, sortOrder: 3 },
  { id: "j4", name: "Lakshmi Temple Bangles", metal: "gold", cat: "Bangles", audience: "women", description: "Temple-work bangles.", images: ["/images/gold-bangles.jpg"], featured: true, sortOrder: 4 },
  { id: "j5", name: "House Mangalsutra", metal: "gold", cat: "Necklaces", audience: "women", description: "Black-bead mangalsutra.", images: ["/images/gold-mangalsutra.jpg"], featured: true, sortOrder: 5 },
  { id: "j6", name: "Chandi Tribal Haar", metal: "silver", cat: "Necklaces", audience: "women", description: "Heavy silver haar.", images: ["/images/silver-necklace.jpg"], featured: true, sortOrder: 6 },
  { id: "j7", name: "Polki Halo Ring", metal: "gold", cat: "Rings", audience: "women", description: "Polki halo ring.", images: ["/images/gold-ring.jpg"], featured: false, sortOrder: 7 },
  { id: "j8", name: "Heritage Link Bracelet", metal: "gold", cat: "Bracelets", audience: "men", description: "Hand-linked bracelet.", images: ["/images/gold-bracelet.jpg"], featured: false, sortOrder: 8 },
  { id: "j9", name: "Teardrop Maang Tikka", metal: "gold", cat: "Bridal Jewellery", audience: "women", description: "Bridal maang tikka.", images: ["/images/gold-tikka.jpg"], featured: false, sortOrder: 9 },
  { id: "j10", name: "Handwoven Gold Chain", metal: "gold", cat: "Handcrafted Designs", audience: "men", description: "Woven chain.", images: ["/images/gold-chain.jpg"], featured: false, sortOrder: 10 },
  { id: "j11", name: "Diamond Bali Hoops", metal: "gold", cat: "Earrings", audience: "women", description: "Bali hoops.", images: ["/images/gold-bali.jpg"], featured: false, sortOrder: 11 },
  { id: "j12", name: "Ghungroo Silver Jhumkas", metal: "silver", cat: "Earrings", audience: "women", description: "Bell jhumkas.", images: ["/images/silver-jhumkas.jpg"], featured: false, sortOrder: 12 },
  { id: "j13", name: "Rajwada Silver Kada", metal: "silver", cat: "Bangles", audience: "men", description: "Heavy silver kada.", images: ["/images/silver-kada.jpg"], featured: false, sortOrder: 13 },
  { id: "j14", name: "Payal of Bells", metal: "silver", cat: "Anklets", audience: "kids", description: "Silver payal.", images: ["/images/silver-payal.jpg"], featured: false, sortOrder: 14 },
  { id: "j15", name: "Sterling Cocktail Ring", metal: "silver", cat: "Rings", audience: "women", description: "Silver cocktail ring.", images: ["/images/silver-ring.jpg"], featured: false, sortOrder: 15 },
];

function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
  if (typeof raw === "string") {
    try {
      const v = JSON.parse(raw) as unknown;
      return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapItem(row: Record<string, unknown>): Jewellery {
  const cat = String(row.cat ?? "");
  const cats = categoriesOf({ cat, cats: parseImages(row.cats) });
  const audiences = audiencesOf({ audience: String(row.audience ?? ""), audiences: parseImages(row.audiences) });
  return {
    id: String(row.id),
    name: String(row.name),
    metal: row.metal === "silver" ? "silver" : "gold",
    cat: cats[0] ?? cat,
    cats,
    audience: audiences[0] ?? "women",
    audiences,
    description: String(row.description ?? ""),
    images: parseImages(row.images),
    featured: Boolean(row.featured),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

async function storeDataUrl(dataUrl: string, thumbDataUrl?: string): Promise<string> {
  const m = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!m) throw new Error("Please upload a JPEG or PNG photo.");

  const mime = m[1].toLowerCase() === "image/jpg" ? "image/jpeg" : m[1].toLowerCase();
  const body = m[2].replace(/\s/g, "");
  if (body.length < 80) throw new Error("That photo is empty.");
  if (body.length > 2_400_000) throw new Error("That photo is too large. Try a smaller image.");

  let thumbBody: string | null = null;
  let thumbMime: string | null = null;

  if (thumbDataUrl) {
    const thumb = thumbDataUrl.match(/^data:image\/webp;base64,([A-Za-z0-9+/=\s]+)$/i);
    if (!thumb) throw new Error("The thumbnail must be a WebP image.");
    thumbBody = thumb[1].replace(/\s/g, "");
    thumbMime = "image/webp";
    if (thumbBody.length < 80 || thumbBody.length > 600_000) {
      throw new Error("The WebP thumbnail is invalid or too large.");
    }
  }

  const id = `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const extension = mime === "image/jpeg" ? "jpg" : mime.split("/")[1];
  const objectKey = `jewellery/${id}/original.${extension}`;
  const thumbObjectKey = thumbBody ? `jewellery/${id}/thumb.webp` : null;

  await putImageObject(objectKey, Buffer.from(body, "base64"), mime);

  if (thumbBody && thumbObjectKey) {
    await putImageObject(thumbObjectKey, Buffer.from(thumbBody, "base64"), "image/webp");
  }

  const sql = await getSql();
  await sql.query(
    `insert into house_media
      (id, mime, body, thumb_mime, thumb_body, object_key, thumb_object_key)
     values ($1, $2, '', $3, null, $4, $5)`,
    [id, mime, thumbMime, objectKey, thumbObjectKey],
  );

  return `/api/media/${id}`;
}

async function persistImages(urls: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const raw of urls) {
    const u = raw.trim();
    if (!u) continue;
    if (u.startsWith("data:image/")) out.push(await storeDataUrl(u));
    else if (u.startsWith("/api/media/") || u.startsWith("/images/") || /^https?:\/\//i.test(u)) out.push(u);
  }
  return out;
}

async function silentSelect(sql: Sql, text: string): Promise<Record<string, unknown>[]> {
  try {
    return await sql.query<Record<string, unknown>>(text);
  } catch {
    return [];
  }
}

async function bootstrap() {
  const sql = await getSql();

  const pieceCount = await sql.query<{ n: number }>(`select count(*)::int as n from house_pieces`);
  if ((pieceCount[0]?.n ?? 0) === 0) {
    const legacy = await silentSelect(sql, `select * from jewellery`);
    const source =
      legacy.length > 0 && legacy.some((row) => parseImages(row.images).length > 0)
        ? legacy.map(mapItem)
        : SEED;
    for (const it of source) {
      await sql.query(
        `insert into house_pieces (id, name, metal, cat, audience, description, images, featured, sort_order)
         values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9) on conflict (id) do nothing`,
        [it.id, it.name, it.metal, it.cat, it.audience, it.description, JSON.stringify(it.images), it.featured, it.sortOrder],
      );
    }
  }

  await seedCategories(sql);

  await sql.query(
    `insert into house_profile (id, founder_name, founder_image, hero_images)
     values (1, 'Gobinda', '/images/founder.jpg', $1::jsonb)
     on conflict (id) do nothing`,
    [JSON.stringify(HERO_DEFAULT)],
  );
  const profile = await sql.query<{ hero_images: unknown }>(`select hero_images from house_profile where id = 1`);
  if (parseImages(profile[0]?.hero_images).length === 0) {
    const old = await silentSelect(sql, `select * from store_settings where id = 1`);
    const hero = parseImages(old[0]?.hero_images);
    await sql.query(
      `update house_profile set
         founder_name = coalesce(nullif($1, ''), founder_name),
         founder_image = coalesce(nullif($2, ''), founder_image),
         hero_images = $3::jsonb
       where id = 1`,
      [
        String(old[0]?.founder_name ?? ""),
        String(old[0]?.founder_image ?? ""),
        JSON.stringify(hero.length ? hero : HERO_DEFAULT),
      ],
    );
  }

  await sql.query(
    `insert into house_rates (id, gold_per_tola, silver_per_kg) values (1, 0, 0)
     on conflict (id) do nothing`,
  );
  const rates = await sql.query<{ gold_per_tola: number; silver_per_kg: number }>(
    `select gold_per_tola, silver_per_kg from house_rates where id = 1`,
  );
  if (!(rates[0]?.gold_per_tola || rates[0]?.silver_per_kg)) {
    const old = await silentSelect(sql, `select * from metal_rates where id = 1`);
    const gold = Number(old[0]?.gold_per_tola ?? 0);
    const silver = Number(old[0]?.silver_per_kg ?? 0);
    if (gold > 0 || silver > 0) {
      await sql.query(
        `update house_rates set gold_per_tola = $1, silver_per_kg = $2 where id = 1`,
        [gold, silver],
      );
    }
  }
}

let boot: Promise<void> | null = null;
async function ready() {
  if (!boot) {
    boot = bootstrap().catch((err) => {
      boot = null;
      throw err;
    });
  }
  await boot;
}

async function readCategoryRows(): Promise<{ name: string; icon: string; shown: boolean }[]> {
  const sql = await getSql();
  const rows = await sql.query<{ name: string; icon: string | null; shown: boolean | number | null }>(
    `select name, coalesce(icon, '') as icon, coalesce(shown, true) as shown from house_categories order by sort_order, name`,
  );
  return rows.map((row) => ({
    name: row.name,
    icon: String(row.icon ?? ""),
    shown: row.shown !== false && row.shown !== 0,
  }));
}

function iconsFrom(rows: { name: string; icon: string }[]) {
  const icons: Record<string, string> = {};
  for (const row of rows) if (row.icon) icons[row.name] = row.icon;
  return icons;
}

function shownFrom(rows: { name: string; shown: boolean }[]) {
  const shown: Record<string, boolean> = {};
  for (const row of rows) shown[row.name] = row.shown;
  return shown;
}

async function readCategories(): Promise<string[]> {
  return (await readCategoryRows()).map((row) => row.name);
}

function normalizeCatName(raw: string): string {
  const name = String(raw ?? "").trim().replace(/\s+/g, " ");
  if (!name) throw new Error("Enter a category name.");
  if (name.length > 80) throw new Error("That name is too long.");
  if (/^all$/i.test(name)) throw new Error("“All” is reserved for the store filter.");
  return name;
}

async function seedCategories(sql: Sql) {
  const count = await sql.query<{ n: number }>(`select count(*)::int as n from house_categories`);
  const pieceCats = await sql.query<{ cat: string }>(
    `select distinct cat from house_pieces where coalesce(trim(cat), '') <> ''`,
  );
  if ((count[0]?.n ?? 0) === 0) {
    const names: string[] = [];
    for (const name of CATEGORIES) {
      if (!names.some((n) => n.toLowerCase() === name.toLowerCase())) names.push(name);
    }
    for (const row of pieceCats) {
      const name = String(row.cat ?? "").trim();
      if (name && !names.some((n) => n.toLowerCase() === name.toLowerCase())) names.push(name);
    }
    for (let i = 0; i < names.length; i += 1) {
      await sql.query(
        `insert into house_categories (name, sort_order) values ($1, $2) on conflict (name) do nothing`,
        [names[i], i + 1],
      );
    }
    return;
  }
  const maxRow = await sql.query<{ m: number | null }>(`select max(sort_order) as m from house_categories`);
  let next = Number(maxRow[0]?.m ?? 0) + 1;
  for (const row of pieceCats) {
    const name = String(row.cat ?? "").trim();
    if (!name) continue;
    const inserted = await findCategory(sql, name);
    if (inserted) continue;
    await sql.query(
      `insert into house_categories (name, sort_order) values ($1, $2) on conflict (name) do nothing`,
      [name, next],
    );
    next += 1;
  }
}

export async function ensureCategoryRows() {
  const sql = await getSql();
  await sql.query(`create table if not exists house_categories (
    name text primary key,
    sort_order integer not null default 0,
    icon text not null default ''
  )`);
  await sql.query(`alter table house_categories add column if not exists icon text not null default ''`);
  await sql.query(`alter table house_categories add column if not exists shown boolean not null default true`);
  await sql.query(
    `create unique index if not exists house_categories_name_lower on house_categories (lower(name))`,
  );
  await seedCategories(sql);
}

export async function ensureAudienceColumn() {
  const sql = await getSql();
  await sql.query(`alter table house_pieces add column if not exists audience text not null default 'women'`);
  await sql.query(`alter table house_pieces add column if not exists audiences jsonb not null default '[]'::jsonb`);
  const mix = await sql.query<{ n: number; men: number; kids: number }>(
    `select count(*)::int as n,
            count(*) filter (where audience = 'men')::int as men,
            count(*) filter (where audience = 'kids')::int as kids
     from house_pieces`,
  );
  const row = mix[0];
  if ((row?.n ?? 0) > 0 && (row?.men ?? 0) === 0 && (row?.kids ?? 0) === 0) {
    await sql.query(`update house_pieces set audience = 'men' where id in ('j8', 'j10', 'j13')`);
    await sql.query(`update house_pieces set audience = 'kids' where id = 'j14'`);
  }
}

export async function ensureCatsColumn() {
  const sql = await getSql();
  await sql.query(`alter table house_pieces add column if not exists cats jsonb not null default '[]'::jsonb`);
}

async function categoryBundle() {
  const [rows, items] = await Promise.all([readCategoryRows(), readItems()]);
  return { categories: rows.map((row) => row.name), categoryIcons: iconsFrom(rows), categoryShown: shownFrom(rows), items };
}

async function findCategory(sql: Sql, name: string) {
  const rows = await sql.query<{ name: string }>(
    `select name from house_categories where lower(name) = lower($1)`,
    [name],
  );
  return rows[0]?.name ?? null;
}

async function readItems(): Promise<Jewellery[]> {
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select * from house_pieces order by featured desc, sort_order, name`,
  );
  return rows.map(mapItem);
}

async function readRates(): Promise<MetalRates> {
  const sql = await getSql();
  const rows = await sql.query<{ gold_per_tola: number; silver_per_kg: number; as_of: string | null }>(
    `select gold_per_tola, silver_per_kg, as_of from house_rates where id = 1`,
  );
  const r = rows[0];
  return {
    goldPerTola: Number(r?.gold_per_tola ?? 0),
    silverPerKg: Number(r?.silver_per_kg ?? 0),
    asOf: r?.as_of ?? null,
  };
}

async function readSettings(): Promise<StoreSettings> {
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select founder_name, founder_image, hero_images from house_profile where id = 1`,
  );
  const r = rows[0];
  const hero = parseImages(r?.hero_images);
  return {
    founderName: String(r?.founder_name ?? "Gobinda"),
    founderImage: String(r?.founder_image ?? "/images/founder.jpg"),
    heroImages: hero.length ? hero : HERO_DEFAULT,
  };
}

export const getStorefront = createServerFn({ method: "GET" }).handler(
  async (): Promise<Storefront> => {
    await ready();
    const [items, rates, settings, rows] = await Promise.all([
      readItems(),
      readRates(),
      readSettings(),
      readCategoryRows(),
    ]);
    return {
      items,
      rates,
      settings,
      categories: rows.map((row) => row.name),
      categoryIcons: iconsFrom(rows),
      categoryShown: shownFrom(rows),
    };
  },
);

export const getStudioOverview = createServerFn({ method: "GET" }).handler(
  async () => {
    await ready();
    const [rates, settings, rows] = await Promise.all([
      readRates(),
      readSettings(),
      readCategoryRows(),
    ]);
    return {
      rates,
      settings,
      categories: rows.map((row) => row.name),
      categoryIcons: iconsFrom(rows),
      categoryShown: shownFrom(rows),
    };
  },
);

export const getStudioJewellery = createServerFn({ method: "GET" }).handler(
  async (): Promise<Jewellery[]> => {
    await ready();
    return readItems();
  },
);

const ratesInput = z.object({
  goldPerTola: z.number().min(0).max(100_000_000),
  silverPerKg: z.number().min(0).max(100_000_000),
});

export const saveMetalRates = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(ratesInput)
  .handler(async ({ data, context }) => {
    await ready();
    await requireStudio(context.userId);
    const sql = await getSql();
    await sql.query(
      `update house_rates set gold_per_tola = $1, silver_per_kg = $2, as_of = now() where id = 1`,
      [data.goldPerTola, data.silverPerKg],
    );
    return readRates();
  });

const pieceInput = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(120),
  metal: z.enum(["gold", "silver"]),
  cat: z.string().min(1).max(80),
  cats: z.array(z.string().min(1).max(80)).min(1).max(6).optional(),
  audience: z.enum(["women", "men", "kids", "others"]).default("women"),
  audiences: z.array(z.enum(["women", "men", "kids", "others"])).min(1).max(4).optional(),
  description: z.string().max(2000).optional(),
  images: z.array(z.string()).max(8),
  featured: z.boolean(),
});

export const saveJewellery = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(pieceInput)
  .handler(async ({ data, context }) => {
    await ready();
    await requireStudio(context.userId);
    const sql = await getSql();
    const requested = categoriesOf({ cat: data.cat, cats: data.cats ?? [data.cat] }).slice(0, 6);
    const resolved: string[] = [];
    for (const name of requested) {
      const known = await findCategory(sql, normalizeCatName(name));
      if (!known) throw new Error("Choose a jewellery category.");
      if (!resolved.some((c) => c.toLowerCase() === known.toLowerCase())) resolved.push(known);
    }
    if (!resolved.length) throw new Error("Choose a jewellery category.");
    const audiences = audiencesOf({ audience: data.audience, audiences: data.audiences ?? [data.audience] });
    const id = data.id || `j-${Date.now()}`;
    await sql.query(
      `insert into house_pieces (id, name, metal, cat, cats, audience, audiences, description, images, featured, sort_order)
       values ($1,$2,$3,$4,$5::jsonb,$6,$7::jsonb,$8,$9::jsonb,$10,100)
       on conflict (id) do update set
         name = excluded.name,
         metal = excluded.metal,
         cat = excluded.cat,
         cats = excluded.cats,
         audience = excluded.audience,
         audiences = excluded.audiences,
         description = excluded.description,
         images = excluded.images,
         featured = excluded.featured`,
      [id, data.name, data.metal, resolved[0], JSON.stringify(resolved), audiences[0], JSON.stringify(audiences), data.description ?? "", JSON.stringify(await persistImages(data.images)), data.featured],
    );
    return readItems();
  });

export const deleteJewellery = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    await ready();
    await requireStudio(context.userId);
    const sql = await getSql();
    await sql.query(`delete from house_pieces where id = $1`, [data.id]);
    return readItems();
  });

const settingsInput = z.object({
  founderName: z.string().min(1).max(80),
  founderImage: z.string().min(1),
  heroImages: z.array(z.string()).min(1).max(8),
});

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(settingsInput)
  .handler(async ({ data, context }) => {
    await ready();
    await requireStudio(context.userId);
    const sql = await getSql();
    const founderImage = (await persistImages([data.founderImage]))[0];
    const heroImages = await persistImages(data.heroImages);
    if (!founderImage) throw new Error("Please add a profile photo.");
    if (!heroImages.length) throw new Error("Please add at least one banner photo.");
    await sql.query(
      `update house_profile set founder_name = $1, founder_image = $2, hero_images = $3::jsonb where id = 1`,
      [data.founderName, founderImage, JSON.stringify(heroImages)],
    );
    return readSettings();
  });

export const saveMedia = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({
    dataUrl: z.string().min(32).max(2_500_000),
    thumbDataUrl: z.string().min(32).max(650_000).optional(),
  }))
  .handler(async ({ data, context }) => {
    await ready();
    await requireStudio(context.userId);
    const url = await storeDataUrl(data.dataUrl, data.thumbDataUrl);
    return { url };
  });

async function rewritePieceCategories(sql: Sql, from: string, to: string) {
  const rows = await sql.query<{ id: string; cat: string; cats: unknown }>(
    `select id, cat, cats from house_pieces`,
  );
  for (const row of rows) {
    const list = categoriesOf({ cat: String(row.cat ?? ""), cats: parseImages(row.cats) });
    if (!list.some((c) => c.toLowerCase() === from.toLowerCase())) continue;
    const next: string[] = [];
    for (const name of list) {
      const mapped = name.toLowerCase() === from.toLowerCase() ? to : name;
      if (!mapped) continue;
      if (!next.some((c) => c.toLowerCase() === mapped.toLowerCase())) next.push(mapped);
    }
    if (!next.length) next.push(to);
    await sql.query(
      `update house_pieces set cat = $2, cats = $3::jsonb where id = $1`,
      [row.id, next[0], JSON.stringify(next)],
    );
  }
}

export const createCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ name: z.string().min(1).max(80) }))
  .handler(async ({ data, context }) => {
    await ready();
    await requireStudio(context.userId);
    const name = normalizeCatName(data.name);
    const sql = await getSql();
    if (await findCategory(sql, name)) throw new Error("That category already exists.");
    const maxRow = await sql.query<{ m: number | null }>(`select max(sort_order) as m from house_categories`);
    const sort = Number(maxRow[0]?.m ?? 0) + 1;
    await sql.query(`insert into house_categories (name, sort_order) values ($1, $2)`, [name, sort]);
    return categoryBundle();
  });

export const reorderCategories = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ categories: z.array(z.string().min(1).max(80)).min(1).max(100) }))
  .handler(async ({ data, context }) => {
    await ready();
    await requireStudio(context.userId);
    const current = await readCategories();
    if (data.categories.length !== current.length || new Set(data.categories).size !== current.length || current.some((name) => !data.categories.includes(name))) {
      throw new Error("The category list changed. Refresh and try again.");
    }
    const sql = await getSql();
    const cases = data.categories.map((_, index) => `when $${index + 1} then ${index + 1}`).join(" ");
    await sql.query(
      `update house_categories set sort_order = case name ${cases} else sort_order end where name = any($${data.categories.length + 1}::text[])`,
      [...data.categories, data.categories],
    );
    return categoryBundle();
  });

export const setCategoryIcon = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ name: z.string().min(1).max(80), icon: z.string().max(500) }))
  .handler(async ({ data, context }) => {
    await ready();
    await requireStudio(context.userId);
    const name = normalizeCatName(data.name);
    const sql = await getSql();
    const current = await findCategory(sql, name);
    if (!current) throw new Error("That category was not found.");
    const icon = data.icon.trim();
    if (icon && !icon.startsWith("/api/media/") && !icon.startsWith("/images/") && !/^https?:\/\//i.test(icon)) {
      throw new Error("Upload a PNG or photo for this category.");
    }
    await sql.query(`update house_categories set icon = $2 where name = $1`, [current, icon]);
    return categoryBundle();
  });

export const setCategoryShown = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ name: z.string().min(1).max(80), shown: z.boolean() }))
  .handler(async ({ data, context }) => {
    await ready();
    await requireStudio(context.userId);
    const name = normalizeCatName(data.name);
    const sql = await getSql();
    const current = await findCategory(sql, name);
    if (!current) throw new Error("That category was not found.");
    await sql.query(`update house_categories set shown = $2 where name = $1`, [current, data.shown]);
    return categoryBundle();
  });

export const renameCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ from: z.string().min(1).max(80), to: z.string().min(1).max(80) }))
  .handler(async ({ data, context }) => {
    await ready();
    await requireStudio(context.userId);
    const fromName = normalizeCatName(data.from);
    const toName = normalizeCatName(data.to);
    const sql = await getSql();
    const current = await findCategory(sql, fromName);
    if (!current) throw new Error("That category was not found.");
    const clash = await findCategory(sql, toName);
    if (clash && clash.toLowerCase() !== current.toLowerCase()) {
      throw new Error("That category already exists.");
    }
    if (current !== toName) {
      await sql.query(`update house_categories set name = $2 where name = $1`, [current, toName]);
      await rewritePieceCategories(sql, current, toName);
    }
    return categoryBundle();
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ name: z.string().min(1).max(80), moveTo: z.string().max(80).optional() }))
  .handler(async ({ data, context }) => {
    await ready();
    await requireStudio(context.userId);
    const name = normalizeCatName(data.name);
    const sql = await getSql();
    const current = await findCategory(sql, name);
    if (!current) throw new Error("That category was not found.");
    const all = await readCategories();
    if (all.length <= 1) throw new Error("Keep at least one category.");
    const countRows = await sql.query<{ n: number }>(
      `select count(*)::int as n from house_pieces
       where lower(cat) = lower($1)
          or exists (
            select 1 from jsonb_array_elements_text(coalesce(cats, '[]'::jsonb)) elem
            where lower(elem) = lower($1)
          )`,
      [current],
    );
    const pieceCount = countRows[0]?.n ?? 0;
    if (pieceCount > 0) {
      const destRaw = data.moveTo ? normalizeCatName(data.moveTo) : "";
      if (!destRaw) throw new Error("Choose a category to move the jewellery into.");
      const dest = await findCategory(sql, destRaw);
      if (!dest) throw new Error("Choose a category to move the jewellery into.");
      if (dest.toLowerCase() === current.toLowerCase()) {
        throw new Error("Choose a different category for those pieces.");
      }
      await rewritePieceCategories(sql, current, dest);
    }
    await sql.query(`delete from house_categories where name = $1`, [current]);
    return categoryBundle();
  });

