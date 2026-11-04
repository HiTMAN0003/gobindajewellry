const CAT_ICONS: { test: RegExp; src: string }[] = [
  { test: /ear|jhumka|bali|tops?/i, src: "/images/cat-icons/earrings.png" },
  { test: /ring/i, src: "/images/cat-icons/rings.png" },
  { test: /bangle|bajuband|kada|kangan/i, src: "/images/cat-icons/bangle.png" },
  { test: /bracelet|chain/i, src: "/images/cat-icons/bracelet.png" },
  { test: /anklet|payal|pajeb/i, src: "/images/cat-icons/bracelet.png" },
  { test: /mangal|bridal|wedding/i, src: "/images/cat-icons/pendant.png" },
  { test: /neck|haar|haram|pendant|mala/i, src: "/images/cat-icons/necklace.png" },
];

const CAT_FALLBACK = [
  "/images/cat-icons/necklace.png",
  "/images/cat-icons/bangle.png",
  "/images/cat-icons/rings.png",
  "/images/cat-icons/earrings.png",
  "/images/cat-icons/bracelet.png",
  "/images/cat-icons/bridal.png",
  "/images/cat-icons/pendant.png",
];

export function categoryIcon(name: string) {
  const hit = CAT_ICONS.find((rule) => rule.test.test(name));
  if (hit) return hit.src;
  let n = 0;
  for (const ch of name) n = (n + ch.charCodeAt(0)) % CAT_FALLBACK.length;
  return CAT_FALLBACK[n] ?? CAT_FALLBACK[0];
}

export function iconFor(name: string, icons?: Record<string, string>) {
  if (icons) {
    if (icons[name]) return icons[name];
    const key = Object.keys(icons).find((k) => k.toLowerCase() === name.toLowerCase());
    if (key && icons[key]) return icons[key];
  }
  return categoryIcon(name);
}
