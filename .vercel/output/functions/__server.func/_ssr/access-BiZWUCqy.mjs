import { r as createServerFn } from "./ssr.mjs";
import { i as getSql, t as authMiddleware } from "./middleware-WMVw_eg4.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as ensureHouse } from "./house-Ci01kSoO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/access-BiZWUCqy.js
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
var getStudioSession_createServerFn_handler = createServerRpc({
	id: "382cefd8ed5f5209c94af35036cae16b8cb5cf7e51c96708a8358cab1c16504b",
	name: "getStudioSession",
	filename: "src/lib/server/access.ts"
}, (opts) => getStudioSession.__executeServer(opts));
var getStudioSession = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getStudioSession_createServerFn_handler, async ({ context }) => {
	const access = await requireStudio(context.userId);
	const sql = await getSql();
	const members = await sql.query(`select user_id as "userId", email, role from studio_members order by created_at`);
	const invites = await sql.query(`select email, created_at as "createdAt" from studio_invites order by created_at desc`);
	return {
		...access,
		userId: context.userId,
		members,
		invites
	};
});
//#endregion
export { getStudioSession_createServerFn_handler };
