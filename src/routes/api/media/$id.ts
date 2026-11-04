import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { ensureHouse } from "@/lib/server/house";

export const Route = createFileRoute("/api/media/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = String(params.id ?? "").replace(/[^a-z0-9_-]/gi, "");
        if (!id) return new Response("Not found", { status: 404 });
        await ensureHouse();
        const sql = await getSql();
        const rows = await sql.query<{ mime: string; body: string }>(
          `select mime, body from house_media where id = $1`,
          [id],
        );
        const row = rows[0];
        if (!row?.body) return new Response("Not found", { status: 404 });
        const bytes = Buffer.from(row.body, "base64");
        return new Response(bytes, {
          headers: {
            "Content-Type": row.mime || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
