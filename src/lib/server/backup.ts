import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { getSql } from "@/lib/db";
import { audiencesOf } from "@/lib/types";
import { ensureHouse } from "./house";
import { getImageObject, putImageObject } from "./object-storage";
import { ensureCategoryRows, ensureAudienceColumn } from "./store";
import { unzipStore, zipStore, type ZipEntry } from "./zip";

const KIND = "gobinda-jewellers-backup";

type Piece = {
  id: string;
  name: string;
  metal: string;
  cat: string;
  cats?: string[];
  audience?: string;
  audiences?: string[];
  description: string;
  images: string[];
  featured: boolean;
  sortOrder: number;
};

type Manifest = {
  kind: string;
  version: number;
  exportedAt: string;
  pieces: Piece[];
  categories?: { name: string; sortOrder: number; icon?: string; shown?: boolean }[];
  profile: { founderName: string; founderImage: string; heroImages: string[] };
  rates: { goldPerTola: number; silverPerKg: number; asOf: string | null };
  media: { id: string; mime: string; file: string; thumbFile?: string }[];
};

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

function extFor(mime: string) {
  if (mime.includes("png")) return ".png";
  if (mime.includes("webp")) return ".webp";
  return ".jpg";
}

function mimeFor(name: string, fallback = "image/jpeg") {
  const ext = extname(name).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return fallback;
}

function imagesDir() {
  return join(process.cwd(), "public", "images");
}

export async function buildBackupZip(): Promise<Buffer> {
  await ensureHouse();
  await ensureCategoryRows();
  await ensureAudienceColumn();
  const sql = await getSql();
  const pieceRows = await sql.query<Record<string, unknown>>(
    `select * from house_pieces order by sort_order, name`,
  );
  const pieces: Piece[] = pieceRows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    metal: row.metal === "silver" ? "silver" : "gold",
    cat: String(row.cat ?? ""),
    cats: parseImages(row.cats),
    audience: row.audience === "men" || row.audience === "kids" ? String(row.audience) : "women",
    audiences: audiencesOf({ audience: String(row.audience ?? ""), audiences: parseImages(row.audiences) }),
    description: String(row.description ?? ""),
    images: parseImages(row.images),
    featured: Boolean(row.featured),
    sortOrder: Number(row.sort_order ?? 0),
  }));
  const profileRows = await sql.query<Record<string, unknown>>(
    `select founder_name, founder_image, hero_images from house_profile where id = 1`,
  );
  const pr = profileRows[0];
  const profile = {
    founderName: String(pr?.founder_name ?? "Gobinda"),
    founderImage: String(pr?.founder_image ?? "/images/founder.jpg"),
    heroImages: parseImages(pr?.hero_images),
  };
  const rateRows = await sql.query<{ gold_per_tola: number; silver_per_kg: number; as_of: string | null }>(
    `select gold_per_tola, silver_per_kg, as_of from house_rates where id = 1`,
  );
  const rr = rateRows[0];
  const rates = {
    goldPerTola: Number(rr?.gold_per_tola ?? 0),
    silverPerKg: Number(rr?.silver_per_kg ?? 0),
    asOf: rr?.as_of ?? null,
  };
  const catRows = await sql.query<{ name: string; sort_order: number; icon: string | null; shown: boolean | number | null }>(
    `select name, sort_order, coalesce(icon, '') as icon, coalesce(shown, true) as shown from house_categories order by sort_order, name`,
  );
  const categories = catRows.map((row) => ({
    name: String(row.name),
    sortOrder: Number(row.sort_order ?? 0),
    icon: String(row.icon ?? ""),
    shown: row.shown !== false && row.shown !== 0,
  }));
  const mediaRows = await sql.query<{
    id: string;
    mime: string;
    body: string;
    object_key: string | null;
    thumb_mime: string | null;
    thumb_body: string | null;
    thumb_object_key: string | null;
  }>(
    `select id, mime, body, object_key, thumb_mime, thumb_body, thumb_object_key from house_media`,
  );

  const entries: ZipEntry[] = [];
  const mediaMeta: Manifest["media"] = [];

  for (const row of mediaRows) {
    const ext = extFor(row.mime || "image/jpeg");
    const file = `media/${row.id}${ext}`;
    let imageBytes: Buffer;

    if (row.object_key) {
      const object = await getImageObject(row.object_key);
      if (!object.Body) throw new Error(`Backup could not read image ${row.id}.`);
      imageBytes = Buffer.from(await object.Body.transformToByteArray());
    } else {
      imageBytes = Buffer.from(row.body || "", "base64");
    }

    const meta: Manifest["media"][number] = {
      id: row.id,
      mime: row.mime || "image/jpeg",
      file,
    };
    entries.push({ name: file, data: imageBytes });

    let thumbBytes: Buffer | null = null;
    if (row.thumb_object_key) {
      const thumbObject = await getImageObject(row.thumb_object_key);
      if (!thumbObject.Body) throw new Error(`Backup could not read thumbnail ${row.id}.`);
      thumbBytes = Buffer.from(await thumbObject.Body.transformToByteArray());
    } else if (row.thumb_body) {
      thumbBytes = Buffer.from(row.thumb_body, "base64");
    }

    if (thumbBytes) {
      meta.thumbFile = `media/${row.id}.thumb.webp`;
      entries.push({ name: meta.thumbFile, data: thumbBytes });
    }

    mediaMeta.push(meta);
  }

  const dir = imagesDir();
  if (existsSync(dir)) {
    for (const name of readdirSync(dir)) {
      if (!/\.(jpe?g|png|webp)$/i.test(name)) continue;
      entries.push({ name: `images/${name}`, data: readFileSync(join(dir, name)) });
    }
  }

  const manifest: Manifest = {
    kind: KIND,
    version: 2,
    exportedAt: new Date().toISOString(),
    pieces,
    categories,
    profile,
    rates,
    media: mediaMeta,
  };
  entries.unshift({ name: "manifest.json", data: Buffer.from(JSON.stringify(manifest, null, 2)) });
  return zipStore(entries);
}

export async function restoreBackupZip(buf: Buffer): Promise<{ pieces: number; media: number }> {
  await ensureHouse();
  await ensureCategoryRows();
  await ensureAudienceColumn();
  const files = unzipStore(buf);
  const byName = new Map(files.map((f) => [f.name.replace(/\\/g, "/"), f]));
  const man = byName.get("manifest.json");
  if (!man) throw new Error("That zip is missing manifest.json. Use a Gobinda Full Backup.");
  let parsed: Manifest;
  try {
    parsed = JSON.parse(man.data.toString("utf8")) as Manifest;
  } catch {
    throw new Error("Backup manifest is not valid JSON.");
  }
  if (parsed.kind !== KIND || !Array.isArray(parsed.pieces)) {
    throw new Error("That zip is not a Gobinda Jewellers backup.");
  }

  const sql = await getSql();
  let mediaCount = 0;
  const listed = Array.isArray(parsed.media) ? parsed.media : [];
  const restoredIds = new Set<string>();

  async function restoreMedia(
    id: string,
    mime: string,
    data: Buffer,
    thumbData?: Buffer,
  ) {
    const extension = extFor(mime);
    const objectKey = `jewellery/${id}/original${extension}`;
    const thumbObjectKey = thumbData ? `jewellery/${id}/thumb.webp` : null;

    await putImageObject(objectKey, data, mime);
    if (thumbData && thumbObjectKey) {
      await putImageObject(thumbObjectKey, thumbData, "image/webp");
    }

    await sql.query(
      `insert into house_media
        (id, mime, body, object_key, thumb_mime, thumb_body, thumb_object_key)
       values ($1, $2, '', $3, $4, null, $5)
       on conflict (id) do update
       set mime = excluded.mime, body = '', object_key = excluded.object_key,
           thumb_mime = excluded.thumb_mime, thumb_body = null,
           thumb_object_key = excluded.thumb_object_key`,
      [id, mime, objectKey, thumbData ? "image/webp" : null, thumbObjectKey],
    );

    restoredIds.add(id);
    mediaCount += 1;
  }

  for (const item of listed) {
    const file = byName.get(item.file) ?? byName.get(item.file.replace(/^\.?\//, ""));
    if (!file) continue;

    const id = String(item.id || "").replace(/[^a-z0-9_-]/gi, "");
    if (!id) continue;

    const mime = item.mime || mimeFor(item.file);
    const thumbFile = item.thumbFile ? byName.get(item.thumbFile) : undefined;
    await restoreMedia(id, mime, file.data, thumbFile?.data);
  }

  for (const [name, file] of byName) {
    const match = name.match(/^media\/([a-z0-9_-]+)\.[a-z0-9]+$/i);
    if (!match || restoredIds.has(match[1])) continue;

    await restoreMedia(match[1], mimeFor(name), file.data);
  }

  await sql.query(`delete from house_pieces`);
  for (const it of parsed.pieces) {
    const id = String(it.id || "").trim();
    const name = String(it.name || "").trim();
    if (!id || !name) continue;
    const images = Array.isArray(it.images) ? it.images.filter((x) => typeof x === "string") : [];
    const audiences = audiencesOf({ audience: String(it.audience ?? ""), audiences: it.audiences });
    const cat = String(it.cat || "Handcrafted Designs").slice(0, 80);
    const cats = (Array.isArray(it.cats) ? it.cats : [cat])
      .map((name) => String(name || "").trim())
      .filter(Boolean)
      .slice(0, 6);
    if (!cats.some((n) => n.toLowerCase() === cat.toLowerCase())) cats.unshift(cat);
    await sql.query(
      `insert into house_pieces (id, name, metal, cat, cats, audience, audiences, description, images, featured, sort_order)
       values ($1,$2,$3,$4,$5::jsonb,$6,$7::jsonb,$8,$9::jsonb,$10,$11)
       on conflict (id) do update set
         name = excluded.name, metal = excluded.metal, cat = excluded.cat, cats = excluded.cats,
         audience = excluded.audience, audiences = excluded.audiences,
         description = excluded.description, images = excluded.images,
         featured = excluded.featured, sort_order = excluded.sort_order`,
      [
        id,
        name.slice(0, 120),
        it.metal === "silver" ? "silver" : "gold",
        cats[0] ?? cat,
        JSON.stringify(cats.slice(0, 6)),
        audiences[0],
        JSON.stringify(audiences),
        String(it.description || "").slice(0, 2000),
        JSON.stringify(images.slice(0, 8)),
        Boolean(it.featured),
        Number(it.sortOrder ?? 0),
      ],
    );
  }

  const founderImage = String(parsed.profile?.founderImage || "/images/founder.jpg");
  const heroImages = Array.isArray(parsed.profile?.heroImages) && parsed.profile.heroImages.length
    ? parsed.profile.heroImages
    : ["/images/hero-1.jpg"];
  await sql.query(
    `insert into house_profile (id, founder_name, founder_image, hero_images)
     values (1, $1, $2, $3::jsonb)
     on conflict (id) do update set
       founder_name = excluded.founder_name,
       founder_image = excluded.founder_image,
       hero_images = excluded.hero_images`,
    [String(parsed.profile?.founderName || "Gobinda").slice(0, 80), founderImage, JSON.stringify(heroImages.slice(0, 8))],
  );

  await sql.query(
    `insert into house_rates (id, gold_per_tola, silver_per_kg, as_of)
     values (1, $1, $2, $3)
     on conflict (id) do update set
       gold_per_tola = excluded.gold_per_tola,
       silver_per_kg = excluded.silver_per_kg,
       as_of = excluded.as_of`,
    [
      Number(parsed.rates?.goldPerTola ?? 0),
      Number(parsed.rates?.silverPerKg ?? 0),
      parsed.rates?.asOf ?? null,
    ],
  );

  if (Array.isArray(parsed.categories) && parsed.categories.length) {
    await sql.query(`delete from house_categories`);
    for (let i = 0; i < parsed.categories.length; i += 1) {
      const name = String(parsed.categories[i]?.name ?? "").trim().replace(/\s+/g, " ");
      if (!name || /^all$/i.test(name)) continue;
      const shown = parsed.categories[i]?.shown === false ? false : true;
      await sql.query(
        `insert into house_categories (name, sort_order, icon, shown) values ($1, $2, $3, $4)
         on conflict (name) do update set sort_order = excluded.sort_order, icon = excluded.icon, shown = excluded.shown`,
        [name.slice(0, 80), Number(parsed.categories[i]?.sortOrder ?? i + 1), String(parsed.categories[i]?.icon ?? "").slice(0, 500), shown],
      );
    }
  } else {
    await sql.query(`delete from house_categories`);
  }
  await ensureCategoryRows();

  return { pieces: parsed.pieces.length, media: mediaCount };
}
