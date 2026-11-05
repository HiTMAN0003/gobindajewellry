import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Share2, X } from "lucide-react";
import { ImageOnlyViewer } from "@/components/image-only-viewer";
import { shareJewellery } from "@/lib/share-piece";
import type { Jewellery } from "@/lib/types";
import { categoriesOf } from "@/lib/types";

const SLIDE_MS = 280;

function maxBox() {
  if (typeof window === "undefined") return { maxW: 672, maxH: 520 };
  return {
    maxW: Math.min(window.innerWidth - 48, 672),
    maxH: Math.min(window.innerHeight * 0.68, 760),
  };
}

function fitSize(nw: number, nh: number) {
  const { maxW, maxH } = maxBox();
  if (nw <= 0 || nh <= 0) return { w: Math.min(320, maxW), h: Math.min(400, maxH) };
  const scale = Math.min(maxW / nw, maxH / nh);
  return { w: Math.max(1, Math.round(nw * scale)), h: Math.max(1, Math.round(nh * scale)) };
}

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function relatedPieces(item: Jewellery, items: Jewellery[]) {
  const cats = categoriesOf(item).map((name) => name.toLowerCase());
  const primary = cats[0];
  if (!primary) return [];
  const others = items.filter((it) => it.id !== item.id && it.images.length > 0);
  const same = others.filter((it) => categoriesOf(it).some((name) => name.toLowerCase() === primary));
  const pool = same.length
    ? same
    : others.filter((it) => categoriesOf(it).some((name) => cats.includes(name.toLowerCase())));
  return pool.slice(0, 8);
}

export function Lightbox({
  item,
  items = [],
  index,
  onIndex,
  onPick,
  onClose,
}: {
  item: Jewellery;
  items?: Jewellery[];
  index: number;
  onIndex: (next: number) => void;
  onPick?: (item: Jewellery) => void;
  onClose: () => void;
}) {
  const images = item.images.length ? item.images : [];
  const n = images.length;
  const multi = n > 1;
  const indexRef = useRef(index);
  indexRef.current = index;
  const naturals = useRef<{ w: number; h: number }[]>(images.map(() => ({ w: 0, h: 0 })));
  const busyRef = useRef(false);
  const startX = useRef(0);
  const paneW = useRef(0);
  const shiftRef = useRef(0);
  const goRef = useRef<(dir: 1 | -1) => void>(() => {});

  const [frame, setFrame] = useState(() => fitSize(0, 0));
  const [shift, setShift] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [anim, setAnim] = useState(false);
  const [imageOnly, setImageOnly] = useState(false);
  const suppressOpenRef = useRef(false);
  const scrimRef = useRef<HTMLDivElement>(null);
  const related = useMemo(() => relatedPieces(item, items), [item, items]);

  const prev = multi ? (index - 1 + n) % n : 0;
  const next = multi ? (index + 1) % n : 0;

  const applyFit = useCallback((i: number) => {
    const nat = naturals.current[i];
    if (!nat?.w) return;
    setFrame(fitSize(nat.w, nat.h));
  }, []);

  useEffect(() => {
    naturals.current = images.map(() => ({ w: 0, h: 0 }));
    shiftRef.current = 0;
    setShift(0);
    setAnim(false);
    setDragging(false);
    busyRef.current = false;
    setFrame(fitSize(0, 0));
    scrimRef.current?.scrollTo({ top: 0 });
  }, [item.id]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goRef.current(-1);
      if (e.key === "ArrowRight") goRef.current(1);
    };
    const onResize = () => applyFit(indexRef.current);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [onClose, applyFit]);

  function remember(i: number, img: HTMLImageElement) {
    naturals.current[i] = { w: img.naturalWidth, h: img.naturalHeight };
    if (i === indexRef.current) applyFit(i);
  }

  function moveShift(px: number) {
    shiftRef.current = px;
    setShift(px);
  }

  function fitted(i: number) {
    const nat = naturals.current[i];
    if (!nat?.w) return frame;
    return fitSize(nat.w, nat.h);
  }

  function commit(dir: 1 | -1) {
    if (!multi || busyRef.current) return;
    const dest = (indexRef.current + dir + n) % n;
    if (reducedMotion()) {
      moveShift(0);
      setAnim(false);
      onIndex(dest);
      applyFit(dest);
      return;
    }
    busyRef.current = true;
    const w = paneW.current || frame.w || maxBox().maxW;
    paneW.current = w;
    setDragging(false);
    setAnim(true);
    moveShift(-dir * w);
    applyFit(dest);
    window.setTimeout(() => {
      setAnim(false);
      moveShift(0);
      onIndex(dest);
      busyRef.current = false;
    }, SLIDE_MS);
  }

  goRef.current = (dir) => {
    if (!multi || busyRef.current) return;
    paneW.current = frame.w || maxBox().maxW;
    commit(dir);
  };

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (!multi || busyRef.current || e.button === 1 || e.button === 2) return;
    startX.current = e.clientX;
    suppressOpenRef.current = false;
    paneW.current = frame.w || maxBox().maxW;
    setDragging(true);
    setAnim(false);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    moveShift(e.clientX - startX.current);
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!dragging) return;
    setDragging(false);
    const dx = shiftRef.current;
    if (Math.abs(e.clientX - startX.current) > 8) suppressOpenRef.current = true;
    const threshold = Math.min(72, Math.max(40, (paneW.current || frame.w) * 0.15));
    if (dx <= -threshold) commit(1);
    else if (dx >= threshold) commit(-1);
    else {
      setAnim(true);
      moveShift(0);
    }
  }

  const shown = (() => {
    if (!multi || !dragging || shift === 0) return frame;
    const dest = fitted(shift < 0 ? next : prev);
    const t = Math.min(1, Math.abs(shift) / Math.max(paneW.current || frame.w, 1));
    return {
      w: Math.round(frame.w + (dest.w - frame.w) * t),
      h: Math.round(frame.h + (dest.h - frame.h) * t),
    };
  })();

  const pane = paneW.current || shown.w;
  const slide = (offset: number) => ({
    transform: `translate3d(${offset * pane + shift}px, 0, 0)`,
    transition: anim && !dragging ? `transform ${SLIDE_MS}ms var(--ease-out)` : "none",
  });

  return (
    <div ref={scrimRef} className="lightbox-scrim fixed inset-0 z-overlay overflow-y-auto bg-ink/95" onClick={onClose} role="dialog" aria-modal="true" aria-label={item.name}>
      <button type="button" aria-label="Close" onClick={onClose} className="fixed top-5 right-5 z-20 grid size-11 place-items-center text-ivory"><X className="size-7" /></button>
      <div className="flex min-h-full flex-col">
      <div className="mx-auto my-auto flex w-full max-w-2xl flex-col items-center px-5 py-16 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="relative max-w-full">
          {multi ? (
            <>
              <button type="button" aria-label="Previous photo" className="absolute top-1/2 left-2 z-20 grid h-14 w-11 -translate-y-1/2 place-items-center rounded-full border border-hair bg-ink/70 text-ivory" onClick={() => goRef.current(-1)}>
                <ChevronLeft className="size-7" />
              </button>
              <button type="button" aria-label="Next photo" className="absolute top-1/2 right-2 z-20 grid h-14 w-11 -translate-y-1/2 place-items-center rounded-full border border-hair bg-ink/70 text-ivory" onClick={() => goRef.current(1)}>
                <ChevronRight className="size-7" />
              </button>
            </>
          ) : null}
          <div
            className="surface lightbox-frame"
            style={{
              width: shown.w,
              height: shown.h,
              transition: dragging ? "none" : `width ${SLIDE_MS}ms var(--ease-out), height ${SLIDE_MS}ms var(--ease-out)`,
            }}
            onClick={() => {
              if (suppressOpenRef.current) {
                suppressOpenRef.current = false;
                return;
              }
              setImageOnly(true);
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-roledescription={multi ? "carousel" : undefined}
            aria-label={multi ? `${item.name} photos` : undefined}
          >
            {multi ? (
              <>
                <img key="prev" src={images[prev]} alt="" draggable={false} onLoad={(e) => remember(prev, e.currentTarget)} style={slide(-1)} />
                <img key="cur" src={images[index]} alt={item.name} draggable={false} onLoad={(e) => remember(index, e.currentTarget)} style={slide(0)} />
                <img key="next" src={images[next]} alt="" draggable={false} onLoad={(e) => remember(next, e.currentTarget)} style={slide(1)} />
              </>
            ) : images[0] ? (
              <img src={images[0]} alt={item.name} draggable={false} onLoad={(e) => remember(0, e.currentTarget)} />
            ) : null}
          </div>
        </div>
        {multi ? <p className="mt-2 text-[0.65rem] tracking-label text-gold">{index + 1} / {n}</p> : null}
        <h3 className="font-display mt-2 text-xl">{item.name}</h3>
        <p className="mt-0.5 text-[0.68rem] tracking-wide text-ivory-dim">{item.metal === "gold" ? "Gold" : "Silver"} · {categoriesOf(item).join(" · ")}</p>
        {item.description ? <p className="mx-auto mt-1.5 max-w-xl text-xs leading-relaxed text-ivory-dim">{item.description}</p> : null}
        <button
          type="button"
          className="btn btn-outline mt-3 min-h-9 px-4 text-[0.62rem]"
          onClick={() => shareJewellery(item, index)}
        >
          <Share2 className="size-3.5" aria-hidden="true" />
          Share
        </button>
        {related.length ? (
          <section className="mt-5 w-full" aria-label="You may also like">
            <h4 className="font-display text-lg text-ivory">You May Also Like</h4>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {related.map((piece) => (
                <button
                  key={piece.id}
                  type="button"
                  className="text-left"
                  onClick={() => onPick?.(piece)}
                >
                  <span className="also-photo">
                    <img src={piece.images[0]} alt="" loading="lazy" decoding="async" />
                  </span>
                  <span className="mt-2 block font-display text-[0.95rem] leading-snug text-ivory">{piece.name}</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
      </div>
      {imageOnly ? (
        <ImageOnlyViewer
          images={images}
          index={index}
          name={item.name}
          onIndex={onIndex}
          onClose={() => setImageOnly(false)}
        />
      ) : null}
    </div>
  );
}
