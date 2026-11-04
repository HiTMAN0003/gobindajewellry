
import { createFileRoute } from "@tanstack/react-router";
import { randomUUID } from "node:crypto";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import { requireUserId, UnauthorizedError } from "@/lib/auth/verify.server";
import { ForbiddenError, requireStudio } from "@/lib/server/access";
import { getSql } from "@/lib/db";
import { restoreBackupZip } from "@/lib/server/backup";

const MAX_BACKUP_SIZE = 40_000_000;
const MAX_CHUNK_SIZE = 1_000_000;
const MAX_CHUNKS = Math.ceil(MAX_BACKUP_SIZE / MAX_CHUNK_SIZE);

function bearerFrom(request: Request) {
  const raw = request.headers.get("authorization");
  if (!raw?.toLowerCase().startsWith("bearer ")) return undefined;
  return raw.slice(7).trim() || undefined;
}

async function guard(request: Request) {
  assertSameSiteRequest();
  const userId = await requireUserId(bearerFrom(request));
  await requireStudio(userId);
  return userId;
}

function fail(err: unknown) {
  if (err instanceof UnauthorizedError) {
    return new Response("Sign in required.", { status: 401 });
  }
  if (err instanceof ForbiddenError) {
    return new Response(err.message, { status: 403 });
  }
  const message = err instanceof Error ? err.message : "Backup upload failed.";
  return new Response(message, { status: 400 });
}

export const Route = createFileRoute("/api/backup-upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const userId = await guard(request);
          const url = new URL(request.url);
          const action = url.searchParams.get("action");
          const sql = await getSql();

          if (action === "start") {
            const body = await request.json() as {
              size?: number;
              chunks?: number;
            };
            const size = Number(body.size);
            const chunks = Number(body.chunks);

            if (!Number.isSafeInteger(size) || size < 32 || size > MAX_BACKUP_SIZE) {
              return new Response("Backup must be between 32 bytes and 40 MB.", { status: 400 });
            }
            if (!Number.isInteger(chunks) || chunks < 1 ||
                chunks > MAX_CHUNKS || chunks !== Math.ceil(size / MAX_CHUNK_SIZE)) {
              return new Response("Invalid upload chunk count.", { status: 400 });
            }

            await sql.query(
              `delete from backup_uploads where created_at < now() - interval '24 hours'`
            );

            const uploadId = randomUUID();
            await sql.query(
              `insert into backup_uploads (id, user_id, total_size, total_chunks)
               values ($1, $2, $3, $4)`,
              [uploadId, userId, size, chunks]
            );

            return Response.json({ uploadId, chunkSize: MAX_CHUNK_SIZE });
          }

          if (action === "chunk") {
            const uploadId = url.searchParams.get("uploadId") || "";
            const index = Number(url.searchParams.get("index"));

            if (!/^[0-9a-f-]{36}$/i.test(uploadId) ||
                !Number.isInteger(index) || index < 0) {
              return new Response("Invalid upload details.", { status: 400 });
            }

            const uploads = await sql.query<{ total_chunks: number }>(
              `select total_chunks from backup_uploads
               where id = $1 and user_id = $2`,
              [uploadId, userId]
            );

            if (!uploads[0] || index >= Number(uploads[0].total_chunks)) {
              return new Response("Upload not found or chunk index is invalid.", { status: 404 });
            }

            const bytes = Buffer.from(await request.arrayBuffer());
            if (!bytes.length || bytes.length > MAX_CHUNK_SIZE) {
              return new Response("Invalid chunk size.", { status: 400 });
            }

            await sql.query(
              `insert into backup_upload_chunks (upload_id, chunk_index, body)
               values ($1, $2, $3)
               on conflict (upload_id, chunk_index)
               do update set body = excluded.body`,
              [uploadId, index, bytes.toString("base64")]
            );

            return Response.json({ ok: true, index });
          }

          if (action === "finish") {
            const body = await request.json() as { uploadId?: string };
            const uploadId = String(body.uploadId || "");

            if (!/^[0-9a-f-]{36}$/i.test(uploadId)) {
              return new Response("Invalid upload id.", { status: 400 });
            }

            const uploads = await sql.query<{
              total_size: number | string;
              total_chunks: number;
            }>(
              `select total_size, total_chunks from backup_uploads
               where id = $1 and user_id = $2`,
              [uploadId, userId]
            );

            const upload = uploads[0];
            if (!upload) {
              return new Response("Upload expired or not found. Please try again.", { status: 404 });
            }

            const chunks = await sql.query<{
              chunk_index: number;
              body: string;
            }>(
              `select chunk_index, body from backup_upload_chunks
               where upload_id = $1 order by chunk_index`,
              [uploadId]
            );

            if (chunks.length !== Number(upload.total_chunks) ||
                chunks.some((chunk, index) => Number(chunk.chunk_index) !== index)) {
              return new Response("Some upload parts are missing. Please retry.", { status: 400 });
            }

            const parts = chunks.map(chunk => Buffer.from(chunk.body, "base64"));
            const total = parts.reduce((sum, part) => sum + part.length, 0);

            if (total !== Number(upload.total_size)) {
              return new Response("Uploaded file size does not match.", { status: 400 });
            }

            const zip = Buffer.concat(parts, total);
            const result = await restoreBackupZip(zip);

            await sql.query(
              `delete from backup_uploads where id = $1 and user_id = $2`,
              [uploadId, userId]
            );

            return Response.json({ ok: true, ...result });
          }

          if (action === "abort") {
            const body = await request.json() as { uploadId?: string };
            const uploadId = String(body.uploadId || "");

            if (/^[0-9a-f-]{36}$/i.test(uploadId)) {
              await sql.query(
                `delete from backup_uploads where id = $1 and user_id = $2`,
                [uploadId, userId]
              );
            }

            return Response.json({ ok: true });
          }

          return new Response("Unknown backup upload action.", { status: 400 });
        } catch (err) {
          return fail(err);
        }
      }
    }
  }
});
