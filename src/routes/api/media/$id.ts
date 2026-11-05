import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { ensureHouse } from "@/lib/server/house";
import { getPublicImageUrl } from "@/lib/server/object-storage";

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
          object_key: string | null;
          thumb_object_key: string | null;
        }>(
          `select mime, body, thumb_mime, thumb_body, object_key, thumb_object_key
           from house_media where id = $1`,
          [id],
        );

        const row = rows[0];
        if (!row) return new Response("Not found", { status: 404 });

        const objectKey = thumbnail
          ? row.thumb_object_key || row.object_key
          : row.object_key;

        if (objectKey) {
          return Response.redirect(getPublicImageUrl(objectKey), 302);
        }

        const useThumb = thumbnail && Boolean(row.thumb_body);
        const body = useThumb ? row.thumb_body : row.body;
        if (!body) return new Response("Not found", { status: 404 });

        const bytes = Buffer.from(body, "base64");
        return new Response(bytes, {
          headers: {
            "Content-Type": useThumb
              ? row.thumb_mime || "image/webp"
              : row.mime || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
