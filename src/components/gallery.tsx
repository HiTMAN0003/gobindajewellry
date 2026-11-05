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

const EAGER_COUNT = 14;
const BATCH_SIZE = 14;

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
  onOpen,
}: {
  item: Jewellery;
  eager: boolean;
  onOpen: (item: Jewellery) => void;
}) {
  const src = item.images[0];
  const imageWidth = Number(src?.match(/[?&]w=(\d+)/)?.[1]) || undefined;
  const imageHeight = Number(src?.match(/[?&]h=(\d+)/)?.[1]) || undefined;
  const displaySrc = src?.startsWith("/api/media/")
    ? `${src}${src.includes("?") ? "&" : "?"}size=thumb`
    : src;

  return (
    <button type="button" onClick={() => onOpen(item)} className="jewel-card group" aria-label={item.name}>
      {src ? (
        <img
          src={displaySrc}
          alt={item.name}
          className="block w-full"
          width={imageWidth}
          height={imageHeight}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "auto"}
        />
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
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
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

  const displayItems = useMemo(() => {
    const recent = [...visible]
      .sort((a, b) => recency(b) - recency(a))
      .slice(0, 3);

    const recentIds = new Set(recent.map((item) => item.id));
    const remaining = visible.filter((item) => !recentIds.has(item.id));

    const weekStart = new Date();
    weekStart.setUTCHours(0, 0, 0, 0);
    weekStart.setUTCDate(
      weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7),
    );
    const weekKey = weekStart.toISOString().slice(0, 10);

    const stableHash = (value: string) => {
      let hash = 2166136261;
      for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }
      return hash >>> 0;
    };

    remaining.sort(
      (a, b) =>
        stableHash(`${weekKey}:${a.id}`) -
          stableHash(`${weekKey}:${b.id}`) ||
        String(a.id).localeCompare(String(b.id)),
    );

    return [...recent, ...remaining];
  }, [visible]);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [audience, metal, openCat, query]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || visibleCount >= displayItems.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisibleCount((count) =>
            Math.min(count + BATCH_SIZE, displayItems.length),
          );
        }
      },
      { root: null, rootMargin: "300px 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount, displayItems.length]);

  const suggestions = query.trim() ? matched.slice(0, 6) : [];
  const looking = pool.interpreted.trim().toLowerCase() !== query.trim().toLowerCase() ? pool.interpreted : "";

  return (
    <section id="gallery" className="scroll-mt-24 py-8 md:py-10">
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
                {[
                  displayItems.slice(0, visibleCount).filter((_, index) => index % 2 === 0),
                  displayItems.slice(0, visibleCount).filter((_, index) => index % 2 === 1),
                ].map((columnItems, columnIndex) => (
                  <div className="gallery-column" key={columnIndex}>
                    {columnItems.map((item) => {
                      const index = displayItems.findIndex((entry) => entry.id === item.id);
                      return (
                        <div key={item.id} className="gallery-cell">
                          <JewelCard
                            item={item}
                            eager={index < EAGER_COUNT}
                            onOpen={onOpen}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              {visibleCount < displayItems.length ? (
                <div ref={loadMoreRef} className="h-2 w-full" aria-hidden="true" />
              ) : null}
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
