import { STORE_LOCATION } from "@/lib/store-info";
import type { StoreSettings } from "@/lib/types";
import { MapsPill } from "./maps-pill";

export function MenuHouse({ settings }: { settings: Pick<StoreSettings, "founderName" | "founderImage"> }) {
  return (
    <div className="grid gap-4">
      <div className="house-card items-center gap-3">
        <img src={settings.founderImage} alt={settings.founderName} className="portrait size-16 shrink-0 rounded-full object-cover" />
        <div className="min-w-0">
          <p className="label kicker">the house</p>
          <h2 className="font-display mt-1 text-xl leading-tight text-ivory">The House of Gobinda</h2>
          <p className="mt-1 text-sm leading-snug text-ivory-dim">3 generations of goldsmiths, uncompromising standard</p>
        </div>
      </div>
      <div className="grid gap-3">
        <p className="font-display text-[1.65rem] leading-tight text-ivory">{STORE_LOCATION}</p>
        <MapsPill className="w-fit" />
      </div>
    </div>
  );
}
