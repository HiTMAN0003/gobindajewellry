import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import type { StudioInvite, StudioMember } from "@/lib/types";
import { ensureHouse } from "./house";

export const OWNER_EMAIL = "pavitrasanatan@gmail.com";

export class ForbiddenError extends Error {
  constructor(message = "Studio access required.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

async function userEmail(userId: string): Promise<string> {
  const sql = await getSql();
  const rows = await sql.query<{ email: string }>(
    `select email from "user" where id = $1`,
    [userId],
  );
  return (rows[0]?.email ?? "").toLowerCase();
}

async function listPeople(): Promise<{ members: StudioMember[]; invites: StudioInvite[] }> {
  const sql = await getSql();
  const membersPromise = sql.query<StudioMember>(
    `select user_id as "userId", email, role from studio_members order by role desc, email`,
  );
  const invitesPromise = sql.query<StudioInvite>(
    `select email, created_at as "createdAt" from studio_invites order by created_at desc`,
  );
  const [members, invites] = await Promise.all([membersPromise, invitesPromise]); return { members, invites };
}

export async function requireStudio(userId: string): Promise<{
  email: string;
  role: string;
}> {
  await ensureHouse();
  const sql = await getSql();
  const email = await userEmail(userId);

  if (email === OWNER_EMAIL) {
    await sql.query(
      `insert into studio_members (user_id, email, role) values ($1, $2, 'owner')
       on conflict (user_id) do update set email = excluded.email, role = 'owner'`,
      [userId, email],
    );
    await sql.query(
      `update studio_members set role = 'member' where lower(email) <> $1 and role = 'owner'`,
      [OWNER_EMAIL],
    );
    return { email, role: "owner" };
  }

  const members = await sql.query<{ role: string }>(
    `select role from studio_members where user_id = $1`,
    [userId],
  );
  if (members[0]) return { email, role: members[0].role };

  if (email) {
    const inv = await sql.query<{ email: string }>(
      `select email from studio_invites where lower(email) = $1`,
      [email],
    );
    if (inv[0]) {
      await sql.query(
        `insert into studio_members (user_id, email, role) values ($1, $2, 'member')
         on conflict (user_id) do nothing`,
        [userId, email],
      );
      await sql.query(`delete from studio_invites where lower(email) = $1`, [email]);
      return { email, role: "member" };
    }
  }

  throw new ForbiddenError("This studio is private. Ask the owner to invite your email.");
}

export const getStudioSession = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const access = await requireStudio(context.userId);
    const people = await listPeople();
    return { ...access, userId: context.userId, ...people };
  });

export const inviteStudio = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data, context }) => {
    const access = await requireStudio(context.userId);
    if (access.role !== "owner") throw new Error("Only the admin can invite.");
    const sql = await getSql();
    const email = data.email.toLowerCase();
    const existing = await sql.query<{ user_id: string }>(
      `select user_id from studio_members where lower(email) = $1`,
      [email],
    );
    if (existing[0]) throw new Error("That email is already in the studio.");
    await sql.query(
      `insert into studio_invites (email, invited_by) values ($1, $2)
       on conflict (email) do nothing`,
      [email, context.userId],
    );
    return listPeople();
  });

export const removeStudioMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const access = await requireStudio(context.userId);
    if (access.role !== "owner") throw new Error("Only the admin can remove users.");
    if (data.userId === context.userId) throw new Error("You cannot remove yourself.");
    const sql = await getSql();
    const target = await sql.query<{ email: string }>(
      `select email from studio_members where user_id = $1`,
      [data.userId],
    );
    if (!target[0]) throw new Error("User not found.");
    if (target[0].email.toLowerCase() === OWNER_EMAIL) throw new Error("The house admin cannot be removed.");
    await sql.query(`delete from studio_members where user_id = $1`, [data.userId]);
    return listPeople();
  });

export const revokeStudioInvite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data, context }) => {
    const access = await requireStudio(context.userId);
    if (access.role !== "owner") throw new Error("Only the admin can remove invites.");
    const sql = await getSql();
    await sql.query(`delete from studio_invites where lower(email) = $1`, [data.email.toLowerCase()]);
    return listPeople();
  });
