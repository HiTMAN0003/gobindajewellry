import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Jewellery } from "@/lib/types";
import { Reveal } from "./reveal";

export function FeaturedStrip({ items, onOpen }: { items: Jewellery[]; onOpen: (item: Jewellery) => void }) {
  const rail = useRef<HTMLDivElement>(null);
  if (!items.length) return null;

  function scrollByCard(dir: number) {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-tile]");
    const step = (card?.offsetWidth ?? 160) + 12;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  return (
    <section id="featured" className="py-7 md:py-9">
      <div className="wrap">
        <Reveal className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="label kicker mb-2">atelier</p>
            <h2 className="font-display text-section leading-tight">Featured handcrafted designs</h2>
          </div>
          {items.length > 3 ? (
            <div className="hidden shrink-0 gap-2 md:flex">
              <button type="button" aria-label="Previous designs" onClick={() => scrollByCard(-1)} className="grid size-10 place-items-center rounded-full border border-hair text-ivory">
                <ChevronLeft className="size-5" />
              </button>
              <button type="button" aria-label="Next designs" onClick={() => scrollByCard(1)} className="grid size-10 place-items-center rounded-full border border-hair text-ivory">
                <ChevronRight className="size-5" />
              </button>
            </div>
          ) : null}
        </Reveal>
        <div ref={rail} className="featured-rail">
          {items.map((item) => (
            <button key={item.id} type="button" data-tile onClick={() => onOpen(item)} className="jewel-card featured-tile group">
              <span className="featured-frame">
                {item.images[0] ? (
                  <img src={item.images[0]} alt={item.name} loading="lazy" />
                ) : (
                  <span className="grid h-full place-items-center bg-panel-2 font-display tracking-label text-gold-light">GOBINDA</span>
                )}
              </span>
              <span className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-linear-to-t from-ink via-ink/50 to-transparent p-2.5">
                <span className="text-[0.58rem] tracking-label text-gold lowercase">{item.metal === "gold" ? "Gold" : "Silver"}</span>
                <span className="font-display truncate text-sm text-ivory">{item.name}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
