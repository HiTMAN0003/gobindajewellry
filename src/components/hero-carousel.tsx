import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroCarousel({ images }: { images: string[] }) {
  const slides = images.length ? images : ["/images/hero-1.jpg"];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchX, setTouchX] = useState<number | null>(null);

  const go = useCallback((dir: number) => {
    setIndex((i) => (i + dir + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 3) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => go(1), 6400);
    return () => window.clearInterval(id);
  }, [go, paused, slides.length]);

  const pair = slides.length === 1
    ? [slides[0]]
    : [slides[index], slides[(index + 1) % slides.length]];

  return (
    <section
      id="home"
      className="relative bg-ink pt-4 md:pt-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Store gallery"
    >
      <div className="wrap">
        <div
          className={cn("hero-pair relative", pair.length === 1 && "hero-pair-single")}
          onTouchStart={(e) => { setTouchX(e.touches[0]?.clientX ?? null); setPaused(true); }}
          onTouchEnd={(e) => {
            const start = touchX;
            setTouchX(null);
            setPaused(false);
            if (start == null || slides.length < 2) return;
            const dx = (e.changedTouches[0]?.clientX ?? start) - start;
            if (dx > 48) go(-1);
            else if (dx < -48) go(1);
          }}
        >
          {pair.map((src, i) => (
            <div key={`${src}-${index}-${i}`} className="hero-tile">
              <img src={src} alt="" loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "low"} />
            </div>
          ))}
          {slides.length > 2 ? (
            <>
              <button type="button" aria-label="Previous image" onClick={() => go(-1)} className="absolute top-1/2 left-2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-hair bg-ink/70 text-ivory backdrop-blur-sm md:grid">
                <ChevronLeft className="size-5" />
              </button>
              <button type="button" aria-label="Next image" onClick={() => go(1)} className="absolute top-1/2 right-2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-hair bg-ink/70 text-ivory backdrop-blur-sm md:grid">
                <ChevronRight className="size-5" />
              </button>
            </>
          ) : null}
        </div>
        {slides.length > 2 ? (
          <div className="mt-3 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button key={i} type="button" aria-label={`Show image ${i + 1}`} aria-current={i === index} onClick={() => setIndex(i)} className={cn("h-1.5 rounded-full transition-all duration-500 ease-out", i === index ? "w-8 bg-gold" : "w-2.5 bg-ivory/30")} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
