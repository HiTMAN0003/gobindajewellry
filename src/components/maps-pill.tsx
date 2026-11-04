import { ArrowRight, MapPin } from "lucide-react";
import { MAPS_URL } from "@/lib/store-info";
import { cn } from "@/lib/utils";

export function MapsPill({ className }: { className?: string }) {
  return (
    <a
      href={MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("btn btn-maps font-sans whitespace-nowrap", className)}
    >
      <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
      Open in Google Maps
      <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />
    </a>
  );
}
