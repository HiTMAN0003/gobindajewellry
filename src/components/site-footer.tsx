import { Clock, Instagram, MapPin, Phone } from "lucide-react";
import {
  INSTAGRAM_URL,
  STORE_ADDRESS_LINES,
  STORE_HOURS,
  STORE_HOURS_NOTE,
  STORE_PHONE_DISPLAY,
  STORE_REGION,
  TEL_URL,
  WHATSAPP_URL,
} from "@/lib/store-info";
import { MapsPill } from "./maps-pill";
import { WhatsAppGlyph } from "./whatsapp";

const QUICK_LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/#gallery", label: "Jewellery Gallery" },
];

function LotusMark() {
  return (
    <svg viewBox="0 0 36 22" className="h-5 w-8 text-gold" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 20c-1.6-2.8-2.5-5.5-2.5-7.6 0-1.8 1.1-3.5 2.5-4.3 1.4.8 2.5 2.5 2.5 4.3 0 2.1-.9 4.8-2.5 7.6Z" />
      <path d="M18 20c-3.4-2-6.5-3-8.6-2.6-1.7.3-3 1.6-3.4 3.2 2.8.4 6.6.2 12-.6Z" />
      <path d="M18 20c3.4-2 6.5-3 8.6-2.6 1.7.3 3 1.6 3.4 3.2-2.8.4-6.6.2-12-.6Z" />
      <path d="M18 8.2c-1.4-2.6-1.2-5.2.2-6.6 1.6 1.2 2.4 3.6 1.6 6.2" />
      <path d="M14.2 9.4c-2.4-1.6-4.6-1.5-5.8-.2 1.2 1.6 3.2 2.4 5.4 2.2" />
      <path d="M21.8 9.4c2.4-1.6 4.6-1.5 5.8-.2-1.2 1.6-3.2 2.4-5.4 2.2" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="pt-10 pb-8 md:pt-14">
      <div className="wrap">
        <div className="surface overflow-hidden">
          <div className="grid md:grid-cols-[minmax(0,1.2fr)_1px_minmax(0,0.95fr)]">
            <div className="px-5 py-6 md:px-8 md:py-8">
              <p className="label kicker justify-center">Visit our store</p>
              <div className="mt-5 flex items-start gap-3">
                <MapPin className="mt-1 size-5 shrink-0 text-gold" aria-hidden="true" />
                <div>
                  <p className="font-display text-xl leading-snug text-ivory md:text-2xl">{STORE_ADDRESS_LINES[0]}</p>
                  <p className="font-display text-xl leading-snug text-ivory md:text-2xl">{STORE_ADDRESS_LINES[1]}</p>
                  <p className="mt-3 text-[0.62rem] tracking-[0.18em] text-gold uppercase">We would love to welcome you</p>
                </div>
              </div>
              <div className="mt-6 md:mt-7">
                <MapsPill />
              </div>
            </div>
            <div className="hidden bg-hair md:block" aria-hidden="true" />
            <div className="grid gap-5 border-t border-hair px-5 py-6 md:border-t-0 md:px-8 md:py-8 md:content-center">
              <a href={TEL_URL} className="flex items-center gap-3.5 text-left transition-colors duration-300 hover:text-gold-light">
                <span className="footer-icon">
                  <Phone className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.62rem] tracking-[0.16em] text-gold uppercase">Call us</span>
                  <span className="mt-0.5 block text-sm text-ivory">{STORE_PHONE_DISPLAY}</span>
                </span>
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3.5 text-left transition-colors duration-300 hover:text-gold-light">
                <span className="footer-icon">
                  <WhatsAppGlyph className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.62rem] tracking-[0.16em] text-gold uppercase">WhatsApp us</span>
                  <span className="mt-0.5 block text-sm text-ivory">Chat with us</span>
                </span>
              </a>
              <div className="flex items-center gap-3.5">
                <span className="footer-icon">
                  <Clock className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.62rem] tracking-[0.16em] text-gold uppercase">Store timings</span>
                  <span className="mt-0.5 block text-sm text-ivory">{STORE_HOURS} {STORE_HOURS_NOTE}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 mb-10 text-center md:mt-14">
          <p className="font-display text-2xl tracking-brand text-ivory md:text-3xl">GOBINDA JEWELLERS</p>
          <p className="mt-2 text-[0.68rem] tracking-label text-gold lowercase">timeless beauty · eternal trust</p>
          <div className="mt-5 flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-linear-to-r from-transparent to-gold/50" />
            <LotusMark />
            <span className="h-px w-16 bg-linear-to-l from-transparent to-gold/50" />
          </div>
          <p className="mt-3 text-[0.62rem] tracking-[0.2em] text-gold uppercase">Since generations</p>
        </div>

        <div className="grid border-b border-hair pb-10 sm:grid-cols-2">
          <div className="sm:pr-10">
            <h4 className="mb-4 text-[0.62rem] tracking-[0.18em] text-gold uppercase">Quick links</h4>
            <nav className="grid gap-2">
              {QUICK_LINKS.map((item) => (
                <a key={item.label} href={item.href} className="text-sm text-ivory-dim transition-colors duration-300 hover:text-gold-light">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="mt-10 border-t border-hair pt-10 text-center sm:mt-0 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-10">
            <h4 className="mb-5 text-[0.62rem] tracking-[0.18em] text-gold uppercase">Social accounts</h4>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="footer-ig" aria-label="Gobinda Jewellers on Instagram">
              <Instagram className="size-5" aria-hidden="true" />
            </a>
            <p className="mt-3 text-sm text-ivory-dim">Follow our journey</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-7 text-xs text-ivory-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Gobinda Jewellers
            <span className="mt-1 block">All rights reserved.</span>
          </p>
          <div className="hidden h-8 w-px bg-hair sm:block" aria-hidden="true" />
          <p className="sm:text-right">
            {STORE_REGION}
            <span className="mt-1 block">Crafted with care, for generations.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
