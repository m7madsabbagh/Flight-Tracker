"use client";

import type { AircraftFilters } from "@/types/aircraft";

interface Props {
  filters: AircraftFilters;
  onChange: (f: AircraftFilters) => void;
  onClose: () => void;
}

export function FilterPanel({ filters, onChange, onClose }: Props) {
  const set = <K extends keyof AircraftFilters>(key: K, value: AircraftFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="rounded-xl border border-aviation-border bg-aviation-card p-4 shadow-xl animate-fade-in">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-aviation-text">Filters</h3>
        <button onClick={onClose} className="text-aviation-muted hover:text-aviation-text text-lg leading-none">×</button>
      </div>

      <div className="space-y-4">
        {/* Status */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-aviation-muted uppercase tracking-wide">Status</p>
          <div className="flex gap-2">
            <FilterChip
              label="In Air"
              active={filters.inAirOnly}
              onClick={() => set("inAirOnly", !filters.inAirOnly)}
            />
            <FilterChip
              label="On Ground"
              active={filters.onGroundOnly}
              onClick={() => set("onGroundOnly", !filters.onGroundOnly)}
            />
          </div>
        </div>

        {/* Altitude */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-aviation-muted uppercase tracking-wide">Altitude (ft)</p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.altitudeMin ?? ""}
              onChange={(e) => set("altitudeMin", e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded border border-aviation-border bg-aviation-bg px-2 py-1.5 text-sm text-aviation-text placeholder-aviation-dim outline-none focus:border-aviation-accent"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.altitudeMax ?? ""}
              onChange={(e) => set("altitudeMax", e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded border border-aviation-border bg-aviation-bg px-2 py-1.5 text-sm text-aviation-text placeholder-aviation-dim outline-none focus:border-aviation-accent"
            />
          </div>
        </div>

        {/* Speed */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-aviation-muted uppercase tracking-wide">Speed (kts)</p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.speedMin ?? ""}
              onChange={(e) => set("speedMin", e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded border border-aviation-border bg-aviation-bg px-2 py-1.5 text-sm text-aviation-text placeholder-aviation-dim outline-none focus:border-aviation-accent"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.speedMax ?? ""}
              onChange={(e) => set("speedMax", e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded border border-aviation-border bg-aviation-bg px-2 py-1.5 text-sm text-aviation-text placeholder-aviation-dim outline-none focus:border-aviation-accent"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-aviation-muted uppercase tracking-wide">Country</p>
          <input
            type="text"
            placeholder="e.g. United States"
            value={filters.country}
            onChange={(e) => set("country", e.target.value)}
            className="w-full rounded border border-aviation-border bg-aviation-bg px-2 py-1.5 text-sm text-aviation-text placeholder-aviation-dim outline-none focus:border-aviation-accent"
          />
        </div>

        {/* Reset */}
        <button
          onClick={() =>
            onChange({
              searchQuery: filters.searchQuery,
              altitudeMin: null,
              altitudeMax: null,
              speedMin: null,
              speedMax: null,
              onGroundOnly: false,
              inAirOnly: false,
              country: "",
            })
          }
          className="w-full rounded border border-aviation-border py-1.5 text-xs text-aviation-muted hover:border-aviation-accent hover:text-aviation-accent transition-colors"
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-aviation-accent text-aviation-bg"
          : "border border-aviation-border text-aviation-muted hover:border-aviation-accent hover:text-aviation-accent"
      }`}
    >
      {label}
    </button>
  );
}
