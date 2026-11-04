import { r as createServerFn } from "./ssr.mjs";
import { i as getSql, t as authMiddleware } from "./middleware-WMVw_eg4.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as ensureHouse } from "./house-Ci01kSoO.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { n as requireStudio } from "./access-Rf-I0HTf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-D8JMqRHK.js
var HERO_DEFAULT = [
	"/images/hero-1.jpg",
	"/images/hero-2.jpg",
	"/images/hero-3.jpg",
	"/images/hero-4.jpg",
	"/images/hero-5.jpg"
];
var SEED = [
	{
		id: "j1",
		name: "Sona Temple Haar",
		metal: "gold",
		cat: "Necklaces",
		description: "Hand-finished temple necklace.",
		images: ["/images/gold-temple-necklace.jpg"],
		featured: true,
		sortOrder: 1
	},
	{
		id: "j2",
		name: "Kundan Bridal Suite",
		metal: "gold",
		cat: "Bridal Jewellery",
		description: "Bridal set finished in the house workshop.",
		images: ["/images/gold-bridal-set.jpg"],
		featured: true,
		sortOrder: 2
	},
	{
		id: "j3",
		name: "Chandbali Jhumkas",
		metal: "gold",
		cat: "Earrings",
		description: "Classic chandbali jhumkas.",
		images: ["/images/gold-jhumkas.jpg"],
		featured: true,
		sortOrder: 3
	},
	{
		id: "j4",
		name: "Lakshmi Temple Bangles",
		metal: "gold",
		cat: "Bangles",
		description: "Temple-work bangles.",
		images: ["/images/gold-bangles.jpg"],
		featured: true,
		sortOrder: 4
	},
	{
		id: "j5",
		name: "House Mangalsutra",
		metal: "gold",
		cat: "Necklaces",
		description: "Black-bead mangalsutra.",
		images: ["/images/gold-mangalsutra.jpg"],
		featured: true,
		sortOrder: 5
	},
	{
		id: "j6",
		name: "Chandi Tribal Haar",
		metal: "silver",
		cat: "Necklaces",
		description: "Heavy silver haar.",
		images: ["/images/silver-necklace.jpg"],
		featured: true,
		sortOrder: 6
	},
	{
		id: "j7",
		name: "Polki Halo Ring",
		metal: "gold",
		cat: "Rings",
		description: "Polki halo ring.",
		images: ["/images/gold-ring.jpg"],
		featured: false,
		sortOrder: 7
	},
	{
		id: "j8",
		name: "Heritage Link Bracelet",
		metal: "gold",
		cat: "Bracelets",
		description: "Hand-linked bracelet.",
		images: ["/images/gold-bracelet.jpg"],
		featured: false,
		sortOrder: 8
	},
	{
		id: "j9",
		name: "Teardrop Maang Tikka",
		metal: "gold",
		cat: "Bridal Jewellery",
		description: "Bridal maang tikka.",
		images: ["/images/gold-tikka.jpg"],
		featured: false,
		sortOrder: 9
	},
	{
		id: "j10",
		name: "Handwoven Gold Chain",
		metal: "gold",
		cat: "Handcrafted Designs",
		description: "Woven chain.",
		images: ["/images/gold-chain.jpg"],
		featured: false,
		sortOrder: 10
	},
	{
		id: "j11",
		name: "Diamond Bali Hoops",
		metal: "gold",
		cat: "Earrings",
		description: "Bali hoops.",
		images: ["/images/gold-bali.jpg"],
		featured: false,
		sortOrder: 11
	},
	{
		id: "j12",
		name: "Ghungroo Silver Jhumkas",
		metal: "silver",
		cat: "Earrings",
		description: "Bell jhumkas.",
		images: ["/images/silver-jhumkas.jpg"],
		featured: false,
		sortOrder: 12
	},
	{
		id: "j13",
		name: "Rajwada Silver Kada",
		metal: "silver",
		cat: "Bangles",
		description: "Heavy silver kada.",
		images: ["/images/silver-kada.jpg"],
		featured: false,
		sortOrder: 13
	},
	{
		id: "j14",
		name: "Payal of Bells",
		metal: "silver",
		cat: "Anklets",
		description: "Silver payal.",
		images: ["/images/silver-payal.jpg"],
		featured: false,
		sortOrder: 14
	},
	{
		id: "j15",
		name: "Sterling Cocktail Ring",
		metal: "silver",
		cat: "Rings",
		description: "Silver cocktail ring.",
		images: ["/images/silver-ring.jpg"],
		featured: false,
		sortOrder: 15
	}
];
function parseImages(raw) {
	if (Array.isArray(raw)) return raw.filter((x) => typeof x === "string");
	if (typeof raw === "string") try {
		const v = JSON.parse(raw);
		return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
	} catch {
		return [];
	}
	return [];
}
function mapItem(row) {
	return {
		id: String(row.id),
		name: String(row.name),
		metal: row.metal === "silver" ? "silver" : "gold",
		cat: String(row.cat ?? ""),
		description: String(row.description ?? ""),
		images: parseImages(row.images),
		featured: Boolean(row.featured),
		sortOrder: Number(row.sort_order ?? 0)
	};
}
async function silentSelect(sql, text) {
	try {
		return await sql.query(text);
	} catch {
		return [];
	}
}
async function bootstrap() {
	await ensureHouse();
	const sql = await getSql();
	if (((await sql.query(`select count(*)::int as n from house_pieces`))[0]?.n ?? 0) === 0) {
		const legacy = await silentSelect(sql, `select * from jewellery`);
		const source = legacy.length > 0 && legacy.some((row) => parseImages(row.images).length > 0) ? legacy.map(mapItem) : SEED;
		for (const it of source) await sql.query(`insert into house_pieces (id, name, metal, cat, description, images, featured, sort_order)
         values ($1,$2,$3,$4,$5,$6::jsonb,$7,$8) on conflict (id) do nothing`, [
			it.id,
			it.name,
			it.metal,
			it.cat,
			it.description,
			JSON.stringify(it.images),
			it.featured,
			it.sortOrder
		]);
	}
	await sql.query(`insert into house_profile (id, founder_name, founder_image, hero_images)
     values (1, 'Gobinda', '/images/founder.jpg', $1::jsonb)
     on conflict (id) do nothing`, [JSON.stringify(HERO_DEFAULT)]);
	if (parseImages((await sql.query(`select hero_images from house_profile where id = 1`))[0]?.hero_images).length === 0) {
		const old = await silentSelect(sql, `select * from store_settings where id = 1`);
		const hero = parseImages(old[0]?.hero_images);
		await sql.query(`update house_profile set
         founder_name = coalesce(nullif($1, ''), founder_name),
         founder_image = coalesce(nullif($2, ''), founder_image),
         hero_images = $3::jsonb
       where id = 1`, [
			String(old[0]?.founder_name ?? ""),
			String(old[0]?.founder_image ?? ""),
			JSON.stringify(hero.length ? hero : HERO_DEFAULT)
		]);
	}
	await sql.query(`insert into house_rates (id, gold_per_tola, silver_per_kg) values (1, 0, 0)
     on conflict (id) do nothing`);
	const rates = await sql.query(`select gold_per_tola, silver_per_kg from house_rates where id = 1`);
	if (!(rates[0]?.gold_per_tola || rates[0]?.silver_per_kg)) {
		const old = await silentSelect(sql, `select * from metal_rates where id = 1`);
		const gold = Number(old[0]?.gold_per_tola ?? 0);
		const silver = Number(old[0]?.silver_per_kg ?? 0);
		if (gold > 0 || silver > 0) await sql.query(`update house_rates set gold_per_tola = $1, silver_per_kg = $2 where id = 1`, [gold, silver]);
	}
}
var boot = null;
async function ready() {
	if (!boot) boot = bootstrap().catch((err) => {
		boot = null;
		throw err;
	});
	return boot;
}
async function readItems() {
	return (await (await getSql()).query(`select * from house_pieces order by featured desc, sort_order, name`)).map(mapItem);
}
async function readRates() {
	const r = (await (await getSql()).query(`select gold_per_tola, silver_per_kg, as_of from house_rates where id = 1`))[0];
	return {
		goldPerTola: Number(r?.gold_per_tola ?? 0),
		silverPerKg: Number(r?.silver_per_kg ?? 0),
		asOf: r?.as_of ?? null
	};
}
async function readSettings() {
	const r = (await (await getSql()).query(`select founder_name, founder_image, hero_images from house_profile where id = 1`))[0];
	const hero = parseImages(r?.hero_images);
	return {
		founderName: String(r?.founder_name ?? "Gobinda"),
		founderImage: String(r?.founder_image ?? "/images/founder.jpg"),
		heroImages: hero.length ? hero : HERO_DEFAULT
	};
}
var getStorefront_createServerFn_handler = createServerRpc({
	id: "26949476df6d4084ed50a1335467c20a327b12704e74a296394dc03e66e6fe98",
	name: "getStorefront",
	filename: "src/lib/server/store.ts"
}, (opts) => getStorefront.__executeServer(opts));
var getStorefront = createServerFn({ method: "GET" }).handler(getStorefront_createServerFn_handler, async () => {
	await ready();
	const [items, rates, settings] = await Promise.all([
		readItems(),
		readRates(),
		readSettings()
	]);
	return {
		items,
		rates,
		settings
	};
});
var ratesInput = object({
	goldPerTola: number().min(0).max(1e8),
	silverPerKg: number().min(0).max(1e8)
});
var saveMetalRates_createServerFn_handler = createServerRpc({
	id: "88a8d22bf3450dd5edf06b061460aa1d5326dcf3d75f6be59e0269a535fd4626",
	name: "saveMetalRates",
	filename: "src/lib/server/store.ts"
}, (opts) => saveMetalRates.__executeServer(opts));
var saveMetalRates = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(ratesInput).handler(saveMetalRates_createServerFn_handler, async ({ data, context }) => {
	await ready();
	await requireStudio(context.userId);
	await (await getSql()).query(`update house_rates set gold_per_tola = $1, silver_per_kg = $2, as_of = now() where id = 1`, [data.goldPerTola, data.silverPerKg]);
	return readRates();
});
var pieceInput = object({
	id: string().optional(),
	name: string().min(1).max(120),
	metal: _enum(["gold", "silver"]),
	cat: string().min(1).max(80),
	description: string().max(2e3).optional(),
	images: array(string()).max(8),
	featured: boolean()
});
var saveJewellery_createServerFn_handler = createServerRpc({
	id: "fee04ecafdfae6b2628dff17ceb7ec36eec0f8805abeb945573d20dac0fcbc5e",
	name: "saveJewellery",
	filename: "src/lib/server/store.ts"
}, (opts) => saveJewellery.__executeServer(opts));
var saveJewellery = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(pieceInput).handler(saveJewellery_createServerFn_handler, async ({ data, context }) => {
	await ready();
	await requireStudio(context.userId);
	const sql = await getSql();
	const id = data.id || `j-${Date.now()}`;
	await sql.query(`insert into house_pieces (id, name, metal, cat, description, images, featured, sort_order)
       values ($1,$2,$3,$4,$5,$6::jsonb,$7,100)
       on conflict (id) do update set
         name = excluded.name,
         metal = excluded.metal,
         cat = excluded.cat,
         description = excluded.description,
         images = excluded.images,
         featured = excluded.featured`, [
		id,
		data.name,
		data.metal,
		data.cat,
		data.description ?? "",
		JSON.stringify(data.images),
		data.featured
	]);
	return readItems();
});
var deleteJewellery_createServerFn_handler = createServerRpc({
	id: "be44539744abf9df2c0d4c24f193b228c46c2a96702b5f3d34ac74ad9e5f4c2d",
	name: "deleteJewellery",
	filename: "src/lib/server/store.ts"
}, (opts) => deleteJewellery.__executeServer(opts));
var deleteJewellery = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(deleteJewellery_createServerFn_handler, async ({ data, context }) => {
	await ready();
	await requireStudio(context.userId);
	await (await getSql()).query(`delete from house_pieces where id = $1`, [data.id]);
	return readItems();
});
var settingsInput = object({
	founderName: string().min(1).max(80),
	founderImage: string().min(1),
	heroImages: array(string()).min(1).max(8)
});
var saveSettings_createServerFn_handler = createServerRpc({
	id: "02c643a3fbe8233517e4bfbde1c8e8b5e57b74f2708374db5789217e0a386f93",
	name: "saveSettings",
	filename: "src/lib/server/store.ts"
}, (opts) => saveSettings.__executeServer(opts));
var saveSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(settingsInput).handler(saveSettings_createServerFn_handler, async ({ data, context }) => {
	await ready();
	await requireStudio(context.userId);
	await (await getSql()).query(`update house_profile set founder_name = $1, founder_image = $2, hero_images = $3::jsonb where id = 1`, [
		data.founderName,
		data.founderImage,
		JSON.stringify(data.heroImages)
	]);
	return readSettings();
});
var inviteStudio_createServerFn_handler = createServerRpc({
	id: "e034cb704abca60d7be2627a61481f48ff16aead084a88ab9a352b78f9ba2160",
	name: "inviteStudio",
	filename: "src/lib/server/store.ts"
}, (opts) => inviteStudio.__executeServer(opts));
var inviteStudio = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ email: string().email() })).handler(inviteStudio_createServerFn_handler, async ({ data, context }) => {
	if ((await requireStudio(context.userId)).role !== "owner") throw new Error("Only the owner can invite.");
	await (await getSql()).query(`insert into studio_invites (email, invited_by) values ($1, $2)
       on conflict (email) do nothing`, [data.email.toLowerCase(), context.userId]);
	return { ok: true };
});
//#endregion
export { deleteJewellery_createServerFn_handler, getStorefront_createServerFn_handler, inviteStudio_createServerFn_handler, saveJewellery_createServerFn_handler, saveMetalRates_createServerFn_handler, saveSettings_createServerFn_handler };
