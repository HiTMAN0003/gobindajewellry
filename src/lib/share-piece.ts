import { PRIMARY_SITE_ORIGIN } from "@/lib/site-origin";
import { STORE_PHONE_E164 } from "@/lib/store-info";
import { categoriesOf, type Jewellery } from "@/lib/types";

export function pieceShareUrl(id: string, photo = 0) {
  const url = new URL(PRIMARY_SITE_ORIGIN);
  url.searchParams.set("piece", id);
  if (photo > 0) url.searchParams.set("photo", String(photo));
  url.hash = "gallery";
  return url.toString();
}

export function parsePieceShare(search: string) {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const piece = (params.get("piece") ?? "").trim();
  const raw = Number(params.get("photo") ?? "0");
  const photo = Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : 0;
  return { piece, photo };
}

export function whatsAppProductUrl(item: Jewellery, photo = 0) {
  const url = pieceShareUrl(item.id, photo);
  const category = categoriesOf(item).join(" · ");
  const lines = [
    "Hello! I'm interested in this product:",
    "",
    `💍 ${item.name}`,
  ];
  if (category) lines.push(category);
  lines.push("", `🔗 ${url}`, "", "Please share more details.");
  return `https://wa.me/${STORE_PHONE_E164}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function shareJewellery(item: Jewellery, photo = 0) {
  const href = whatsAppProductUrl(item, photo);
  const opened = window.open(href, "_blank", "noopener,noreferrer");
  if (!opened) window.location.assign(href);
}