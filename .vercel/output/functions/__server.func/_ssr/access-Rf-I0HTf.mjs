import { r as createServerFn } from "./ssr.mjs";
import { i as getSql, t as authMiddleware } from "./middleware-WMVw_eg4.mjs";
import { t as ensureHouse } from "./house-Ci01kSoO.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/access-Rf-I0HTf.js
var ForbiddenError = class extends Error {
	constructor(message = "Studio access required.") {
		super(message);
		this.name = "ForbiddenError";
	}
};
async function userEmail(userId) {
	return ((await (await getSql()).query(`select email from "user" where id = $1`, [userId]))[0]?.email ?? "").toLowerCase();
}
async function requireStudio(userId) {
	await ensureHouse();
	const sql = await getSql();
	const email = await userEmail(userId);
	const members = await sql.query(`select role from studio_members where user_id = $1`, [userId]);
	if (members[0]) return {
		email,
		role: members[0].role
	};
	if (((await sql.query(`select count(*)::int as n from studio_members`))[0]?.n ?? 0) === 0) {
		await sql.query(`insert into studio_members (user_id, email, role) values ($1, $2, 'owner')`, [userId, email || userId]);
		return {
			email,
			role: "owner"
		};
	}
	if (email) {
		if ((await sql.query(`select email from studio_invites where lower(email) = $1`, [email]))[0]) {
			await sql.query(`insert into studio_members (user_id, email, role) values ($1, $2, 'member')
         on conflict (user_id) do nothing`, [userId, email]);
			await sql.query(`delete from studio_invites where lower(email) = $1`, [email]);
			return {
				email,
				role: "member"
			};
		}
	}
	throw new ForbiddenError("This studio is private. Ask the owner to invite your email.");
}
var getStudioSession = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("382cefd8ed5f5209c94af35036cae16b8cb5cf7e51c96708a8358cab1c16504b"));
//#endregion
export { requireStudio as n, getStudioSession as t };
