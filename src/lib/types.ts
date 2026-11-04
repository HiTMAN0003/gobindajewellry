export const CATEGORIES = [
  "Necklaces",
  "Earrings",
  "Rings",
  "Bangles",
  "Bracelets",
  "Anklets",
  "Bridal Jewellery",
  "Handcrafted Designs",
] as const;

export const AUDIENCES = ["men", "women", "kids", "others"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Audience = (typeof AUDIENCES)[number];
export type Metal = "gold" | "silver";

export type Jewellery = {
  id: string;
  name: string;
  metal: Metal;
  cat: string;
  cats?: string[];
  audience: Audience;
  audiences?: Audience[];
  description: string;
  images: string[];
  featured: boolean;
  sortOrder: number;
};

export function categoriesOf(item: { cat: string; cats?: string[] }): string[] {
  const raw = item.cats?.length ? item.cats : [item.cat];
  const out: string[] = [];
  for (const name of raw) {
    const n = String(name ?? "").trim();
    if (!n) continue;
    if (!out.some((x) => x.toLowerCase() === n.toLowerCase())) out.push(n);
  }
  if (!out.length && item.cat) out.push(item.cat);
  return out;
}

export function audiencesOf(item: { audience?: string; audiences?: string[] }): Audience[] {
  const raw = item.audiences?.length ? item.audiences : [item.audience ?? "women"];
  const out: Audience[] = [];
  for (const name of raw) {
    const v = String(name ?? "").trim().toLowerCase();
    const next: Audience | null =
      v === "men" || v === "man" || v === "male"
        ? "men"
        : v === "kids" || v === "kid" || v === "child" || v === "children"
          ? "kids"
          : v === "women" || v === "woman" || v === "female"
            ? "women"
            : v === "others" || v === "other"
              ? "others"
              : null;
    if (next && !out.includes(next)) out.push(next);
  }
  if (!out.length) out.push("women");
  return out;
}

export type MetalRates = {
  goldPerTola: number;
  silverPerKg: number;
  asOf: string | null;
};

export type StoreSettings = {
  founderName: string;
  founderImage: string;
  heroImages: string[];
};

export type Storefront = {
  items: Jewellery[];
  rates: MetalRates;
  settings: StoreSettings;
  categories: string[];
  categoryIcons: Record<string, string>;
  categoryShown: Record<string, boolean>;
};

export type StudioInvite = {
  email: string;
  createdAt: string;
};

export type StudioMember = {
  userId: string;
  email: string;
  role: string;
};
