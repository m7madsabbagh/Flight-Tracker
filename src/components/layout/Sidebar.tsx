"use client";

import type { Aircraft } from "@/types/aircraft";
import { AircraftDetailPanel } from "@/components/panels/AircraftDetailPanel";
import { WatchlistPanel } from "@/components/panels/WatchlistPanel";

type SidebarMode = "detail" | "watchlist" | null;

interface Props {
  mode: SidebarMode;
  selectedAircraft: Aircraft | null;
  watchlist: Set<string>;
  allAircraft: Aircraft[];
  isWatched: boolean;
  following: boolean;
  onToggleWatch: () => void;
  onFollow: () => void;
  onSelectAircraft: (a: Aircraft) => void;
  onRemoveWatch: (icao24: string) => void;
  onClose: () => void;
}

export function Sidebar({
  mode,
  selectedAircraft,
  watchlist,
  allAircraft,
  isWatched,
  following,
  onToggleWatch,
  onFollow,
  onSelectAircraft,
  onRemoveWatch,
  onClose,
}: Props) {
  if (!mode) return null;

  return (
    <aside className="w-full sm:w-80 lg:w-96 shrink-0 border-l border-aviation-border bg-aviation-panel flex flex-col overflow-hidden">
      {mode === "detail" && selectedAircraft ? (
        <AircraftDetailPanel
          aircraft={selectedAircraft}
          isWatched={isWatched}
          onToggleWatch={onToggleWatch}
          onFollow={onFollow}
          following={following}
          onClose={onClose}
        />
      ) : mode === "watchlist" ? (
        <WatchlistPanel
          watchlist={watchlist}
          aircraft={allAircraft}
          onSelect={(a) => { onSelectAircraft(a); }}
          onRemove={onRemoveWatch}
          onClose={onClose}
        />
      ) : null}
    </aside>
  );
}
