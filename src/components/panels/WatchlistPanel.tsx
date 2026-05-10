"use client";

import type { Aircraft } from "@/types/aircraft";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatAltitude, formatSpeed } from "@/utils/format";

interface Props {
  watchlist: Set<string>;
  aircraft: Aircraft[];
  onSelect: (a: Aircraft) => void;
  onRemove: (icao24: string) => void;
  onClose: () => void;
}

export function WatchlistPanel({ watchlist, aircraft, onSelect, onRemove, onClose }: Props) {
  const watched = aircraft.filter((a) => watchlist.has(a.icao24));
  const missingIcaos = [...watchlist].filter((id) => !aircraft.find((a) => a.icao24 === id));

  return (
    <div className="flex h-full flex-col animate-slide-in">
      <div className="flex items-center justify-between border-b border-aviation-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-aviation-text">Watchlist</span>
          <Badge variant="accent">{watchlist.size}</Badge>
        </div>
        <button onClick={onClose} className="text-aviation-muted hover:text-aviation-text">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {watchlist.size === 0 ? (
          <EmptyState
            icon="★"
            title="No aircraft watched"
            description="Click ☆ on any aircraft to add it to your watchlist."
          />
        ) : (
          <>
            {watched.map((a) => (
              <WatchedRow
                key={a.icao24}
                aircraft={a}
                onSelect={() => onSelect(a)}
                onRemove={() => onRemove(a.icao24)}
              />
            ))}
            {missingIcaos.map((id) => (
              <div
                key={id}
                className="flex items-center justify-between px-4 py-2 opacity-40"
              >
                <span className="text-xs font-mono text-aviation-muted">{id.toUpperCase()} — not in range</span>
                <button
                  onClick={() => onRemove(id)}
                  className="text-aviation-muted hover:text-aviation-danger text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function WatchedRow({
  aircraft,
  onSelect,
  onRemove,
}: {
  aircraft: Aircraft;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="group flex items-center justify-between px-4 py-2.5 hover:bg-aviation-card/50 transition-colors">
      <button className="flex-1 text-left" onClick={onSelect}>
        <p className="text-sm font-mono font-medium text-aviation-text">
          {aircraft.callsign ?? "NO CALLSIGN"}
        </p>
        <p className="text-xs text-aviation-muted mt-0.5">
          {aircraft.icao24.toUpperCase()} · {aircraft.originCountry}
        </p>
        <div className="mt-1 flex gap-3 text-xs text-aviation-dim">
          <span>{formatAltitude(aircraft.baroAltitude)}</span>
          <span>{formatSpeed(aircraft.velocity)}</span>
          <span>{aircraft.onGround ? "Ground" : "In Air"}</span>
        </div>
      </button>
      <button
        onClick={onRemove}
        className="ml-2 p-1 text-aviation-warning opacity-0 group-hover:opacity-100 transition-opacity hover:text-aviation-danger"
        title="Remove from watchlist"
      >
        ★
      </button>
    </div>
  );
}
