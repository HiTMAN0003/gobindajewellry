import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { CATEGORIES, audiencesOf, categoriesOf, type Audience, type Jewellery, type Metal } from "@/lib/types";
import { iconFor } from "@/lib/category-icon";
import { searchJewellery } from "@/lib/smart-search";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

type MetalFilter = "all" | Metal;
type AudienceFilter = "all" | Audience;

const AUDIENCE_FILTERS: { key: AudienceFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "men", label: "Men" },
  { key: "women", label: "Women" },
  { key: "kids", label: "Kid" },
  { key: "others", label: "Others" },
];

const EAGER_COUNT = 8;
const INITIAL_AHEAD = 28;

function recency(item: Jewellery) {
  const stamp = /^j-(\d{10,})$/.exec(item.id);
  if (stamp) return Number(stamp[1]);
  return item.sortOrder;
}

function latestPiece(list: Jewellery[]) {
  return list.reduce((best, item) => (recency(item) >= recency(best) ? item : best));
}

function JewelCard({
  item,
  eager,
  ahead,
  onOpen,
}: {
  item: Jewellery;
  eager: boolean;
  ahead: boolean;
  onOpen: (item: Jewellery) => void;
}) {
  const slotRef = useRef<HTMLSpanElement>(null);
  const [srcOn, setSrcOn] = useState(ahead || eager);
  const src = item.images[0];

  useEffect(() => {
    if (srcOn) return;
    const el = slotRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setSrcOn(true);
        io.disconnect();
      },
      { root: null, rootMargin: "1000px 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [srcOn]);

  return (
    <button type="button" onClick={() => onOpen(item)} className="jewel-card group" aria-label={item.name}>
      {src ? (
        srcOn ? (
          <img
            src={src}
            alt={item.name}
            className="block w-full"
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={eager ? "high" : "low"}
          />
        ) : (
          <span ref={slotRef} className="block h-[13.5rem] w-full" aria-hidden="true" />
        )
      ) : (
        <div className="grid min-h-64 place-items-center font-display tracking-label text-gold-light">GOBINDA</div>
      )}
    </button>
  );
}

export function Gallery({
  items,
  categories = [],
  categoryIcons = {},
  categoryShown = {},
  onOpen,
}: {
  items: Jewellery[];
  categories?: string[];
  categoryIcons?: Record<string, string>;
  categoryShown?: Record<string, boolean>;
  onOpen: (item: Jewellery) => void;
}) {
  const [audience, setAudience] = useState<AudienceFilter>("all");
  const [metal, setMetal] = useState<MetalFilter>("all");
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const cats = useMemo(() => {
    const source = categories.length
      ? categories
      : Array.from(new Set(items.flatMap((it) => categoriesOf(it)).filter(Boolean)));
    const list = source.length ? source : [...CATEGORIES];
    return list.filter((name) => categoryShown[name] !== false);
  }, [categories, categoryShown, items]);

  const pool = useMemo(() => {
    const base = items.filter((it) => {
      if (audience !== "all" && !audiencesOf(it).includes(audience)) return false;
      if (metal !== "all" && it.metal !== metal) return false;
      return true;
    });
    return searchJewellery(base, query);
  }, [items, audience, metal, query]);
  const matched = pool.items;

  const shop = useMemo(() => {
    const hidden = new Set(
      Object.entries(categoryShown).filter(([, on]) => on === false).map(([name]) => name.toLowerCase()),
    );
    const known = new Set(cats.map((name) => name.toLowerCase()));
    const extra = Array.from(new Set(matched.flatMap((it) => categoriesOf(it)).filter((name) => name && !known.has(name.toLowerCase()) && !hidden.has(name.toLowerCase()))));
    return [...cats, ...extra].flatMap((name) => {
      const pieces = matched.filter((it) => categoriesOf(it).some((c) => c.toLowerCase() === name.toLowerCase()));
      if (!pieces.length) return [];
      const latest = latestPiece(pieces);
      return [{ name, image: latest.images[0] ?? "", count: pieces.length }];
    });
  }, [cats, categoryShown, matched]);

  const active = audience === "others"
    ? null
    : openCat && shop.some((row) => row.name === openCat) ? openCat : null;
  const visible = useMemo(
    () => (query.trim() || !active ? matched : matched.filter((it) => categoriesOf(it).some((c) => c.toLowerCase() === active.toLowerCase()))),
    [matched, active, query],
  );
  const suggestions = query.trim() ? matched.slice(0, 6) : [];
  const looking = pool.interpreted.trim().toLowerCase() !== query.trim().toLowerCase() ? pool.interpreted : "";

  return (
    <section id="gallery" className="py-8 md:py-10">
      <div className="wrap">
        <Reveal className="mb-4">
          <p className="label kicker mb-1">collection</p>
          <div className="gallery-head">
            <h2 className="font-display text-section leading-none">Gallery</h2>
            <form className="jewel-search" role="search" onSubmit={(e) => e.preventDefault()}>
              <span className="jewel-search-mark" aria-hidden="true"><Search className="size-4" /></span>
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSuggestOpen(true);
                }}
                onFocus={() => setSuggestOpen(true)}
                onBlur={() => window.setTimeout(() => setSuggestOpen(false), 120)}
                placeholder="Search jewellery..."
                aria-label="Search jewellery"
                aria-autocomplete="list"
                aria-expanded={suggestOpen && suggestions.length > 0}
              />
              <button type="submit" className="jewel-search-go" aria-label="Search">
                <ArrowRight className="size-4" />
              </button>
              {suggestOpen && suggestions.length ? (
                <ul className="jewel-suggest" role="listbox">
                  <li className="jewel-suggest-note">{pool.loose ? "Similar pieces" : looking ? `Looking for ${looking}` : "Suggestions"}</li>
                  {suggestions.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          onOpen(item);
                          setSuggestOpen(false);
                        }}
                      >
                        {item.images[0] ? <img src={item.images[0]} alt="" /> : <span className="jewel-suggest-ph" />}
                        <span>
                          <strong>{item.name}</strong>
                          <small>{item.metal === "gold" ? "Gold" : "Silver"} · {categoriesOf(item)[0] ?? "Jewellery"}</small>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </form>
          </div>
        </Reveal>
        <div className="mb-3">
          <div className="aud-pills" role="group" aria-label="Audience">
            {AUDIENCE_FILTERS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  if (opt.key === "all" || audience === opt.key) {
                    setAudience("all");
                    return;
                  }
                  setAudience(opt.key);
                  if (opt.key === "others") setOpenCat(null);
                }}
                className={cn("aud-pill", audience === opt.key && "is-on")}
                aria-pressed={audience === opt.key}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div id="gallery-panel" className="gallery-panel">
          {audience === "others" ? null : (
          <div className="cat-strip" role="listbox" aria-label="Categories">
            <button type="button" className={cn("cat-chip", !active && "is-on")} onClick={() => setOpenCat(null)} aria-selected={!active}>
              <span className="cat-orb"><img src="/images/cat-icons/all.png" alt="" /></span>
              <span>All</span>
            </button>
            {shop.map((row) => (
              <button
                key={row.name}
                type="button"
                className={cn("cat-chip", active === row.name && "is-on")}
                onClick={() => setOpenCat(active === row.name ? null : row.name)}
                aria-selected={active === row.name}
              >
                <span className="cat-orb"><img src={iconFor(row.name, categoryIcons)} alt="" /></span>
                <span>{row.name}</span>
              </button>
            ))}
          </div>
          )}
          <div className="mt-3 flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
            {([{ key: "all", label: "All" }, { key: "silver", label: "Silver" }, { key: "gold", label: "Gold" }] as const).map((opt) => (
              <button key={opt.key} type="button" onClick={() => setMetal(opt.key)} className={cn("chip shrink-0", metal === opt.key && "is-on")}>{opt.label}</button>
            ))}
          </div>
          {query.trim() && pool.loose ? <p className="mb-2 text-sm text-ivory-dim">No exact match. Showing similar pieces.</p> : null}
          {visible.length ? (
            <div className="gallery-board">
              <div className="gallery-masonry">
                {visible.map((item, index) => (
                  <div key={item.id} className="gallery-cell">
                    <JewelCard
                      item={item}
                      eager={index < EAGER_COUNT}
                      ahead={index < INITIAL_AHEAD}
                      onOpen={onOpen}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="gallery-board px-8 py-12 text-center">
              <p className="label">collection</p>
              <h3 className="font-display mt-3 text-2xl">{query.trim() ? "No jewellery matches" : "No pieces in this edit"}</h3>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
