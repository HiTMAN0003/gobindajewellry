import { useRef, useState, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = {
  images: string[];
  index: number;
  name: string;
  onIndex: (index: number) => void;
  onClose: () => void;
};

export function ImageOnlyViewer({ images, index, name, onIndex, onClose }: Props) {
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef({ x: 0, y: 0, distance: 0, scale: 1 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const resetZoom = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const change = (direction: number) => {
    resetZoom();
    onIndex((index + direction + images.length) % images.length);
  };

  const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  function pointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const points = [...pointers.current.values()];
    start.current = {
      x: e.clientX,
      y: e.clientY,
      distance: points.length > 1 ? distance(points[0], points[1]) : 0,
      scale,
    };
    setDrag(true);
  }

  function pointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const points = [...pointers.current.values()];

    if (points.length >= 2) {
      const currentDistance = distance(points[0], points[1]);
      const ratio = currentDistance / Math.max(start.current.distance, 1);
      setScale(Math.min(4, Math.max(1, start.current.scale * ratio)));
    } else if (points.length === 1 && scale > 1) {
      setOffset({
        x: offset.x + e.movementX,
        y: offset.y + e.movementY,
      });
    }
  }

  function pointerUp(e: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size) return;
    setDrag(false);

    if (scale > 1) return;

    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;

    if (Math.abs(dy) > 110 && Math.abs(dy) > Math.abs(dx)) {
      onClose();
    } else if (dx < -65 && images.length > 1) {
      change(1);
    } else if (dx > 65 && images.length > 1) {
      change(-1);
    }
  }

  function doubleTap() {
    const now = Date.now();
    if (now - lastTap < 300) {
      if (scale > 1) resetZoom();
      else setScale(2.5);
    }
    setLastTap(now);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black text-white"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onPointerCancel={(e) => e.stopPropagation()}
      role="dialog" aria-modal="true" aria-label={`${name} product images`}>
      <div className="flex h-14 shrink-0 items-center justify-between px-4">
        <span className="text-sm font-medium">{index + 1} / {images.length}</span>
        <button type="button" onClick={onClose} aria-label="Close image viewer" className="grid size-11 place-items-center">
          <X className="size-7" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        {images.length > 1 && (
          <>
            <button type="button" aria-label="Previous image" onClick={() => change(-1)} className="absolute left-2 z-10 grid size-10 place-items-center rounded-full bg-white/15">
              <ChevronLeft className="size-6" />
            </button>
            <button type="button" aria-label="Next image" onClick={() => change(1)} className="absolute right-2 z-10 grid size-10 place-items-center rounded-full bg-white/15">
              <ChevronRight className="size-6" />
            </button>
          </>
        )}

        <div
          className="flex h-full w-full touch-none items-center justify-center overflow-hidden"
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerCancel={pointerUp}
          onClick={doubleTap}
        >
          <img
            src={images[index]}
            alt={`${name}, image ${index + 1}`}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            draggable={false}
            className="max-h-full max-w-full select-none object-contain"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transition: drag ? "none" : "transform 180ms ease-out",
            }}
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex shrink-0 gap-2 overflow-x-auto px-3 py-3" style={{ scrollbarWidth: "thin" }}>
          {images.map((src, i) => (
            <button
              key={`${i}-${src}`}
              type="button"
              aria-label={`View image ${i + 1}`}
              aria-current={i === index}
              onClick={() => {
                resetZoom();
                onIndex(i);
              }}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded border-2 ${i === index ? "border-white" : "border-white/25 opacity-65"}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
