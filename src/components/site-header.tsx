import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { inr } from "@/lib/format";
import { pushMenuEntry, readMenuEntry, retreatOverlay } from "@/lib/overlay-history";
import { STORE_REGION } from "@/lib/store-info";
import type { MetalRates, StoreSettings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MenuHouse } from "./profile-section";
import { WhatsAppButton } from "./whatsapp";

const NAV = [
  { href: "/#top", label: "Home" },
  { href: "/#gallery", label: "Gallery" },
];

function readScrollY(): number {
  return Math.max(
    window.scrollY || 0,
    window.pageYOffset || 0,
    document.documentElement.scrollTop || 0,
    document.body.scrollTop || 0,
    document.scrollingElement?.scrollTop || 0,
  );
}

export function SiteHeader({
  rates,
  profile,
  overlay = false,
}: {
  rates?: MetalRates;
  profile?: Pick<StoreSettings, "founderName" | "founderImage">;
  overlay?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const closingMenu = useRef(false);

  function presentMenu() {
    if (!readMenuEntry()) pushMenuEntry();
    setOpen(true);
  }

  function dismissMenu(after?: () => void) {
    if (!readMenuEntry()) {
      setOpen(false);
      after?.();
      return;
    }
    if (closingMenu.current) return;
    closingMenu.current = true;
    if (after) {
      const once = () => {
        window.removeEventListener("popstate", once);
        after();
      };
      window.addEventListener("popstate", once);
    }
    retreatOverlay(1);
  }

  useEffect(() => {
    const onPop = () => {
      closingMenu.current = false;
      setOpen(readMenuEntry());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    let ticking = false;
    const update = () => { ticking = false; setScrolled(readScrollY() > 8); };
    const onScroll = () => { if (ticking) return; ticking = true; requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", onScroll, true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const solid = !overlay || scrolled;
  const hideRates = scrolled || open;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 overflow-hidden border-b transition-[padding,background-color,border-color] duration-500 ease-out",
          "pt-[calc(env(safe-area-inset-top,0px)+var(--hdr-y))]",
          solid
            ? "[--hdr-y:0.75rem] border-gold/20 bg-ink/80 pb-3 shadow-[0_10px_28px_rgb(160_100_60_/_10%)] backdrop-blur-xl"
            : "[--hdr-y:1.25rem] border-transparent bg-transparent pb-5",
        )}
      >
        <div className="wrap flex items-center justify-between gap-3">
          <Link to="/" className="min-w-0 shrink">
            <span className="font-display block truncate text-lg tracking-brand text-ivory md:text-xl">GOBINDA JEWELLERS</span>
            <span className="mt-1.5 block truncate text-[0.62rem] tracking-label text-gold lowercase">timeless beauty · eternal trust</span>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="relative pb-1 text-sm whitespace-nowrap text-ivory-dim transition-colors duration-300 hover:text-ivory after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-[width] after:duration-300 hover:after:w-full">
                {item.label}
              </a>
            ))}
          </nav>
          <WhatsAppButton className="hidden shrink-0 lg:inline-flex" />
          <button type="button" className="grid size-11 shrink-0 place-items-center text-ivory lg:hidden" aria-label={open ? "Close menu" : "Open menu"} onClick={() => (open ? dismissMenu() : presentMenu())}>
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
        {rates ? (
          <div className={cn("grid transition-[grid-template-rows,opacity] duration-500 ease-out", hideRates ? "pointer-events-none grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100")}>
            <div className="min-h-0 overflow-hidden">
              <div id="header-rates" aria-hidden={hideRates} className="wrap mt-3 flex flex-col gap-1.5 border-t border-hair pt-2.5 pb-0.5 text-[0.68rem] text-ivory-dim sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="shrink-0 tracking-label text-gold lowercase">{STORE_REGION} · metal rate</span>
                <span className="flex items-center gap-3 whitespace-nowrap">
                  <span>Gold <b className="font-medium text-gold-light">{rates.goldPerTola > 0 ? inr(rates.goldPerTola) : "—"}</b>/tola</span>
                  <span className="opacity-30">|</span>
                  <span>Silver <b className="font-medium text-gold-light">{rates.silverPerKg > 0 ? inr(rates.silverPerKg) : "—"}</b>/tola</span>
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </header>
      <div className={cn("fixed inset-0 z-[60] flex flex-col gap-6 overflow-y-auto bg-ink px-6 pt-20 pb-10 transition-[transform,opacity] duration-500 ease-out lg:hidden", open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0")} aria-hidden={!open}>
        <button type="button" className="absolute top-5 right-5 grid size-11 place-items-center text-ivory" aria-label="Close menu" onClick={() => dismissMenu()}>
          <X className="size-6" />
        </button>
        {profile ? <MenuHouse settings={profile} /> : null}
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              const id = item.href.split("#")[1] ?? "";
              dismissMenu(() => {
                if (!id) return;
                document.getElementById(id)?.scrollIntoView();
              });
            }}
            className="font-display text-3xl text-ivory"
          >
            {item.label}
          </a>
        ))}
        {rates ? (
          <p className="text-sm text-ivory-dim">
            {STORE_REGION} · metal rate · Gold {rates.goldPerTola > 0 ? inr(rates.goldPerTola) : "—"}/tola · Silver {rates.silverPerKg > 0 ? inr(rates.silverPerKg) : "—"}/tola
          </p>
        ) : null}
        <WhatsAppButton />
        <Link
          to="/admin"
          onClick={(e) => {
            e.preventDefault();
            dismissMenu(() => {
              void navigate({ to: "/admin" });
            });
          }}
          className="text-sm tracking-wide text-gold"
        >
          Private Studio
        </Link>
      </div>
    </>
  );
}
