import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ImagePlus, Trash2, Download, Check, ChevronDown, ChevronUp, Search, X, Home } from "lucide-react";
import { UserButton } from "@/lib/auth/gates";

import { getBearerToken } from "@/lib/auth/client";
import { getStudioSession, inviteStudio, removeStudioMember, revokeStudioInvite } from "@/lib/server/access";
import { createCategory, deleteCategory, deleteJewellery, getStudioJewellery, getStudioRecentJewellery, getStudioOverview, getStorefront, renameCategory, saveJewellery, saveMetalRates, saveSettings, setCategoryIcon, setCategoryShown, reorderCategories } from "@/lib/server/store";
import { uploadStudioIcon, uploadStudioPhoto } from "@/lib/upload-image";
import { AUDIENCES, CATEGORIES, audiencesOf, categoriesOf, type Audience, type Jewellery, type MetalRates, type StoreSettings, type StudioInvite, type StudioMember } from "@/lib/types";
import { formatUpdated } from "@/lib/format";
import { HouseMark } from "@/components/mark";
import { cn } from "@/lib/utils";

export function AdminStudio() {
  const [forbidden, setForbidden] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [storeReady, setStoreReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [items, setItems] = useState<Jewellery[]>([]);
  const [recentItems, setRecentItems] = useState<Jewellery[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState<string | null>(null);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [rates, setRates] = useState<MetalRates>({ goldPerTola: 0, silverPerKg: 0, asOf: null });
  const [settings, setSettings] = useState<StoreSettings>({ founderName: "Gobinda", founderImage: "/images/founder.jpg", heroImages: [] });
  const [categories, setCategories] = useState<string[]>([...CATEGORIES]);
  const [categoryIcons, setCategoryIcons] = useState<Record<string, string>>({});
  const [categoryShown, setCategoryShown] = useState<Record<string, boolean>>({});
  const [invites, setInvites] = useState<StudioInvite[]>([]);
  const [members, setMembers] = useState<StudioMember[]>([]);
  const [role, setRole] = useState("member");
  const [userId, setUserId] = useState("");

  async function loadItems() {
    if (itemsLoaded || itemsLoading) return;
    setItemsLoading(true);
    setItemsError(null);
    try {
      setItems(await getStudioJewellery());
      setItemsLoaded(true);
    } catch (err) {
      setItemsError(err instanceof Error ? err.message : "Could not load jewellery.");
    } finally {
      setItemsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    let sessionLoaded = false;
    (async () => {
      try {
        const session = await getStudioSession();
        if (cancelled) return;
        setRole(session.role);
        setUserId(session.userId);
        sessionLoaded = true;
        setReady(true);
        void getStudioRecentJewellery()
          .then((recent) => { if (!cancelled) setRecentItems(recent); })
          .catch((err) => { if (!cancelled) setRecentError(err instanceof Error ? err.message : "Could not load recent jewellery."); })
          .finally(() => { if (!cancelled) setRecentLoading(false); });

        const store = await getStudioOverview();
        if (cancelled) return;
        setInvites(session.invites);
        setMembers(session.members);
        setRates(store.rates);
        setSettings(store.settings);
        setCategories(store.categories.length ? store.categories : [...CATEGORIES]);
        setCategoryIcons(store.categoryIcons ?? {});
        setCategoryShown(store.categoryShown ?? {});
        setStoreReady(true);
      } catch (err) {
        if (cancelled) return;
        if (sessionLoaded) {
          setLoadError(err instanceof Error ? err.message : "Could not load studio data.");
        } else {
          setForbidden(err instanceof Error ? err.message : "Access denied.");
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (forbidden) {
    return (
      <main className="grid min-h-svh place-items-center px-6">
        <div className="surface max-w-md p-8 text-center">
          <h1 className="font-display text-3xl">Private studio</h1>
          <p className="mt-3 text-sm text-ivory-dim">{forbidden}</p>
          <Link to="/" className="btn btn-outline mt-6">Back to store</Link>
        </div>
      </main>
    );
  }
  if (!ready) return <main className="grid min-h-svh place-items-center text-ivory-dim">Opening studio…</main>;
  if (!storeReady) {
    return (
      <main className="min-h-svh bg-ink pb-16">
        <header className="border-b border-hair">
          <div className="wrap flex items-center justify-between gap-2 py-3 md:gap-4 md:py-5">
            <Link to="/" className="btn btn-outline !min-h-10 !px-3 text-xs">
              <Home className="size-4" /> Back to website
            </Link>
            <UserButton compact />
          </div>
        </header>
        <div className="wrap mt-10 grid gap-4" aria-busy="true" aria-live="polite">
          <p className="text-sm text-ivory-dim" role={loadError ? "alert" : "status"}>{loadError ? `Could not load studio data: ${loadError}. Refresh to try again.` : "Loading studio data…"}</p>
          <div className="surface h-24 animate-pulse" />
          <div className="surface h-48 animate-pulse" />
          <div className="surface h-64 animate-pulse" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-ink pb-16">
      <header className="border-b border-hair">
        <div className="wrap flex items-center justify-between gap-2 py-3 md:gap-4 md:py-5">
          <div className="flex min-w-0 items-center gap-2 md:gap-3">
            <Link to="/" className="hidden items-center gap-3 md:flex">
              <HouseMark className="size-9 text-gold" />
              <span className="font-display text-lg tracking-brand">Studio</span>
            </Link>
            <Link to="/" className="btn btn-outline !min-h-10 !px-3 text-xs">
              <Home className="size-4" />
              <span className="sm:hidden">Back to home</span>
              <span className="hidden sm:inline">Back to website</span>
            </Link>
          </div>
          <UserButton compact />
        </div>
      </header>
      <div className="wrap mt-10 grid gap-8">
        <RatesForm rates={rates} onSaved={setRates} />
        <SettingsForm settings={settings} onSaved={setSettings} />
        <CategoryStudio
          categories={categories}
          icons={categoryIcons}
          shown={categoryShown}
          items={items}
          onLoadItems={loadItems}
          onSaved={(next) => {
            setCategories(next.categories);
            setItems(next.items);
            setItemsLoaded(true);
            setCategoryIcons(next.categoryIcons);
            setCategoryShown(next.categoryShown);
          }}
        />
        <JewelleryForm
          items={items}
          recentItems={recentItems}
          recentLoading={recentLoading}
          recentError={recentError}
          categories={categories}
          onLoadItems={loadItems}
          itemsLoading={itemsLoading}
          itemsError={itemsError}
          onSaved={(nextItems) => {
            setItems(nextItems);
            setItemsLoaded(true);
            setRecentItems(nextItems.slice().sort((a, b) => pieceRecency(b.id) - pieceRecency(a.id) || b.sortOrder - a.sortOrder).slice(0, 4));
          }}
          onCategoriesSaved={(next) => {
            setCategories(next.categories);
            setItems(next.items);
            setItemsLoaded(true);
            if (next.categoryIcons) setCategoryIcons(next.categoryIcons);
            if (next.categoryShown) setCategoryShown(next.categoryShown);
          }}
        />
        <BackupPanel
          onRestored={(store) => {
            setItems(store.items);
            setItemsLoaded(true);
            setRates(store.rates);
            setSettings(store.settings);
            setCategories(store.categories.length ? store.categories : [...CATEGORIES]);
            setCategoryIcons(store.categoryIcons ?? {});
            setCategoryShown(store.categoryShown ?? {});
          }}
        />
        {role === "owner" ? (
          <StudioUsers
            members={members}
            invites={invites}
            currentUserId={userId}
            onSaved={({ members: nextMembers, invites: nextInvites }) => {
              setMembers(nextMembers);
              setInvites(nextInvites);
            }}
          />
        ) : null}
      </div>
    </main>
  );
}

function RatesForm({ rates, onSaved }: { rates: MetalRates; onSaved: (r: MetalRates) => void }) {
  const [gold, setGold] = useState(rates.goldPerTola ? String(rates.goldPerTola) : "");
  const [silver, setSilver] = useState(rates.silverPerKg ? String(rates.silverPerKg) : "");
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const next = await saveMetalRates({ data: { goldPerTola: Number(gold) || 0, silverPerKg: Number(silver) || 0 } });
      onSaved(next);
      toast.success("Rates saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally { setBusy(false); }
  }
  return (
    <details className="surface group p-4 md:p-5">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-full border border-gold/25 bg-gradient-to-r from-[#fff9f2] via-white to-[#f7eee5] px-4 py-2.5 shadow-sm transition hover:border-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold md:px-5"><span className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold/15 text-gold"><HouseMark className="size-5" /></span><span className="font-display text-xl text-ivory">Today’s Rates</span></span><span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-semibold tracking-wide text-ink shadow-sm">Edit <ChevronDown className="size-4 transition-transform group-open:rotate-180" /></span></summary>
      <p className="mt-1 text-sm text-ivory-dim">Gold is per tola (11.6638 g). Silver is per tola (11.6638 g).</p>
      {rates.asOf ? <p className="mt-2 text-xs text-gold-light">Last saved {formatUpdated(rates.asOf)}</p> : null}
      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <label className="grid gap-1.5 text-xs tracking-wide text-ivory-dim">Gold 24K · per tola (₹)
          <input className="field" inputMode="numeric" value={gold} onChange={(e) => setGold(e.target.value)} />
        </label>
        <label className="grid gap-1.5 text-xs tracking-wide text-ivory-dim">Silver · per tola (₹)
          <input className="field" inputMode="numeric" value={silver} onChange={(e) => setSilver(e.target.value)} />
        </label>
        <button className="btn btn-gold md:col-span-2" type="submit" disabled={busy}>{busy ? "Saving…" : "Save rates"}</button>
      </form>
    </details>
  );
}

function SettingsForm({ settings, onSaved }: { settings: StoreSettings; onSaved: (s: StoreSettings) => void }) {
  const [name, setName] = useState(settings.founderName);
  const [founder, setFounder] = useState(settings.founderImage);
  const [heroes, setHeroes] = useState<string[]>(settings.heroImages);
  const [busy, setBusy] = useState(false);

  async function persist(next: { founderName?: string; founderImage?: string; heroImages?: string[] }) {
    const payload = {
      founderName: next.founderName ?? name,
      founderImage: next.founderImage ?? founder,
      heroImages: next.heroImages ?? heroes,
    };
    const saved = await saveSettings({ data: payload });
    setName(saved.founderName);
    setFounder(saved.founderImage);
    setHeroes(saved.heroImages);
    onSaved(saved);
    return saved;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await persist({ founderName: name });
      toast.success("House details saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally { setBusy(false); }
  }

  return (
    <details className="surface group p-4 md:p-5">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-full border border-gold/25 bg-gradient-to-r from-[#fff9f2] via-white to-[#f7eee5] px-4 py-2.5 shadow-sm transition hover:border-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold md:px-5"><span className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold/15 text-gold"><HouseMark className="size-5" /></span><span className="font-display text-xl text-ivory">House Banner</span></span><span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-semibold tracking-wide text-ink shadow-sm">Edit <ChevronDown className="size-4 transition-transform group-open:rotate-180" /></span></summary>
      <p className="mt-1 text-sm text-ivory-dim">Upload photos from your phone. They appear on the store as soon as they save.</p>
      <form className="mt-6 grid gap-6" onSubmit={onSubmit}>
        <label className="grid gap-1.5 text-xs tracking-wide text-ivory-dim">Founder name
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div>
          <p className="mb-2 text-xs tracking-wide text-ivory-dim">Profile photo</p>
          <div className="flex flex-wrap items-center gap-4">
            {founder ? <img src={founder} alt="" className="size-24 rounded-full object-cover ring-1 ring-gold/40" /> : null}
            <label className="btn btn-gold cursor-pointer">
              Upload profile photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.currentTarget.files?.[0];
                  e.currentTarget.value = "";
                  if (!file) return;
                  try {
                    const url = await uploadStudioPhoto(file);
                    setFounder(url);
                    await persist({ founderImage: url });
                    toast.success("Profile photo saved");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not save photo");
                  }
                }}
              />
            </label>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs tracking-wide text-ivory-dim">Store banner carousel</p>
          <PhotoStrip
            images={heroes}
            addLabel="Add banner photo"
            onAdd={async (url) => {
              const next = [...heroes, url].slice(0, 8);
              setHeroes(next);
              try {
                await persist({ heroImages: next });
                toast.success("Banner photo saved");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not save banner");
              }
            }}
            onRemove={async (src) => {
              const next = heroes.filter((x) => x !== src);
              if (!next.length) {
                toast.error("Keep at least one banner photo");
                return;
              }
              setHeroes(next);
              try {
                await persist({ heroImages: next });
                toast.success("Banner updated");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not save banner");
              }
            }}
          />
        </div>
        <button className="btn btn-gold" type="submit" disabled={busy}>{busy ? "Saving…" : "Save house name"}</button>
      </form>
    </details>
  );
}

const GALLERY_PAGE = 16;

function CategoryField({
  values,
  categories,
  items,
  onChange,
  onSaved,
}: {
  values: string[];
  categories: string[];
  items: Jewellery[];
  onChange: (names: string[]) => void;
  onSaved: (next: { categories: string[]; items: Jewellery[]; categoryIcons?: Record<string, string>; categoryShown?: Record<string, boolean> }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"list" | "add" | "edit" | "remove">("list");
  const [target, setTarget] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [moveTo, setMoveTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = values.length ? values : [];
  const filteredCategories = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return term ? categories.filter((name) => name.toLocaleLowerCase().includes(term)) : categories;
  }, [categories, query]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of items) {
      for (const name of categoriesOf(it)) map.set(name, (map.get(name) ?? 0) + 1);
    }
    return map;
  }, [items]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setMode("list");
        setTarget(null);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function resetList() {
    setMode("list");
    setTarget(null);
    setDraft("");
    setMoveTo("");
  }

  function has(name: string) {
    return selected.some((v) => v.toLowerCase() === name.toLowerCase());
  }

  function toggle(name: string) {
    if (has(name)) {
      if (selected.length <= 1) {
        toast.error("Keep at least one category on the jewellery piece.");
        return;
      }
      onChange(selected.filter((v) => v.toLowerCase() !== name.toLowerCase()));
      return;
    }
    if (selected.length >= 6) {
      toast.error("A piece can have up to 6 categories");
      return;
    }
    onChange([...selected, name]);
  }

  async function addCategory() {
    setBusy(true);
    try {
      const next = await createCategory({ data: { name: draft } });
      onSaved(next);
      const created = next.categories.find((c) => c.toLowerCase() === draft.trim().toLowerCase()) ?? next.categories.at(-1);
      if (created && !has(created) && selected.length < 6) onChange([...selected, created]);
      resetList();
      setOpen(false);
      toast.success("Category added — it is on the store now");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add category");
    } finally {
      setBusy(false);
    }
  }

  async function saveRename() {
    if (!target) return;
    setBusy(true);
    try {
      const next = await renameCategory({ data: { from: target, to: draft } });
      onSaved(next);
      const renamed = next.categories.find((c) => c.toLowerCase() === draft.trim().toLowerCase()) ?? draft.trim();
      onChange(selected.map((v) => (v.toLowerCase() === target.toLowerCase() ? renamed : v)));
      resetList();
      toast.success("Category renamed everywhere");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rename");
    } finally {
      setBusy(false);
    }
  }

  async function confirmRemove() {
    if (!target) return;
    setBusy(true);
    try {
      const pieceCount = counts.get(target) ?? 0;
      const next = await deleteCategory({ data: { name: target, moveTo: pieceCount > 0 ? moveTo : undefined } });
      onSaved(next);
      const kept = selected.filter((v) => v.toLowerCase() !== target.toLowerCase());
      if (kept.length !== selected.length) {
        const dest = pieceCount > 0 ? moveTo : "";
        const merged = dest && !kept.some((v) => v.toLowerCase() === dest.toLowerCase()) ? [...kept, dest] : kept;
        onChange(merged.length ? merged : [next.categories[0] ?? ""]);
      }
      resetList();
      setOpen(false);
      toast.success("Category removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove");
    } finally {
      setBusy(false);
    }
  }

  const pieceCount = target ? counts.get(target) ?? 0 : 0;
  const others = categories.filter((c) => c !== target);
  const label = selected.length ? `${selected.length} selected` : "Choose categories";

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="field flex items-center justify-between gap-2 text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          resetList();
        }}
      >
        <span className="truncate">{label}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-gold transition-transform", open && "rotate-180")} />
      </button>
      {selected.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Selected categories">
          {selected.map((name) => (
            <span key={name} className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs text-ivory">
              {name}
              <button type="button" className="grid size-5 place-items-center rounded-full text-ivory-dim hover:bg-gold/20 hover:text-ivory" aria-label={`Remove ${name}`} onClick={() => toggle(name)}><X className="size-3" /></button>
            </span>
          ))}
        </div>
      ) : null}
      <p className="mt-1 text-[0.68rem] text-ivory-dim">Choose one or more categories. Up to 6 per piece.</p>

      {open ? (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-hair bg-panel shadow-card">
          {mode === "list" ? (
            <>
              <div className="border-b border-hair p-2"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ivory-dim" /><input className="field !min-h-10 !pl-9" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a category" aria-label="Find a category" /></div></div>
              <div className="max-h-60 overflow-y-auto overscroll-contain py-1" role="listbox" aria-label="Jewellery categories" aria-multiselectable="true">
                {filteredCategories.map((name) => (
                  <div
                    key={name}
                    className={cn(
                      "flex items-center gap-2 px-3",
                      has(name) && "bg-gold/10",
                    )}
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={has(name)}
                      className="min-h-10 min-w-0 flex-1 truncate py-2 text-left text-sm text-ivory"
                      onClick={() => toggle(name)}
                    >
                      {has(name) ? "✓ " : ""}{name}
                    </button>
                    <button
                      type="button"
                      className="shrink-0 py-2 text-[0.7rem] tracking-wide text-gold"
                      onClick={() => {
                        setTarget(name);
                        setDraft(name);
                        setMode("edit");
                      }}
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="flex min-h-11 w-full items-center border-t border-hair px-3 text-sm text-gold"
                onClick={() => {
                  setDraft("");
                  setMode("add");
                }}
              >
                + Add Category
              </button>
            </>
          ) : null}

          {mode === "add" ? (
            <div className="grid gap-2 p-3">
              <p className="text-xs tracking-wide text-ivory-dim">New category</p>
              <input
                className="field"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Category name"
                maxLength={80}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void addCategory();
                  }
                }}
              />
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-gold !min-h-9 !px-3" type="button" disabled={busy || !draft.trim()} onClick={() => void addCategory()}>
                  {busy ? "Adding…" : "Add"}
                </button>
                <button className="btn btn-outline !min-h-9 !px-3" type="button" onClick={resetList}>Cancel</button>
              </div>
            </div>
          ) : null}

          {mode === "edit" && target ? (
            <div className="grid gap-2 p-3">
              <p className="text-xs tracking-wide text-ivory-dim">Edit {target}</p>
              <input
                className="field"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={80}
                autoFocus
                aria-label="Rename category"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void saveRename();
                  }
                }}
              />
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-gold !min-h-9 !px-3" type="button" disabled={busy || !draft.trim()} onClick={() => void saveRename()}>
                  <Check className="size-4" />
                  {busy ? "Saving…" : "Rename"}
                </button>
                <button
                  className="btn btn-outline !min-h-9 !px-3 text-danger"
                  type="button"
                  disabled={busy || categories.length <= 1}
                  onClick={() => {
                    setMoveTo(others[0] ?? "");
                    setMode("remove");
                  }}
                >
                  Remove
                </button>
                <button className="btn btn-outline !min-h-9 !px-3" type="button" onClick={resetList} aria-label="Back">
                  <X className="size-4" />
                </button>
              </div>
              {categories.length <= 1 ? (
                <p className="text-xs text-ivory-dim">Keep at least one category.</p>
              ) : null}
            </div>
          ) : null}

          {mode === "remove" && target ? (
            <div className="grid gap-2 p-3" role="alertdialog" aria-labelledby="remove-cat-title">
              <p id="remove-cat-title" className="font-display text-lg">Remove {target}?</p>
              {pieceCount > 0 ? (
                <>
                  <p className="text-sm text-ivory-dim">
                    {pieceCount} {pieceCount === 1 ? "piece is" : "pieces are"} in this category. They will be moved — jewellery is not deleted.
                  </p>
                  <label className="grid gap-1.5 text-xs tracking-wide text-ivory-dim">
                    Move jewellery to
                    <select className="field" value={moveTo} onChange={(e) => setMoveTo(e.target.value)}>
                      {others.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                </>
              ) : (
                <p className="text-sm text-ivory-dim">No jewellery is in this category. This cannot be undone.</p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn btn-gold !min-h-9 !px-3"
                  type="button"
                  disabled={busy || (pieceCount > 0 && !moveTo)}
                  onClick={() => void confirmRemove()}
                >
                  {busy ? "Removing…" : "Yes, remove"}
                </button>
                <button className="btn btn-outline !min-h-9 !px-3" type="button" onClick={() => setMode("edit")}>Cancel</button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function CategoryStudio({
  categories,
  icons,
  shown,
  items,
  onLoadItems,
  onSaved,
}: {
  categories: string[];
  icons: Record<string, string>;
  shown: Record<string, boolean>;
  items: Jewellery[];
  onLoadItems: () => void;
  onSaved: (next: { categories: string[]; items: Jewellery[]; categoryIcons: Record<string, string>; categoryShown: Record<string, boolean> }) => void;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [openName, setOpenName] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [removeName, setRemoveName] = useState<string | null>(null);
  const [moveTo, setMoveTo] = useState("");

  function pieceCount(cat: string) {
    return items.filter((it) => categoriesOf(it).some((c) => c.toLowerCase() === cat.toLowerCase())).length;
  }

  async function addCategory(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy("add");
    try {
      const next = await createCategory({ data: { name } });
      onSaved(next);
      setName("");
      toast.success("Category added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add category");
    } finally {
      setBusy(null);
    }
  }

  async function rename(from: string, to: string) {
    if (!to.trim() || to.trim().toLowerCase() === from.toLowerCase()) return;
    setBusy(from);
    try {
      const next = await renameCategory({ data: { from, to } });
      onSaved(next);
      const renamed = next.categories.find((c) => c.toLowerCase() === to.trim().toLowerCase()) ?? to.trim();
      setOpenName(renamed);
      toast.success("Category renamed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rename");
    } finally {
      setBusy(null);
    }
  }

  async function changeIcon(cat: string, file: File | null) {
    if (!file) return;
    setBusy(cat);
    try {
      const url = await uploadStudioIcon(file);
      const next = await setCategoryIcon({ data: { name: cat, icon: url } });
      onSaved(next);
      toast.success("Category image updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update image");
    } finally {
      setBusy(null);
    }
  }

  async function clearIcon(cat: string) {
    setBusy(cat);
    try {
      const next = await setCategoryIcon({ data: { name: cat, icon: "" } });
      onSaved(next);
      toast.success("Using the default icon");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset image");
    } finally {
      setBusy(null);
    }
  }

  async function toggleShown(cat: string) {
    setBusy(cat);
    try {
      const next = await setCategoryShown({ data: { name: cat, shown: shown[cat] === false } });
      onSaved(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update category");
    } finally {
      setBusy(null);
    }
  }

  async function moveCategory(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= categories.length || busy) return;
    const nextCategories = [...categories];
    [nextCategories[index], nextCategories[nextIndex]] = [nextCategories[nextIndex], nextCategories[index]];
    setBusy("order");
    try {
      const next = await reorderCategories({ data: { categories: nextCategories } });
      onSaved(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reorder categories");
    } finally {
      setBusy(null);
    }
  }

  async function remove(cat: string) {
    const count = pieceCount(cat);
    setBusy(cat);
    try {
      const next = await deleteCategory({ data: { name: cat, moveTo: count > 0 ? moveTo : undefined } });
      onSaved(next);
      setRemoveName(null);
      setOpenName(null);
      toast.success("Category removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove category");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="surface p-6 md:p-8">
      <h2 className="font-display text-2xl">Customize categories</h2>
      <p className="mt-1 text-sm text-ivory-dim">A tick means that category is shown on the homepage. Tap a name to edit it.</p>
      <button
        type="button"
        className="mt-5 flex min-h-12 w-full items-center justify-between rounded-2xl border border-hair bg-white px-4 text-left text-sm text-ivory"
        aria-expanded={listOpen}
        onClick={() => {
          const opening = !listOpen;
          setListOpen(opening);
          if (opening) onLoadItems();
          setOpenName(null);
          setRemoveName(null);
        }}
      >
        <span>Categories <span className="text-ivory-dim">({categories.length})</span></span>
        <ChevronDown className={cn("size-4 text-gold transition-transform", listOpen && "rotate-180")} />
      </button>
      {listOpen ? (
      <div className="mt-2 overflow-hidden rounded-2xl border border-hair bg-white">
        <form className="flex gap-2 border-b border-hair p-2" onSubmit={addCategory}>
          <input className="field !min-h-10" value={name} onChange={(e) => setName(e.target.value)} placeholder="New category" maxLength={80} />
          <button className="btn btn-gold shrink-0 !min-h-10 !px-3" type="submit" disabled={busy === "add" || !name.trim()}>{busy === "add" ? "Adding…" : "Add"}</button>
        </form>
        <ul>
          {categories.map((cat, index) => {
            const open = openName === cat;
            const visible = shown[cat] !== false;
            const count = pieceCount(cat);
            const others = categories.filter((c) => c !== cat);
            return (
              <li key={cat} className="border-b border-hair last:border-b-0">
                <div className={cn("flex items-center", open && "bg-[#fff6ef]")}>
                  <button
                    type="button"
                    className="grid size-11 shrink-0 place-items-center"
                    aria-pressed={visible}
                    aria-label={visible ? `Hide ${cat} on the homepage` : `Show ${cat} on the homepage`}
                    disabled={busy === cat}
                    onClick={() => void toggleShown(cat)}
                  >
                    <span className={cn("grid size-5 place-items-center rounded border", visible ? "border-gold bg-gold text-white" : "border-hair bg-white text-transparent")}>
                      <Check className="size-3.5" />
                    </span>
                  </button>
                  
                                    <div className="flex shrink-0 items-center gap-1 pr-2">
                    <button type="button" className="grid size-8 place-items-center rounded hover:bg-[#fff6ef] disabled:opacity-30" aria-label={`Move ${cat} up`} title="Move up" disabled={index === 0 || busy !== null} onClick={() => void moveCategory(index, -1)}><ChevronUp className="size-4" /></button>
                    <button type="button" className="grid size-8 place-items-center rounded hover:bg-[#fff6ef] disabled:opacity-30" aria-label={`Move ${cat} down`} title="Move down" disabled={index === categories.length - 1 || busy !== null} onClick={() => void moveCategory(index, 1)}><ChevronDown className="size-4" /></button>
                  </div>
<button
                    type="button"
                    className="flex min-h-11 flex-1 items-center justify-between pr-3 text-left text-sm text-ivory"
                    aria-expanded={open}
                    onClick={() => {
                      setOpenName(open ? null : cat);
                      setRemoveName(null);
                    }}
                  >
                    <span className={cn(!visible && "text-ivory-dim")}>{cat}</span>
                    <span className="text-xs text-ivory-dim">{open ? "Close" : "Edit"}</span>
                  </button>
                </div>
                {open ? (
                  <div className="grid gap-2 border-t border-hair px-3 py-3">
                    <form
                      className="flex flex-col gap-2 sm:flex-row"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const data = new FormData(e.currentTarget);
                        void rename(cat, String(data.get("name") ?? ""));
                      }}
                    >
                      <input className="field !min-h-10" name="name" defaultValue={cat} key={cat} maxLength={80} aria-label={`Rename ${cat}`} />
                      <button className="btn btn-outline shrink-0 !min-h-10 !px-3" type="submit" disabled={busy === cat}>Rename</button>
                    </form>
                    <div className="flex flex-wrap gap-2">
                      <label className="btn btn-outline !min-h-10 cursor-pointer !px-3">
                        {busy === cat ? "Saving…" : "Change PNG"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="sr-only"
                          disabled={busy === cat}
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            e.target.value = "";
                            void changeIcon(cat, file);
                          }}
                        />
                      </label>
                      {icons[cat] ? (
                        <button className="btn btn-outline !min-h-10 !px-3" type="button" disabled={busy === cat} onClick={() => void clearIcon(cat)}>Use default</button>
                      ) : null}
                      <button
                        className="btn btn-outline !min-h-10 !px-3 text-danger"
                        type="button"
                        disabled={busy === cat || categories.length <= 1}
                        onClick={() => {
                          setRemoveName(cat);
                          setMoveTo(others[0] ?? "");
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    {removeName === cat ? (
                      <div className="grid gap-2 rounded-xl bg-[#fff6ef] p-3">
                        <p className="text-sm text-ivory">Remove {cat}?</p>
                        {count > 0 ? (
                          <label className="grid gap-1 text-xs text-ivory-dim">
                            {count} {count === 1 ? "piece uses" : "pieces use"} this category. Move them to
                            <select className="field" value={moveTo} onChange={(e) => setMoveTo(e.target.value)}>
                              {others.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </label>
                        ) : (
                          <p className="text-sm text-ivory-dim">No jewellery is in this category.</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <button className="btn btn-gold !min-h-9 !px-3" type="button" disabled={busy === cat || (count > 0 && !moveTo)} onClick={() => void remove(cat)}>
                            {busy === cat ? "Removing…" : "Yes, remove"}
                          </button>
                          <button className="btn btn-outline !min-h-9 !px-3" type="button" onClick={() => setRemoveName(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
      ) : null}
    </section>
  );
}

function pieceRecency(id: string) {
  const m = /^j-(\d+)$/.exec(id);
  return m ? Number(m[1]) : 0;
}

function JewelleryForm({
  items,
  recentItems,
  recentLoading,
  recentError,
  categories,
  onLoadItems,
  itemsLoading,
  itemsError,
  onSaved,
  onCategoriesSaved,
}: {
  items: Jewellery[];
  recentItems: Jewellery[];
  recentLoading: boolean;
  recentError: string | null;
  categories: string[];
  onLoadItems: () => void;
  itemsLoading: boolean;
  itemsError: string | null;
  onSaved: (i: Jewellery[]) => void;
  onCategoriesSaved: (next: { categories: string[]; items: Jewellery[]; categoryIcons?: Record<string, string>; categoryShown?: Record<string, boolean> }) => void;
}) {
  const [editing, setEditing] = useState<Jewellery | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [metal, setMetal] = useState<"gold" | "silver">("silver");
  const [audiences, setAudiences] = useState<Audience[]>(["women"]);
  const [cats, setCats] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [shown, setShown] = useState(GALLERY_PAGE);
  const [listOpen, setListOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const formOpen = adding || Boolean(editing);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (formOpen && !dialog.open) dialog.showModal();
    else if (!formOpen && dialog.open) dialog.close();
  }, [formOpen]);
  const catOptions = categories.length ? categories : [...CATEGORIES];
  const selectedCats = cats.map((name) => catOptions.find((c) => c.toLowerCase() === name.toLowerCase())).filter((name): name is string => Boolean(name));
  const pieceCats = selectedCats;


  function load(item: Jewellery | null) {
    setEditing(item);
    setAdding(false);
    setPicked(null);
    setName(item?.name ?? "");
    setMetal(item?.metal ?? "silver");
    setAudiences(item ? audiencesOf(item) : ["women"]);
    setCats(item ? categoriesOf(item) : []);
    setDescription(item?.description ?? "");
    setImages(item?.images ?? []);
    setFeatured(item?.featured ?? false);
  }

  function startAdd() {
    load(null);
    setAdding(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      toast.error("Enter a name for this jewellery piece.");
      return;
    }
    if (!pieceCats.length) {
      toast.error("Choose at least one jewellery category");
      return;
    }
    if (!images.length) {
      toast.error("Upload at least one jewellery photo");
      return;
    }
    if (uploadingImages) {
      toast.error("Wait for the photo upload to finish before saving.");
      return;
    }
    setBusy(true);
    try {
      const next = await saveJewellery({ data: { id: editing?.id, name: cleanName, metal, cat: pieceCats[0], cats: pieceCats, audience: audiences[0] ?? "women", audiences, description: description.trim(), images, featured } });
      onSaved(next);
      load(null);
      setShown(GALLERY_PAGE);
      toast.success("Piece saved — it is on the store now");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally { setBusy(false); }
  }

  const newest = useMemo(
    () => items.slice().sort((a, b) => pieceRecency(b.id) - pieceRecency(a.id) || b.sortOrder - a.sortOrder),
    [items],
  );
  const head = newest.slice(0, shown);
  const remaining = newest.length - shown;

  async function removePiece(it: Jewellery) {
    if (!confirm(`Remove ${it.name}?`)) return;
    onSaved(await deleteJewellery({ data: { id: it.id } }));
    setPicked(null);
    toast.success("Piece removed");
  }

  function Tile({ it }: { it: Jewellery }) {
    const open = picked === it.id;
    return (
      <div className="relative">
        <button
          type="button"
          className="block aspect-square w-full overflow-hidden rounded-md bg-panel-2"
          onClick={() => setPicked(open ? null : it.id)}
          aria-label={it.name}
        >
          {it.images[0] ? (
            <img src={it.images[0]} alt={it.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full place-items-center font-display text-[0.65rem] tracking-label text-gold">GOBINDA</span>
          )}
        </button>
        {open ? (
          <div className="absolute inset-0 z-10 flex flex-col justify-end gap-1 bg-ink/75 p-1.5">
            <button type="button" className="btn btn-gold !min-h-9 !px-2 !text-[0.62rem]" onClick={() => load(it)}>Edit</button>
            <button type="button" className="btn btn-outline !min-h-9 !px-2 !text-[0.62rem] text-danger" onClick={() => void removePiece(it)}>Remove</button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <section className="surface p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">Add Jewellery</h2>
          </div>
          <button className="btn btn-gold" type="button" onClick={startAdd}>+ Add Jewellery</button>
        </div>
        {recentLoading ? <p className="mt-4 text-sm text-ivory-dim" role="status">Loading recent jewellery…</p> :
          recentError ? <p className="mt-4 text-sm text-ivory-dim" role="alert">Could not load recent jewellery: {recentError}</p> :
          recentItems.length ? <div className="mt-5 grid grid-cols-4 gap-2">{recentItems.slice(0, 4).map((it) => <Tile key={it.id} it={it} />)}</div> :
          <p className="mt-4 text-sm text-ivory-dim">No jewellery uploaded yet.</p>}


        <div className="mt-5 flex justify-center">
          <button className="btn btn-outline inline-flex items-center gap-2" type="button" aria-expanded={listOpen} onClick={() => {
            const opening = !listOpen;
            setListOpen(opening);
            if (opening) onLoadItems();
          }}>
            {listOpen ? <>Hide jewellery <ChevronUp className="size-4" /></> : <>Load jewellery list <ChevronDown className="size-4" /></>}
          </button>
        </div>
        {listOpen ? (
          itemsLoading ? <p className="mt-6 text-sm text-ivory-dim" role="status">Loading jewellery…</p> :
          itemsError ? <div className="mt-6 text-sm text-ivory-dim" role="alert"><p>Could not load jewellery: {itemsError}</p><button className="btn btn-outline mt-3" type="button" onClick={onLoadItems}>Try again</button></div> :
          newest.length ? (
            <>
              <div
                className="mt-6 max-h-[70vh] overflow-y-auto overscroll-contain pr-1"
                onScroll={(event) => {
                  const panel = event.currentTarget;
                  if (remaining > 0 && panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 80) {
                    setShown((count) => Math.min(newest.length, count + GALLERY_PAGE));
                  }
                }}
              >
                <div className="grid grid-cols-4 gap-2">
                  {head.map((it) => <Tile key={it.id} it={it} />)}
                </div>
                {remaining > 0 ? (
                  <button type="button" className="btn btn-outline mt-3 w-full" onClick={() => setShown((count) => Math.min(newest.length, count + GALLERY_PAGE))}>
                    Load more ({remaining} more)
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <p className="mt-6 text-sm text-ivory-dim">No jewellery uploaded yet.</p>
          )
        ) : null}

      </section>

      {formOpen ? (
        <dialog ref={dialogRef} onCancel={(event) => { event.preventDefault(); load(null); }} className="fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%-1rem)] max-w-2xl overflow-y-auto rounded-3xl border border-gold/20 bg-ink p-0 text-ivory shadow-2xl backdrop:bg-ink/75 backdrop:backdrop-blur-sm" aria-labelledby="jewellery-editor-title">
          <form className="flex flex-col gap-3 p-4 md:p-5" onSubmit={onSubmit}>
          <div className="flex items-start justify-between gap-3 border-b border-hair pb-3"><div><p id="jewellery-editor-title" className="font-display text-lg">{editing ? "Edit piece" : "New piece"}</p><p className="mt-1 text-xs text-ivory-dim">Add details, choose categories, and upload photos.</p></div><span className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[0.65rem] font-semibold tracking-wider text-gold">{editing ? "EDITING" : "NEW"}</span><button type="button" className="grid size-9 place-items-center rounded-full border border-hair text-ivory-dim hover:border-gold hover:text-gold" aria-label="Close jewellery editor" onClick={() => load(null)}><X className="size-4" /></button></div>
          <label className="grid gap-1.5 text-xs tracking-wide text-ivory-dim">Name
            <input className="field" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-xs tracking-wide text-ivory-dim">Metal
              <select className="field" value={metal} onChange={(e) => setMetal(e.target.value as "gold" | "silver")}>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
              </select>
            </label>
            <div className="grid gap-1.5 text-xs tracking-wide text-ivory-dim">
              <span>Audience</span>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Audience">
                {AUDIENCES.map((key) => {
                  const on = audiences.includes(key);
                  const label = key === "women" ? "Women" : key === "men" ? "Men" : key === "kids" ? "Kids" : "Others";
                  return (
                    <button
                      key={key}
                      type="button"
                      className={cn("chip", on && "is-on")}
                      aria-pressed={on}
                      onClick={() => {
                        setAudiences((prev) => {
                          if (prev.includes(key)) return prev.length > 1 ? prev.filter((a) => a !== key) : prev;
                          return [...prev, key];
                        });
                      }}
                    >
                      {on ? "✓ " : ""}{label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[0.68rem]">Tap Men, Women, Kids, or Others. A piece can be more than one.</p>
            </div>
          </div>
          <label className="relative z-20 grid gap-1.5 text-xs tracking-wide text-ivory-dim">Categories
            <CategoryField
              values={pieceCats}
              categories={catOptions}
              items={items}
              onChange={setCats}
              onSaved={onCategoriesSaved}
            />
          </label>
          <label className="grid gap-1.5 text-xs tracking-wide text-ivory-dim">Description
            <textarea className="field" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-sm text-ivory-dim">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Featured
          </label>
          <PhotoStrip
            images={images}
            addLabel="Upload jewellery photo"
            includeDimensions
            onAdd={(url) => setImages((prev) => [...prev, url].slice(0, 8))}
            onRemove={(src) => setImages((prev) => prev.filter((x) => x !== src))}
            onReorder={setImages}
            onBusyChange={setUploadingImages}
          />
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-gold" type="submit" disabled={busy || uploadingImages}>{uploadingImages ? "Uploading photos…" : busy ? "Saving…" : editing ? "Update piece" : "Save jewellery"}</button>
            <button className="btn btn-outline" type="button" onClick={() => load(null)}>Cancel</button>
          </div>
        </form>
        </dialog>
      ) : null}
    </>
  );
}

function BackupPanel({ onRestored }: { onRestored: (store: { items: Jewellery[]; rates: MetalRates; settings: StoreSettings; categories: string[]; categoryIcons?: Record<string, string>; categoryShown?: Record<string, boolean> }) => void }) {
  const [busy, setBusy] = useState<"down" | "up" | null>(null);
  const [uploadProgress, setUploadProgress] = useState("");

  async function authHeaders(): Promise<HeadersInit> {
    const token = getBearerToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function downloadBackup() {
    setBusy("down");
    try {
      const res = await fetch("/api/backup", { headers: await authHeaders() });
      if (!res.ok) throw new Error((await res.text()) || "Could not build backup.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gobinda-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Full backup downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not download backup");
    } finally {
      setBusy(null);
    }
  }

  async function restoreBackup(file: File) {
    if (!confirm("Restore this backup? Current jewellery, banner, profile and rates will be replaced. Uploads stay in the same media store.")) return;

    setBusy("up");
    setUploadProgress("Starting upload…");

    let uploadId = "";

    try {
      const chunkSize = 1_000_000;
      const totalChunks = Math.ceil(file.size / chunkSize);

      const startRes = await fetch("/api/backup-upload?action=start", {
        method: "POST",
        headers: {
          ...(await authHeaders()),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ size: file.size, chunks: totalChunks }),
      });

      if (!startRes.ok) throw new Error((await startRes.text()) || "Could not start upload.");

      const started = await startRes.json() as { uploadId: string };
      uploadId = started.uploadId;

      for (let index = 0; index < totalChunks; index++) {
        setUploadProgress(`Uploading part ${index + 1} of ${totalChunks}…`);

        const chunk = file.slice(index * chunkSize, Math.min((index + 1) * chunkSize, file.size));
        const headers = new Headers(await authHeaders());
        headers.set("Content-Type", "application/octet-stream");

        const chunkRes = await fetch(
          `/api/backup-upload?action=chunk&uploadId=${encodeURIComponent(uploadId)}&index=${index}`,
          {
            method: "POST",
            headers,
            body: chunk,
          }
        );

        if (!chunkRes.ok) throw new Error((await chunkRes.text()) || `Upload part ${index + 1} failed.`);
      }

      setUploadProgress("Restoring backup…");

      const finishRes = await fetch("/api/backup-upload?action=finish", {
        method: "POST",
        headers: {
          ...(await authHeaders()),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uploadId }),
      });

      if (!finishRes.ok) throw new Error((await finishRes.text()) || "Could not restore backup.");

      uploadId = "";
      const store = await getStorefront();
      onRestored(store);
      toast.success("Backup restored");
    } catch (err) {
      if (uploadId) {
        try {
          await fetch("/api/backup-upload?action=abort", {
            method: "POST",
            headers: {
              ...(await authHeaders()),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uploadId }),
          });
        } catch {
          // Expired uploads are cleaned up automatically.
        }
      }
      toast.error(err instanceof Error ? err.message : "Could not restore backup");
    } finally {
      setBusy(null);
      setUploadProgress("");
    }
  }

  return (
    <section className="surface p-6 md:p-8">
      <h2 className="font-display text-2xl">Backup</h2>
      <p className="mt-1 text-sm text-ivory-dim">
        Download jewellery, rates, house details, and every uploaded photo as one zip. Restore the same zip later without changing how new photos upload.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="btn btn-gold" type="button" disabled={busy !== null} onClick={() => void downloadBackup()}>
          <Download className="size-4" />
          {busy === "down" ? "Preparing…" : "Download Full Backup"}
        </button>
        <label className="btn btn-outline cursor-pointer">
          {busy === "up" ? "Restoring…" : "Restore from backup"}
          <input
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            disabled={busy !== null}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void restoreBackup(file);
            }}
          />
        </label>
      </div>
      {uploadProgress && (
        <p className="mt-4 text-sm text-ivory-dim">{uploadProgress}</p>
      )}
    </section>
  );
}

function StudioUsers({
  members,
  invites,
  currentUserId,
  onSaved,
}: {
  members: StudioMember[];
  invites: StudioInvite[];
  currentUserId: string;
  onSaved: (next: { members: StudioMember[]; invites: StudioInvite[] }) => void;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      onSaved(await inviteStudio({ data: { email } }));
      setEmail("");
      toast.success("Invite saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not invite");
    } finally { setBusy(false); }
  }

  return (
    <section className="surface p-6 md:p-8">
      <h2 className="font-display text-2xl">Studio users</h2>
      <p className="mt-1 text-sm text-ivory-dim">
        House admin is pavitrasanatan@gmail.com. Invite a person by email. They create their own password using that invited email, then sign in with email and password. You can remove anyone except the house admin.
      </p>
      <form className="mt-6 flex flex-wrap gap-3" onSubmit={onSubmit}>
        <input className="field max-w-sm" type="email" required placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn btn-gold" type="submit" disabled={busy}>Invite</button>
      </form>
      <ul className="mt-6 divide-y divide-hair">
        {members.map((m) => (
          <li key={m.userId} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span className="text-sm">
              {m.email}
              <span className="text-ivory-dim"> · {m.role === "owner" ? "admin" : "member"}</span>
            </span>
            {m.userId !== currentUserId && m.role !== "owner" ? (
              <button
                type="button"
                className="btn btn-outline !min-h-9 !px-3 text-danger"
                onClick={async () => {
                  if (!confirm(`Remove ${m.email} from the studio?`)) return;
                  try {
                    onSaved(await removeStudioMember({ data: { userId: m.userId } }));
                    toast.success("User removed");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not remove");
                  }
                }}
              >
                Remove
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      {invites.length ? (
        <>
          <h3 className="font-display mt-8 text-lg">Pending invites</h3>
          <ul className="mt-2 divide-y divide-hair">
            {invites.map((inv) => (
              <li key={inv.email} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="text-sm text-ivory-dim">{inv.email}</span>
                <button
                  type="button"
                  className="btn btn-outline !min-h-9 !px-3 text-danger"
                  onClick={async () => {
                    onSaved(await revokeStudioInvite({ data: { email: inv.email } }));
                    toast.success("Invite removed");
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

function PhotoStrip({
  images,
  addLabel,
  onAdd,
  onRemove,
  onReorder,
  onBusyChange,
  includeDimensions
}: {
  images: string[];
  addLabel: string;
  includeDimensions?: boolean;
  onAdd: (url: string) => void | Promise<void>;
  onRemove: (src: string) => void | Promise<void>;
  onReorder?: (next: string[]) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(0);
  const [dragged, setDragged] = useState<number | null>(null);

  async function uploadFiles(files: FileList | null, input: HTMLInputElement) {
    if (!files?.length) return;
    const available = Math.max(0, 8 - images.length);
    const chosen = Array.from(files).slice(0, available);
    input.value = "";

    if (!chosen.length) {
      toast.error("Maximum 8 photos allowed");
      return;
    }
    if (files.length > available) {
      toast.error(`Only ${available} more photo(s) can be added`);
    }

    setBusy(true);
    onBusyChange?.(true);
    try {
      for (const file of chosen) {
        const url = await uploadStudioPhoto(file, includeDimensions);
        await onAdd(url);
      }
      setSelected(images.length + chosen.length - 1);
      toast.success(`${chosen.length} photo(s) uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload photos");
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  function movePhoto(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [photo] = next.splice(from, 1);
    next.splice(to, 0, photo);
    void onRemove("__reorder__");
    setSelected(to);
  }

  return (
    <div className={cn("grid gap-3", includeDimensions && "order-first")}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs tracking-wide text-ivory-dim">Photos · {images.length}/8</span>
        <span className="text-[0.68rem] text-ivory-dim">First photo is the cover</span>
      </div>

      {images.length ? (
        <div className={cn("relative w-full max-w-md overflow-hidden rounded-xl border border-hair bg-panel-2", includeDimensions ? "aspect-[4/3]" : "aspect-square")}>
          <img
            src={images[Math.min(selected, images.length - 1)]}
            alt="Jewellery preview"
            className="h-full w-full object-contain"
          />
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs text-ivory">
            {selected === 0 ? "Cover photo" : `Photo ${selected + 1}`}
          </span>
          <button
            type="button"
            className="absolute right-3 top-3 rounded-full bg-ink/80 p-2 text-ivory"
            onClick={() => {
              void onRemove(images[selected]);
              setSelected(0);
            }}
            aria-label="Remove selected photo"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ) : (
        <div className={cn("grid w-full max-w-md place-items-center rounded-xl border border-dashed border-hair bg-panel-2 text-center", includeDimensions ? "aspect-[4/3]" : "aspect-square")}>
          <div>
            <ImagePlus className="mx-auto size-9 text-gold" />
            <p className="mt-2 text-sm text-ivory-dim">Add jewellery photos</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {images.map((src, index) => (
          <div
            key={`${src}-${index}`}
            draggable
            onDragStart={() => setDragged(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragged === null || dragged === index) return;
              const next = [...images];
              const [photo] = next.splice(dragged, 1);
              next.splice(index, 0, photo);
              onReorder?.(next);
              setSelected(index);
              setDragged(null);
            }}
            className="relative"
          >
            <button
              type="button"
              onClick={() => setSelected(index)}
              className={`size-[4.5rem] overflow-hidden rounded-lg border-2 ${selected === index ? "border-gold" : "border-hair"}`}
              aria-label={`Select photo ${index + 1}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
            <span className="absolute bottom-1 left-1 rounded bg-ink/80 px-1.5 text-[0.6rem] text-ivory">
              {index + 1}
            </span>
            {index === 0 ? (
              <span className="absolute -top-1 -right-1 rounded bg-gold px-1.5 text-[0.55rem] text-ink">Cover</span>
            ) : null}
            <div className="mt-1 flex justify-center gap-1">
              <button type="button" className="text-xs text-ivory-dim disabled:opacity-30" disabled={index === 0} onClick={() => {
                const next = [...images];
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                onReorder?.(next);
                setSelected(index - 1);
              }}>←</button>
              <button type="button" className="text-xs text-ivory-dim disabled:opacity-30" disabled={index === images.length - 1} onClick={() => {
                const next = [...images];
                [next[index], next[index + 1]] = [next[index + 1], next[index]];
                onReorder?.(next);
                setSelected(index + 1);
              }}>→</button>
            </div>
          </div>
        ))}
        {images.length < 8 ? (
          <label className="grid size-[4.5rem] cursor-pointer place-items-center rounded-lg border border-dashed border-hair text-ivory-dim">
            <span className="text-2xl">{busy ? "…" : "+"}</span>
            <span className="text-[0.6rem]">{busy ? "Uploading" : "Add photos"}</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
              className="hidden"
              disabled={busy}
              onChange={(e) => void uploadFiles(e.target.files, e.currentTarget)}
            />
          </label>
        ) : null}
      </div>
      <p className="text-[0.68rem] text-ivory-dim">
        Select multiple photos together. The first photo is used as the cover. Drag thumbnails or use arrows to reorder.
      </p>
    </div>
  );
}
