import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { ensureHouse } from "@/lib/server/house";

export const Route = createFileRoute("/api/media/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const id = String(params.id ?? "").replace(/[^a-z0-9_-]/gi, "");
        if (!id) return new Response("Not found", { status: 404 });
        const thumbnail = new URL(request.url).searchParams.get("size") === "thumb";
        await ensureHouse();
        const sql = await getSql();
        const rows = await sql.query<{
          mime: string;
          body: string;
          thumb_mime: string | null;
          thumb_body: string | null;
        }>(
          `select mime, body, thumb_mime, thumb_body from house_media where id = $1`,
          [id],
        );
        const row = rows[0];
        if (!row?.body) return new Response("Not found", { status: 404 });

        const useThumb = thumbnail && Boolean(row.thumb_body);
        const bytes = Buffer.from(useThumb ? row.thumb_body! : row.body, "base64");
        return new Response(bytes, {
          headers: {
            "Content-Type": useThumb ? row.thumb_mime || "image/webp" : row.mime || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
