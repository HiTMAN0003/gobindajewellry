export type PieceEntry = { id: string; photo: number; depth: number };

const PIECE = "gobindaPiece";
const MENU = "gobindaMenu";

function cloneState(state: unknown): Record<string, unknown> {
  return state && typeof state === "object" ? { ...(state as Record<string, unknown>) } : {};
}

function bump(state: Record<string, unknown>) {
  const idx = Number(state.__TSR_index ?? 0);
  state.__TSR_index = Number.isFinite(idx) ? idx + 1 : 1;
  return state;
}

export function readPieceEntry(state: unknown = typeof history !== "undefined" ? history.state : null): PieceEntry | null {
  if (!state || typeof state !== "object" || !(PIECE in state)) return null;
  const raw = (state as Record<string, unknown>)[PIECE];
  if (!raw || typeof raw !== "object") return null;
  const id = String((raw as { id?: unknown }).id ?? "").trim();
  if (!id) return null;
  const photo = Number((raw as { photo?: unknown }).photo ?? 0);
  const depth = Number((raw as { depth?: unknown }).depth ?? 1);
  return {
    id,
    photo: Number.isFinite(photo) && photo >= 0 ? Math.floor(photo) : 0,
    depth: Number.isFinite(depth) && depth > 0 ? Math.floor(depth) : 1,
  };
}

export function readMenuEntry(state: unknown = typeof history !== "undefined" ? history.state : null) {
  return Boolean(state && typeof state === "object" && (state as Record<string, unknown>)[MENU] === true);
}

function currentHref() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function stripPieceHref() {
  const url = new URL(window.location.href);
  url.searchParams.delete("piece");
  url.searchParams.delete("photo");
  return `${url.pathname}${url.search}${url.hash}`;
}

export function pieceHref(id: string, photo: number) {
  const url = new URL(window.location.href);
  url.searchParams.set("piece", id);
  if (photo > 0) url.searchParams.set("photo", String(photo));
  else url.searchParams.delete("photo");
  if (!url.hash) url.hash = "gallery";
  return `${url.pathname}${url.search}${url.hash}`;
}

export function pushPieceEntry(id: string, photo: number) {
  const current = readPieceEntry();
  if (current?.id === id && current.photo === photo) return current;
  const base = bump(cloneState(window.history.state));
  delete base[MENU];
  const entry: PieceEntry = { id, photo, depth: current ? current.depth + 1 : 1 };
  base[PIECE] = entry;
  window.history.pushState(base, "", currentHref());
  return entry;
}

export function replacePiecePhoto(photo: number) {
  const current = readPieceEntry();
  if (!current || current.photo === photo) return;
  const base = cloneState(window.history.state);
  base[PIECE] = { ...current, photo };
  window.history.replaceState(base, "", currentHref());
}

export function pushMenuEntry() {
  if (readMenuEntry()) return;
  const base = bump(cloneState(window.history.state));
  delete base[PIECE];
  base[MENU] = true;
  window.history.pushState(base, "", currentHref());
}

export function seedDirectPiece(id: string, photo: number) {
  if (readPieceEntry()?.id === id) return;
  const cleared = cloneState(window.history.state);
  delete cleared[PIECE];
  delete cleared[MENU];
  window.history.replaceState(cleared, "", stripPieceHref());
  const base = bump(cloneState(window.history.state));
  base[PIECE] = { id, photo, depth: 1 } satisfies PieceEntry;
  window.history.pushState(base, "", pieceHref(id, photo));
}

/** Drop the overlay entries we added. Popstate applies the resulting screen. */
export function retreatOverlay(depth: number) {
  const steps = Math.max(1, Math.floor(depth));
  if (steps === 1) window.history.back();
  else window.history.go(-steps);
}
