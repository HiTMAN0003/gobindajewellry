import { audiencesOf, categoriesOf, type Jewellery } from "@/lib/types";

type Term = { canon: string; label: string; words: string[] };

const TERMS: Term[] = [
  { canon: "necklace", label: "Necklace", words: ["necklace", "necklaces", "haar", "har", "mala", "haar", "हार"] },
  { canon: "mangalsutra", label: "Mangalsutra", words: ["mangalsutra", "mangalsutr", "mangal", "thali"] },
  { canon: "earring", label: "Earrings", words: ["earring", "earrings", "earing", "earings", "jhumka", "jhumke", "jhumki", "tops", "bali", "कान"] },
  { canon: "ring", label: "Ring", words: ["ring", "rings", "anguthi", "angoothi", "अंगूठी"] },
  { canon: "bracelet", label: "Bracelet", words: ["bracelet", "bracelets", "braclet", "कड़ा"] },
  { canon: "bangle", label: "Bangles", words: ["bangle", "bangles", "churi", "choodi", "chudi", "kangan"] },
  { canon: "anklet", label: "Anklets", words: ["anklet", "anklets", "payal", "pajeb", "pajebi", "पायल"] },
  { canon: "gold", label: "Gold", words: ["gold", "goold", "golds", "sona", "sone", "suna", "सोना"] },
  { canon: "silver", label: "Silver", words: ["silver", "silvar", "chandi", "chaandi", "chandi", "rupa", "चांदी", "चाँदी"] },
  { canon: "bridal", label: "Bridal", words: ["bridal", "bride", "dulhan", "wedding", "shaadi", "shadi"] },
  { canon: "pendant", label: "Pendant", words: ["pendant", "pendent", "locket"] },
  { canon: "chain", label: "Chain", words: ["chain", "chains"] },
  { canon: "nosepin", label: "Nose pin", words: ["nosepin", "nose", "nath", "nathni"] },
  { canon: "kada", label: "Kada", words: ["kada", "kara"] },
  { canon: "temple", label: "Temple", words: ["temple"] },
  { canon: "polki", label: "Polki", words: ["polki"] },
  { canon: "kundan", label: "Kundan", words: ["kundan"] },
  { canon: "meenakari", label: "Meenakari", words: ["meenakari", "meena"] },
  { canon: "men", label: "Men", words: ["men", "man", "gents", "purush"] },
  { canon: "women", label: "Women", words: ["women", "woman", "ladies", "mahila"] },
  { canon: "kids", label: "Kid", words: ["kid", "kids", "child", "baby", "baccha"] },
  { canon: "set", label: "Set", words: ["set", "combo"] },
];

const ALIAS = new Map<string, Term>();
for (const term of TERMS) {
  ALIAS.set(term.canon, term);
  for (const word of term.words) ALIAS.set(word, term);
}

export type SmartHit = {
  items: Jewellery[];
  loose: boolean;
  interpreted: string;
};

function wordsOf(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f]+/gi, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

function distance(a: string, b: string) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 9;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    const cur = [i];
    for (let j = 1; j <= b.length; j += 1) {
      cur[j] = Math.min(
        cur[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[b.length];
}

function allowance(token: string) {
  if (token.length <= 4) return 1;
  return 2;
}

function correct(token: string): Term | null {
  const exact = ALIAS.get(token);
  if (exact) return exact;
  if (token.length < 4) return null;
  let best: Term | null = null;
  let bestDist = allowance(token) + 1;
  for (const term of TERMS) {
    const candidates = [term.canon, ...term.words];
    for (const word of candidates) {
      if (word.length < 4) continue;
      const gap = distance(token, word);
      if (gap < bestDist) {
        best = term;
        bestDist = gap;
      }
    }
  }
  return bestDist <= allowance(token) ? best : null;
}

function productTokens(item: Jewellery) {
  const audience = audiencesOf(item).map((name) => (name === "kids" ? "kid" : name));
  const raw = wordsOf([item.name, item.description, item.metal, ...categoriesOf(item), ...audience].join(" "));
  const extra: string[] = [];
  for (const word of raw) {
    const term = ALIAS.get(word) ?? (word.length >= 5 ? correct(word) : null);
    if (term) extra.push(term.canon);
  }
  if (item.metal === "gold") extra.push("gold", "sona");
  if (item.metal === "silver") extra.push("silver", "chandi");
  return new Set([...raw, ...extra]);
}

function tokenCost(token: string, canon: string | null, hay: Set<string>, name: Set<string>) {
  const keys = canon ? [canon, token] : [token];
  for (const key of keys) {
    if (hay.has(key) || name.has(key)) return name.has(key) ? 0 : 0.4;
  }
  let best = 8;
  for (const word of hay) {
    if (token.length >= 3 && word.startsWith(token) && (token.length >= 4 || word.length - token.length <= 2)) {
      best = Math.min(best, name.has(word) ? 0.6 : 1);
      continue;
    }
    if (token.length < 4 || word.length < 4) continue;
    const gap = distance(token, word);
    if (gap <= allowance(token)) best = Math.min(best, gap + (name.has(word) ? 0 : 0.4));
  }
  return best;
}

export function searchJewellery(items: Jewellery[], query: string): SmartHit {
  const tokens = wordsOf(query);
  if (!tokens.length) return { items, loose: false, interpreted: "" };
  const corrected = tokens.map((token) => ({ token, term: correct(token) }));
  const interpreted = corrected.map((part) => part.term?.label ?? part.token).join(" ");
  const ranked = items.map((item) => {
    const hay = productTokens(item);
    const name = new Set(wordsOf(item.name));
    for (const word of name) {
      const term = ALIAS.get(word);
      if (term) name.add(term.canon);
    }
    const score = corrected.reduce((sum, part) => sum + tokenCost(part.token, part.term?.canon ?? null, hay, name), 0);
    return { item, score };
  });
  ranked.sort((a, b) => a.score - b.score || a.item.name.localeCompare(b.item.name));
  const good = ranked.filter((row) => row.score <= Math.max(2, tokens.length * 1.6));
  const loose = good.length === 0;
  const picked = (loose ? ranked.slice(0, 8) : good).map((row) => row.item);
  return { items: picked, loose, interpreted };
}
