import { createFileRoute } from "@tanstack/react-router";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import { requireUserId, UnauthorizedError } from "@/lib/auth/verify.server";
import { ForbiddenError, requireStudio } from "@/lib/server/access";
import { buildBackupZip, restoreBackupZip } from "@/lib/server/backup";

function bearerFrom(request: Request) {
  const raw = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!raw?.toLowerCase().startsWith("bearer ")) return undefined;
  return raw.slice(7).trim() || undefined;
}

async function guard(request: Request) {
  assertSameSiteRequest();
  const userId = await requireUserId(bearerFrom(request));
  await requireStudio(userId);
}

function fail(err: unknown) {
  if (err instanceof UnauthorizedError) return new Response("Sign in required.", { status: 401 });
  if (err instanceof ForbiddenError) return new Response(err.message, { status: 403 });
  const message = err instanceof Error ? err.message : "Backup failed.";
  return new Response(message, { status: 400 });
}

export const Route = createFileRoute("/api/backup")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await guard(request);
          const zip = await buildBackupZip();
          const day = new Date().toISOString().slice(0, 10);
          return new Response(new Uint8Array(zip), {
            headers: {
              "Content-Type": "application/zip",
              "Content-Disposition": `attachment; filename="gobinda-backup-${day}.zip"`,
              "Cache-Control": "no-store",
            },
          });
        } catch (err) {
          return fail(err);
        }
      },
      POST: async ({ request }) => {
        try {
          await guard(request);
          const form = await request.formData();
          const file = form.get("file");
          if (!(file instanceof File) || file.size < 32) {
            return new Response("Choose a Gobinda backup zip.", { status: 400 });
          }
          if (file.size > 40_000_000) {
            return new Response("That backup is too large (40 MB max).", { status: 400 });
          }
          const buf = Buffer.from(await file.arrayBuffer());
          const result = await restoreBackupZip(buf);
          return Response.json({ ok: true, ...result });
        } catch (err) {
          return fail(err);
        }
      },
    },
  },
});
