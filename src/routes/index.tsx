import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Gallery } from "@/components/gallery";
import { HeroCarousel } from "@/components/hero-carousel";
import { Lightbox } from "@/components/lightbox";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFab } from "@/components/whatsapp";
import { pushPieceEntry, readPieceEntry, replacePiecePhoto, retreatOverlay, seedDirectPiece } from "@/lib/overlay-history";
import { parsePieceShare } from "@/lib/share-piece";
import { getStorefront } from "@/lib/server/store";
import type { Jewellery } from "@/lib/types";

export const Route = createFileRoute("/")({
  loader: () => getStorefront(),
  component: Home,
});

function photoIndex(item: Jewellery, photo: number) {
  const last = Math.max(0, item.images.length - 1);
  return Math.min(Math.max(photo, 0), last);
}

function Home() {
  const { items, rates, settings, categories, categoryIcons, categoryShown } = Route.useLoaderData();
  const [open, setOpen] = useState<{ item: Jewellery; index: number } | null>(null);
  const scrollY = useRef(0);
  const closingPiece = useRef(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  function showPiece(id: string, photo: number) {
    const item = itemsRef.current.find((it) => it.id === id);
    if (!item) {
      setOpen(null);
      return false;
    }
    setOpen({ item, index: photoIndex(item, photo) });
    return true;
  }

  function openPiece(item: Jewellery, photo = 0) {
    const index = photoIndex(item, photo);
    if (!readPieceEntry()) {
      scrollY.current = Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0);
    }
    pushPieceEntry(item.id, index);
    setOpen({ item, index });
  }

  function closePiece() {
    const current = readPieceEntry();
    if (!current) {
      setOpen(null);
      return;
    }
    if (closingPiece.current) return;
    closingPiece.current = true;
    retreatOverlay(current.depth);
  }

  useEffect(() => {
    const onPop = () => {
      closingPiece.current = false;
      const piece = readPieceEntry();
      if (!piece) {
        setOpen(null);
        const y = scrollY.current;
        window.requestAnimationFrame(() => window.scrollTo(0, y));
        return;
      }
      showPiece(piece.id, piece.photo);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const existing = readPieceEntry();
    if (existing) {
      showPiece(existing.id, existing.photo);
      return;
    }
    const { piece, photo } = parsePieceShare(window.location.search);
    if (!piece) return;
    const item = items.find((it) => it.id === piece);
    if (!item) return;
    const index = photoIndex(item, photo);
    seedDirectPiece(item.id, index);
    setOpen({ item, index });
    window.requestAnimationFrame(() => {
      document.getElementById("gallery")?.scrollIntoView({ block: "start" });
    });
  }, [items]);

  return (
    <main id="top">
      <SiteHeader rates={rates} profile={settings} />
      <HeroCarousel images={settings.heroImages} />
      <Gallery items={items} categories={categories} categoryIcons={categoryIcons} categoryShown={categoryShown} onOpen={(item) => openPiece(item, 0)} />
      <SiteFooter />
      <WhatsAppFab />
      {open ? (
        <Lightbox
          item={open.item}
          items={items}
          index={open.index}
          onIndex={(index) => {
            setOpen({ item: open.item, index });
            replacePiecePhoto(index);
          }}
          onPick={(item) => openPiece(item, 0)}
          onClose={closePiece}
        />
      ) : null}
    </main>
  );
}